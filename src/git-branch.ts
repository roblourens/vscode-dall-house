import * as vscode from 'vscode';
import * as os from 'os';
import { generateAndDownloadAiImageWithKey, generateAndDownloadAiImageWithTextCheck, textRequest } from './openai';
import OpenAI from 'openai';
import { API as GitAPI, GitExtension } from './git';
import { getArtStyleAndFeelPart, getCuteArtStyleAndFeelPart } from './promptUtils';

export class GitBranchWebviewProvider implements vscode.WebviewViewProvider {
	private _view: vscode.WebviewView | undefined;
	private _lastImage: string | undefined;
	private _isRefreshing: boolean = false;
	private _gitAPI: GitAPI | undefined;

	constructor(
		private readonly _extensionContext: vscode.ExtensionContext,
		private readonly _outputChannel: vscode.OutputChannel,
	) {
		this._initGitExtension();
	}

	private _initGitExtension() {
		if (!this._gitAPI) {
			const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
			if (gitExtension?.isActive) {
				this._gitAPI = gitExtension.exports.getAPI(1);
			}
		}
	}

	private _register(disposable: vscode.Disposable) {
		this._extensionContext.subscriptions.push(disposable);
	}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionContext.extensionUri,
				vscode.Uri.file(os.tmpdir())
			]
		};
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		this._register(this._view.onDidChangeVisibility(() => {
			if (this._lastImage) {
				// Webview is unloaded when we switch away?
				this.loadImageInWebview(this._lastImage);
			}

			// this.refresh();
		}));

		// Initialize with lastImage from globalState.
		// Don't refresh initially. Require the user to start using vscode (listen to text changes) or to click the refresh button.
		const last = this._extensionContext.globalState.get<string>('lastBranchImage');
		if (last) {
			this.loadImageInWebview(last);
		}
	}

	open() {
		if (!this._lastImage) {
			return;
		}

		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(this._lastImage));
	}

	async refresh(force?: boolean) {
		if (!this._view?.visible || this._isRefreshing) {
			return;
		}

		const seed = force ? String(Math.random()) : '';

		try {
			vscode.commands.executeCommand('setContext', 'dall-git-branch.refreshing', true);
			this._isRefreshing = true;
			const promptResult = await this._getImgPrompt();
			if (!promptResult) {
				return;
			}

			this._outputChannel.appendLine(`*Prompt: ${promptResult.prompt}`);
			const quality = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['quality']>('quality');
			const size = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['size']>('size');
			const style = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['style']>('style');
			// const retryCount = vscode.workspace.getConfiguration('dall-clock').get<number>('retryCount', 3);

			const result = await generateAndDownloadAiImageWithKey(this._extensionContext, promptResult.prompt, seed + promptResult.branchName, this._outputChannel, { quality, size, style });
			this._outputChannel.appendLine(`    Saved: ${result.localPath}`);
			this._lastImage = result.localPath;
			this._extensionContext.globalState.update('lastBranchImage', result.localPath);
			this.loadImageInWebview(result.localPath);
		} catch (err) {
			this._outputChannel.appendLine(`    Error: ${err}`);
			throw err;
		} finally {
			this._isRefreshing = false;
			vscode.commands.executeCommand('setContext', 'dall-git-branch.refreshing', false);
		}
	}

	private loadImageInWebview(url: string): void {
		const uri = vscode.Uri.file(url);
		const webviewUri = this._view?.webview.asWebviewUri(uri);
		if (webviewUri) {
			this._view!.webview.postMessage({ type: 'setImage', imageUrl: webviewUri.toString() });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionContext.extensionUri, 'media', 'main.js'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionContext.extensionUri, 'media', 'main.css'));

		const nonce = getNonce();
		return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dall Git Branch</title>
				<link href="${styleMainUri}" rel="stylesheet">
            </head>
            <body>
                <div id="image-container">
					<img nonce="${nonce}" src="" />
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
	}

	private async _getImgPrompt(): Promise<{ prompt: string; branchName: string; } | undefined> {
		const branchName = this._getBranchName();
		if (!branchName) {
			return;
		}

		// Require that the user's phrase is also visible as written text somewhere in the image.
		//  ${getCuteArtStyleAndFeelPart()}
		const askForImgPrompt = `You write creative prompts for an AI image generator. The user will give a short phrase, and you must generate a prompt for DALL-E based on that phrase. The animal must be cute. Reply with the prompt and no other text.`;
		const branchNoDash = branchName.replace(/-/g, ' ');
		const messages: OpenAI.ChatCompletionMessageParam[] = [
			{
				content: askForImgPrompt,
				role: 'system'
			},
			{
				role: 'user',
				content: branchNoDash
			}
		];
		const prompt = await textRequest(this._extensionContext, messages, this._outputChannel);
		// const promptWithText = prompt + ` The text ${branchNoDash} is visible somewhere in the image`;
		return {
			prompt,
			branchName
		};
	}

	private _getBranchName(): string | undefined {
		this._initGitExtension();
		if (!this._gitAPI) {
			this._outputChannel.appendLine('Git extension not active.');
			return;
		}

		const repos = this._gitAPI?.repositories;
		const interestingBranchRepo = repos?.find(f => f.state.HEAD?.name?.match(/.+\/[^-]+-[^-]+/));
		if (!interestingBranchRepo) {
			this._outputChannel.appendLine('No interesting branch found.');
			return;
		}

		const fullBranchName = interestingBranchRepo.state.HEAD!.name!;
		const branchName = fullBranchName.split('/')[1];
		return branchName || undefined;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
