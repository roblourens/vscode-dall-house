import * as vscode from 'vscode';
import * as os from 'os';
import { generateAndDownloadAiImageWithTextCheckDallE, textRequest } from './openai';
import OpenAI from 'openai';
import { getArtStyleAndFeelPart } from './promptUtils';
import { generateAndDownloadAiImage, generateAndDownloadAiImageWithTextCheck } from './ai';
import { getImageModel } from './config';

const refreshesBeforeWait = 1;

export class DallClockWebviewProvider implements vscode.WebviewViewProvider {
	private _view: vscode.WebviewView | undefined;
	private _lastImage: string | undefined;
	private _lastRefresh: number = 0;
	private _refreshCount: number = 0;
	private _refreshTimer: NodeJS.Timeout | undefined;
	private _isRefreshing: boolean = false;

	constructor(
		private readonly _extensionContext: vscode.ExtensionContext,
		private readonly _outputChannel: vscode.OutputChannel
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
				this._extensionContext.extensionUri,
				vscode.Uri.file(os.tmpdir())
			]
		};
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		this._register(this._view.onDidChangeVisibility(() => {
			this._refreshCount = 0;
			if (this._lastImage) {
				// Webview is unloaded when we switch away?
				this.loadImageInWebview(this._lastImage);
			}

			this.refresh();
		}));

		this._register(vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.scheme !== 'output') {
				this._refreshCount = 0;
				this.refresh();
			}
		}));
		this._register(vscode.window.onDidChangeActiveTextEditor(() => {
			this._refreshCount = 0;
			this.refresh();
		}));

		// Initialize with lastImage from globalState.
		// Don't refresh initially. Require the user to start using vscode (listen to text changes) or to click the refresh button.
		const last = this._extensionContext.globalState.get<string>('lastImage');
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

		const now = Date.now();
		const refreshPeriod = 1000 * 60 * vscode.workspace.getConfiguration('dallHouse.clock').get<number>('updatePeriod', 3);
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
			const prompt = await getPrompt(this._extensionContext, this._outputChannel);
			// const prompt = { requiredString: '', fullPrompt: await textRequest(this._extensionContext, [{ role: 'user', content: 'Write a creative prompt for an image generation AI. It should describe a unique scene with a clear subject. It should have a distinct mood/atmosphere. Give enough detail for the AI to create an interesting image.' }], this._outputChannel) };
			this._outputChannel.appendLine(`*Prompt: ${prompt.fullPrompt}`);
			const quality = vscode.workspace.getConfiguration('dallHouse').get<OpenAI.ImageGenerateParams['quality']>('quality');
			const size = vscode.workspace.getConfiguration('dallHouse').get<OpenAI.ImageGenerateParams['size']>('size');
			const style = vscode.workspace.getConfiguration('dallHouse').get<OpenAI.ImageGenerateParams['style']>('style');
			const retryCount = vscode.workspace.getConfiguration('dallHouse.clock').get<number>('retryCount', 3);

			const result = getImageModel() === 'gpt-image-1' ?
				await generateAndDownloadAiImage(this._extensionContext, prompt.fullPrompt, prompt.requiredString, false, this._outputChannel, { quality, size, style }) :
				await generateAndDownloadAiImageWithTextCheck(this._extensionContext, prompt.fullPrompt, prompt.requiredString, retryCount, this._outputChannel, { quality, size, style });
			this._outputChannel.appendLine(`    Saved: ${result.localPath}`);
			this._lastImage = result.localPath;
			this._extensionContext.globalState.update('lastImage', result.localPath);
			this.loadImageInWebview(result.localPath);
			this._lastRefresh = now;
			this._refreshCount++;
			this._refreshTimer = setTimeout(() => this.refresh(), refreshPeriod);
		} catch (err) {
			this._outputChannel.appendLine(`    Error: ${err}`);
			throw err;
		} finally {
			this._isRefreshing = false;
			vscode.commands.executeCommand('setContext', 'dall-clock.refreshing', false);
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
                <title>Dall Clock</title>
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
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

async function getPrompt(extensionContext: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): Promise<{ fullPrompt: string; requiredString: string; }> {
	const location = vscode.workspace.getConfiguration('dallHouse.clock').get('location', 'Seattle, WA');
	const date = new Date();
	date.setSeconds(date.getSeconds() + 30); // Add 30 seconds because it takes so damn long to update the image
	const includeAmPm = Math.random() < 0.5;
	let time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	const timeWithoutAmPm = time.replace(/\s*(am|pm)\s*/i, '');
	if (!includeAmPm) {
		time = timeWithoutAmPm;
	}

	const timeOfDay = getTimeOfDay(date);
	const timeWords = getTimeWordsPart()
		.replace('{time}', `"${time}"`)
		.replace('{location}', `"${location}"`);

	const scenePrompt = vscode.workspace.getConfiguration('dallHouse.clock').get<string>('scenePrompt');
	if (scenePrompt) {
		return {
			fullPrompt: `${timeWords} ${scenePrompt}`,
			requiredString: timeWithoutAmPm
		};
	}

	const fullPrompt = vscode.workspace.getConfiguration('dallHouse.clock').get<string>('fullPrompt');
	if (fullPrompt) {
		return {
			fullPrompt,
			requiredString: ''
		};
	}

	const promptType = pickRandom('prompts2', 'scene', 'generated');
	if (promptType === 'prompts2') {
		const prompt2 = pickRandom(...prompts2);
		return {
			fullPrompt: prompt2({ timeOfDay, time }),
			requiredString: timeWithoutAmPm
		};
	} else if (promptType === 'scene') {
		const scene = getScenePart().replace('{location}', `"${location}"`);
		if (location) {
			return {
				fullPrompt: `${timeWords} This is just text, it does not represent a time. The text is obvious and readable. There is no other text anywhere in the scene. ${scene} It is ${timeOfDay}. ${getArtStyleAndFeelPart()}`,
				requiredString: timeWithoutAmPm
			};
		} else {
			return {
				fullPrompt: `A digital clock which reads "${time}".`,
				requiredString: timeWithoutAmPm
			};
		}
	} else {
		const promptPrompt = `Write a creative prompt for an image generation AI. It should describe a unique scene with a clear subject. It should have a distinct mood/atmosphere. Give enough detail for the AI to create an interesting image. Do not give the prompt a title/name. 
Here's some inspiration: ${getSceneForPromptGeneration()}.
${roll(4) ? `Season: ${randomSeason()}. ` : ''}
${roll(4) ? getArtStyleAndFeelPart() : ''}
${roll(4) ? 'It is ' + timeOfDay : ''}
`;
		const prompt = 'VERY IMPORTANT, DO NOT IGNORE: ' + timeWords + ' Apply this to the image for the following prompt\n\n' + await textRequest(extensionContext, [{ role: 'user', content: promptPrompt }], outputChannel);
		// `\n\nVERY IMPORTANT, DO NOT IGNORE: ${timeWords}`;
		return {
			fullPrompt: prompt,
			requiredString: timeWithoutAmPm
		};
	}
}

const scenes = [
	'A knolling-style photo of items stereotypically associated with {location}.',
	'A busy bustling sidewalk scene in {location}. People are walking or biking. There are no cars.',
	'A cute and cozy cafe full of people in {location}. Some people are sipping lattes, some working on laptops, some chatting with friends, or writing in journals.',
	'A friendly welcoming neighborhood bar in {location}.',
	'A band performing on stage in {location}.',
	'An office full of busy programmers using VS Code in {location}.',
	'An inspiring skyline view of {location}.',
	'A view of a famous landmark in {location}.',
	'The typical food eaten in {location}.',
	'A beautiful and awe-inspiring scene of the nature, plants, and animals that are found in {location}.',
	'An image of a futuristic version of {location}, inspired by Blade Runner.',
	'{location}.',
];

function getScenePart() {
	return scenes[Math.floor(Math.random() * scenes.length)];
}

const timeWordsOptions = [
	'There is a digital clock in the foreground which shows the _exact_ text {time} and no other text.',
	'There is a nixie tube clock in the foreground which shows the _exact_ text {time} and no other text.',
	'The text {time} is overlayed on the image in large font. There is no other text.',
	'Some object in the scene has the exact text {time} painted on it in large brushstrokes.', // This should be more specific
	'The text {time} is painted over it in big, white brush strokes with visible texture.',
	'A person from {location} is holding a sign with the exact text {time} handwritten on it in large font. They are facing the viewer and the sign does not block their face.',
	'There is a large sign in the foreground which shows the exact text {time} and no other text.',
];

function getTimeWordsPart(): string {
	const randomIndex = Math.floor(Math.random() * timeWordsOptions.length);
	return timeWordsOptions[randomIndex];
}

function getTimeOfDay(d: Date) {
	const hour = d.getHours();
	if (hour < 6) {
		return 'night';
	} else if (hour < 12) {
		return 'morning';
	} else if (hour < 18) {
		return 'afternoon';
	} else {
		return 'evening';
	}
}

function getSceneForPromptGeneration(): string {
	return pickRandom(
		'futuristic cityscape',
		'medieval',
		'jungle',
		'underwater',
		'steampunk',
		'alien planet',
		'post-apocalyptic',
		'cyberpunk',
		'remote desert',
		'cute animal',
		'mythical creature',
		'robotics lab',
		'videogame characters',
		'ancient mysteries',
		'retro travel poster',
		'huge library',
		'city in the clouds',
		'space war',
		'the 90s',
	);
}

interface IPromptContext {
	timeOfDay: string;
	time: string;
}

const prompts2 = [
	(ctx: IPromptContext) => `A ${pickRandom('girl', 'boy', 'horse', 'cyborg', 'buffalo', 'star wars at-at')} walking through a field. Clouds above spell out "${ctx.time}". ${includeOrNot('Ethereal trees,')} ${includeOrNot('dark yellow and azure, majestic,')} sweeping landscape, ${pickRandom('photorealistic', 'oil painting', 'watercolor')}.`,
	(ctx: IPromptContext) => `A cartoonish 3d rendering of a ${pickRandom('hot-air balloon', 'castle', 'dog', 'retro alarm clock', 'laptop', 'ship')}. It has the text "${ctx.time}" on its side in large letters. Disney/pixar style, colorful, fun.`,
	(ctx: IPromptContext) => `Many programmers hard at work in a busy modern tech office. It is ${ctx.timeOfDay}. The office has large windows that look out over ${pickRandom('a futuristic cityscape', 'a lush jungle valley', 'a modern city')}. The digital clock on the wall shows the text "${ctx.time}".`,
	(ctx: IPromptContext) => `A colorful abstract image showing swirls of color. Fractal explosions of light and texture. The text "${ctx.time}" appears in the center of the image. ${pickRandom('digital rendering', 'psychedelic oil painting', '')}`,
	(ctx: IPromptContext) => `VERY IMPORTANT: The text "${ctx.time}" is written in the sky in large letters made of ${pickRandom('stars', 'clouds', 'sparks', 'magic', 'typography')}. A ${ctx.timeOfDay} view of a huge ${pickRandom('snow-capped', 'tree-covered', 'jungle', 'volcanic', 'desolate')} mountain. The mountain is ${pickRandom('round and smooth', 'steep and craggy', 'mysterious and unknowable', 'like mt rainier', 'like mt hood')}. A small campfire burns in the foreground near the foot of the mountain, and small figures are barely visible, illuminated by the fire. The difference in scale between the two is awe-inspiring. ${pickRandom('Telephoto lens, realistic photo', 'oil painting, impressionistic', 'watercolor, dreamy')}.`,
];

function pickRandom<T>(...arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomSeason() {
	return pickRandom('spring', 'summer', 'fall', 'winter');
}

function includeOrNot(s: string) {
	return pickRandom(s, '');
}

function randomBoolean() {
	return pickRandom(true, false);
}

function roll(n: number) {
	return Math.random() < (1 / n);
}