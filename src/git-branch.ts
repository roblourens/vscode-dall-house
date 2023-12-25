import * as vscode from 'vscode';
import * as os from 'os';
import { generateAndDownloadAiImageWithKey, generateAndDownloadAiImageWithTextCheck, textRequest } from './openai';
import OpenAI from 'openai';
import { API as GitAPI, GitExtension, Repository } from './git';
import { getArtStyleAndFeelPart, getCuteArtStyleAndFeelPart } from './promptUtils';

interface IDisplayedImageData {
	imagePath: string;
	tooltip: string;
}

const lastBranchImageDataKey = 'lastBranchImageData';

export class GitBranchWebviewProvider implements vscode.WebviewViewProvider {
	private _view: vscode.WebviewView | undefined;
	private _lastData: IDisplayedImageData | undefined;
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
				const initRepo = (r: Repository) => {
					this._register(r.state.onDidChange(() => this.refresh()));
					this._register(r.ui.onDidChange(() => this.refresh()));
				};
				this._gitAPI.repositories.forEach(initRepo);
				this._register(this._gitAPI.onDidOpenRepository(initRepo));
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
			if (this._lastData) {
				// Webview is unloaded when we switch away?
				this.loadImageInWebview(this._lastData);
			}

			// this.refresh();
		}));

		// Initialize with lastImage from globalState.
		// Don't refresh initially. Require the user to start using vscode (listen to text changes) or to click the refresh button.
		const last = this._extensionContext.globalState.get<IDisplayedImageData>(lastBranchImageDataKey);
		if (last) {
			this.loadImageInWebview(last);
		}
	}

	open() {
		if (!this._lastData) {
			return;
		}

		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(this._lastData.imagePath));
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
				this.loadImageInWebview(null);
				return;
			}

			this._outputChannel.appendLine(`*Prompt: ${promptResult.prompt}`);
			const quality = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['quality']>('quality');
			const size = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['size']>('size');
			const style = vscode.workspace.getConfiguration('dall-clock').get<OpenAI.ImageGenerateParams['style']>('style');
			// const retryCount = vscode.workspace.getConfiguration('dall-clock').get<number>('retryCount', 3);

			const result = await generateAndDownloadAiImageWithKey(this._extensionContext, promptResult.prompt, seed + promptResult.branchName, this._outputChannel, { quality, size, style });
			this._outputChannel.appendLine(`    Saved: ${result.localPath}`);
			this._lastData = { imagePath: result.localPath, tooltip: result.revisedPrompt };
			this._extensionContext.globalState.update(lastBranchImageDataKey, this._lastData);
			this.loadImageInWebview(this._lastData);
		} catch (err) {
			this._outputChannel.appendLine(`    Error: ${err}`);
			throw err;
		} finally {
			this._isRefreshing = false;
			vscode.commands.executeCommand('setContext', 'dall-git-branch.refreshing', false);
		}
	}

	private loadImageInWebview(data: { imagePath: string, tooltip: string } | null): void {
		if (data) {
			const uri = vscode.Uri.file(data.imagePath);
			const webviewUri = this._view?.webview.asWebviewUri(uri);
			if (webviewUri) {
				this._view!.webview.postMessage({ type: 'setImage', imageUrl: webviewUri.toString(), tooltip: data.tooltip });
			}
		} else {
			this._view!.webview.postMessage({ type: 'setImage', imageUrl: null });
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

		this._outputChannel.appendLine(`Gonna request an image for branch "${branchName}"`);

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
				content: branchNoDash,
				role: 'user',
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
			this._outputChannel.appendLine('Git extension not active');
			return;
		}

		const repos = this._gitAPI?.repositories;
		const selectedRepo = repos.find(r => r.ui.selected);
		if (!selectedRepo) {
			this._outputChannel.appendLine('No branch selected');
			return;
		}

		const interestingBranchRepo = selectedRepo.state.HEAD?.name?.match(/.+\/([^-]+-[^-]+)/);
		if (!interestingBranchRepo) {
			this._outputChannel.appendLine('No interesting branch found');
			return;
		}

		const [_, branchName] = interestingBranchRepo;
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
