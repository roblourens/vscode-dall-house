import * as vscode from 'vscode';
import { getAiImage } from './openai';

export function activate(context: vscode.ExtensionContext) {
	const provider = new DallClockWebviewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('dall-clock', provider),
		vscode.commands.registerCommand('dall-clock.refresh', async () =>
			provider.refresh(true)),
		vscode.commands.registerCommand('dall-clock.open', async () =>
			provider.open())
	);
}

const refreshPeriod = 1000 * 60 * 3;
const refreshesBeforeWait = 5;

class DallClockWebviewProvider implements vscode.WebviewViewProvider {
	private _view: vscode.WebviewView | undefined;
	private _lastImage: string | undefined;
	private _lastRefresh: number = 0;
	private _refreshCount: number = 0;
	private _refreshTimer: NodeJS.Timeout | undefined;
	private _isRefreshing: boolean = false;

	constructor(
		private readonly _extensionContext: vscode.ExtensionContext,
	) { }

	private _register(disposable: vscode.Disposable) {
		this._extensionContext.subscriptions.push(disposable);
	}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionContext.extensionUri
			]
		};
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._register(this._view.onDidChangeVisibility(() => {
			this._refreshCount = 0;
			if (this._lastImage) {
				// Webview is unloaded when we switch away?
				this.setImage(this._lastImage);
			}

			this.refresh();
		}));
		this.refresh();
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

		const now = Date.now();
		if (!force && now - this._lastRefresh < refreshPeriod) {
			return;
		}

		if (!force && this._refreshCount >= refreshesBeforeWait) {
			return;
		}

		if (force) {
			this._refreshCount = 0;
		}

		if (this._refreshTimer) {
			clearTimeout(this._refreshTimer);
			this._refreshTimer = undefined;
		}

		try {
			this._isRefreshing = true;
			vscode.commands.executeCommand('setContext', 'dall-clock.refreshing', true);
			const url = await getAiImage(this._extensionContext, getPrompt());
			console.log(url);
			this._lastImage = url;
			this.setImage(url);
			this._lastRefresh = now;
			this._refreshCount++;
			this._refreshTimer = setTimeout(() => this.refresh(), refreshPeriod);
		} finally {
			this._isRefreshing = false;
			vscode.commands.executeCommand('setContext', 'dall-clock.refreshing', false);
		}
	}

	private setImage(url: string): void {
		this._view!.webview.postMessage({ type: 'setImage', imageUrl: url });
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
                <title>Dall Clock</title>
				<link href="${styleMainUri}" rel="stylesheet">
            </head>
            <body>
                <div id="image-container"></div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
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


function getPrompt() {
	const location = vscode.workspace.getConfiguration('dall-clock').get('location', '');
	const date = new Date();
	const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const formattedDate = date.toLocaleDateString([], { month: 'long', day: 'numeric' });
	if (location) {
		return `The location "${location}" at the time "${formattedDate}". There is a numeric clock in the foreground which reads the _exact_ text "${time}". Capture the ambiance and details of the scene, including the lighting, surroundings, and any distinctive elements of this place and time.`;
	} else {
		return `A digital clock which reads "${time}".`;
		// return `A scene at the time "${formattedDate}". There is a digital clock in the foreground which reads "${time}". Capture the ambiance and details of the scene, including the lighting, surroundings, and any distinctive elements of this time.`;
	}
}