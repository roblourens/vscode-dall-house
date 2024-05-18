import * as crypto from 'crypto';
import OpenAI from 'openai';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { getArtStyleAndFeelPart, getProgressMessage, getScenario } from './promptUtils';
import { downloadFile } from './utils';
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
// import { OpenAIClient, AzureKeyCredential } from "@azure/openai";


export function registerChatParticipant(extContext: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): vscode.Disposable {
    const participant = vscode.chat.createChatParticipant('dall-house.chat', async (request, context, response, token) => {
        let imageGenPrompt = request.prompt;
        if (!imageGenPrompt || request.command === 'random') {
            imageGenPrompt = `${getScenario()} ${getArtStyleAndFeelPart()}`;
            response.markdown(`I'll get you a picture of "${imageGenPrompt}"`);
        }

        response.progress(getProgressMessage());
        const result = await getAiImage(extContext, imageGenPrompt, outputChannel);
        // response.markdown(`![Generated Image](${result.tmpFilePath})`);
        const imgMd = new vscode.MarkdownString(`<img width="100%" src="file://${result.tmpFilePath}" />`);
        imgMd.supportHtml = true;
        response.markdown(imgMd);
    });
    participant.iconPath = new vscode.ThemeIcon('device-camera');

    return participant;
}

async function getAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, outputChannel: vscode.OutputChannel): Promise<{ tmpFilePath: string; resultUrl: string }> {
    const azureEndpoint = getAzureEndpoint();
    const key = azureEndpoint ? await getAzureOpenAIKey(extContext) : await getOpenAIKey(extContext);
    if (!key) {
        throw new Error('Missing OpenAI API key');
    }

    const openai = azureEndpoint ? new OpenAIClient(azureEndpoint, new AzureKeyCredential(key)) : new OpenAI({ apiKey: key });
    let resultUrl = '';
    if (azureEndpoint && openai instanceof OpenAIClient) {
        outputChannel.appendLine(`Using Azure OpenAI API: "${imageGenPrompt}"`);
        const imageResponse = await openai.getImages(getAzureDeploymentName(), imageGenPrompt, {
            n: 1,
            size: '1024x1024',
            quality: getDefaultQuality(),
            // TODO test Azure mode and add settings
        });
        resultUrl = (imageResponse.data[0] as any).url!;
    } else if (openai instanceof OpenAI) {
        outputChannel.appendLine(`Using OpenAI API: "${imageGenPrompt}"`);
        const imageGen = await openai.images.generate({
            prompt: imageGenPrompt,
            model: "dall-e-3",
            n: 1,
            size: '1024x1024',
            quality: getDefaultQuality(),
        });
        resultUrl = imageGen.data[0].url!;
        outputChannel.appendLine(`Rewritten to "${imageGen.data[0].revised_prompt}"`);
    }

    outputChannel.appendLine(`Generated image URL: ${resultUrl}`);

    const randomFileName = crypto.randomBytes(20).toString('hex');
    const tempFileWithoutExtension = path.join(os.tmpdir(), 'chat-agent-dalle', `${randomFileName}`);
    const tmpFilePath = tempFileWithoutExtension + '.png';

    await downloadFile(resultUrl!, tmpFilePath);

    return { tmpFilePath, resultUrl };
}

function getAzureEndpoint() {
    return vscode.workspace.getConfiguration('roblourens.chat-agent-dalle').get<string>('azureEndpoint');
}

function getAzureDeploymentName() {
    return vscode.workspace.getConfiguration('roblourens.chat-agent-dalle').get<string>('deploymentName');
}

function getDefaultQuality(): 'hd' | 'standard' {
    return vscode.workspace.getConfiguration('dallChat').get<'hd' | 'standard'>('defaultQuality') ?? 'hd';
}

const openAIKeyName = 'openai.aiKey';
const azureOpenAIKeyName = 'azure.openai.aiKey';
async function getAzureOpenAIKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(azureOpenAIKeyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({ placeHolder: 'Enter your Azure OpenAI API key', prompt: 'This can be found in your Azure portal' });
        if (newKey) {
            context.secrets.store(openAIKeyName, newKey);
            return newKey;
        } else {
            return;
        }
    }
}


async function getOpenAIKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(openAIKeyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({ placeHolder: 'Enter your OpenAI API key', prompt: 'You can create an API key [here](https://platform.openai.com/api-keys)' });
        if (newKey) {
            context.secrets.store(openAIKeyName, newKey);
            return newKey;
        } else {
            return;
        }
    }
}
