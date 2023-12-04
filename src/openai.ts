import * as crypto from 'crypto';
import OpenAI from 'openai';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { downloadFile } from './utils';

export async function generateAndDownloadAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, outputChannel: vscode.OutputChannel, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<{ localPath: string, image: OpenAI.Image }> {
    const randomFileName = crypto.randomBytes(20).toString('hex');
    const tempFileWithoutExtension = path.join(os.tmpdir(), 'dall-clock', `${randomFileName}`);
    const tmpFilePath = tempFileWithoutExtension + '.png';
    console.log(tmpFilePath);

    const result = await fetchAiImage(extContext, imageGenPrompt, optsOverride);
    outputChannel.appendLine('    Revised prompt: ' + result.revised_prompt);
    await downloadFile(result.url!, tmpFilePath);
    return { localPath: tmpFilePath, image: result };
}

async function fetchAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<OpenAI.Image> {
    const key = await getUserAiKey(extContext);
    if (!key) {
        throw new Error('Missing OpenAI API key');
    }

    const openai = new OpenAI({ apiKey: key });
    const imageGen = await openai.images.generate({
        prompt: imageGenPrompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        // style: 'natural',
        quality: 'hd',
        ...optsOverride,
    });
    return imageGen.data[0]!;
}

const keyName = 'openai.aiKey';
async function getUserAiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(keyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({ placeHolder: 'Enter your OpenAI API key', prompt: 'You can create an API key [here](https://platform.openai.com/api-keys)' });
        if (newKey) {
            context.secrets.store(keyName, newKey);
            return newKey;
        } else {
            return;
        }
    }
}
