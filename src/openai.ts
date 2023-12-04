import * as crypto from 'crypto';
import OpenAI from 'openai';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { downloadFile } from './utils';

export async function generateAndDownloadAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, requireText: string, retryCount: number, outputChannel: vscode.OutputChannel, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<{ localPath: string, image: OpenAI.Image }> {
    const randomFileName = crypto.randomBytes(20).toString('hex');
    const tempFileWithoutExtension = path.join(os.tmpdir(), 'dall-clock', `${randomFileName}`);
    const tmpFilePath = tempFileWithoutExtension + '.png';
    console.log(tmpFilePath);

    const fetchAndLog = async () => {
        const image = await fetchAiImage(extContext, imageGenPrompt, optsOverride);
        outputChannel.appendLine('    Revised prompt: ' + image.revised_prompt);
        outputChannel.appendLine(`    URL: ${image.url}`);
        return image;
    };

    let image: OpenAI.Images.Image;
    while (true) {
        image = await fetchAndLog();
        if (retryCount-- > 0) {
            if (!await checkForTextInImage(extContext, image.url!, requireText, outputChannel)) {
                outputChannel.appendLine(`    Image does not contain text "${requireText}", retrying...`);
            } else {
                break;
            }
        } else {
            outputChannel.appendLine(`    Out of retries so you get what you get`);
            break;
        }
    }

    await downloadFile(image.url!, tmpFilePath);
    return { localPath: tmpFilePath, image };
}

export async function checkForTextInImage(extContext: vscode.ExtensionContext, imageUrl: string, text: string, outputChannel: vscode.OutputChannel): Promise<boolean> {
    const key = await getUserAiKey(extContext);
    if (!key) {
        throw new Error('Missing OpenAI API key');
    }

    const openai = new OpenAI({ apiKey: key });
    outputChannel.appendLine(`    Checking for text "${text}" in generated image`);
    const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: `Does this image contain the text ${text}? Reply with only yes or no.` },
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl },
                    },
                ],
            },
        ],
    });
    const textResponse = response.choices[0].message.content;
    outputChannel.appendLine(`    gpt-4-vision-preview response: "${textResponse}"`);
    return textResponse?.toLowerCase().includes('yes') ?? true;
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
