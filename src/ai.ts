import * as vscode from 'vscode';
import { getImageModel } from './config';
import { fetchAiImageDallE, generateAndDownloadAiImageWithTextCheckDallE } from './openai';
import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { downloadFile } from './utils';
import { fetchAiImageFlux } from './flux';
import OpenAI from 'openai';
import { fetchAiImageIdeogram } from './ideogram';

export interface Image {
    b64_json?: string;
    revised_prompt?: string;
    url?: string;
}

export async function generateAndDownloadAiImageWithTextCheck(extContext: vscode.ExtensionContext, imageGenPrompt: string, requireText: string, retryCount: number, outputChannel: vscode.OutputChannel, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<{ localPath: string, image: OpenAI.Image }> {
    const randomFileName = crypto.randomBytes(20).toString('hex');
    const tempFileWithoutExtension = path.join(os.tmpdir(), 'dall-house', randomFileName);
    const tmpFilePath = tempFileWithoutExtension + '.png';

    let image: Image;
    const model = getImageModel();
    if (model === 'dall-e') {
        image = await generateAndDownloadAiImageWithTextCheckDallE(extContext, imageGenPrompt, requireText, retryCount, outputChannel, optsOverride);
    } else if (model === 'flux') {
        image = await fetchAiImageFlux(extContext, imageGenPrompt);
    } else {
        image = await fetchAiImageIdeogram(extContext, imageGenPrompt);
    }


    await downloadFile(image.url!, tmpFilePath);
    return { localPath: tmpFilePath, image };
}

export async function generateAndDownloadAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, tmpFileName: string, isForce: boolean, outputChannel: vscode.OutputChannel, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<{ localPath: string, image: OpenAI.Image, revisedPrompt: string }> {
    const tmpFilePath = getCacheImagePath(tmpFileName);
    const tmpTextFilePath = tmpFilePath + '.txt';

    let image: Image;
    const model = getImageModel();
    if (model === 'dall-e') {
        image = await fetchAiImageDallE(extContext, imageGenPrompt, optsOverride);
    } else if (model === 'flux') {
        image = await fetchAiImageFlux(extContext, imageGenPrompt);
    } else {
        image = await fetchAiImageIdeogram(extContext, imageGenPrompt);
    }

    outputChannel.appendLine('    Revised prompt: ' + image.revised_prompt);
    outputChannel.appendLine(`    URL: ${image.url}`);
    await downloadFile(image.url!, tmpFilePath);
    await fs.promises.writeFile(tmpTextFilePath, image.revised_prompt || '');

    return { localPath: tmpFilePath, image, revisedPrompt: image.revised_prompt || '' };
}

function getCacheImagePath(key: string): string {
    return path.join(os.tmpdir(), 'dall-house', key) + '.png';
}

export async function getCachedImageForKey(key: string): Promise<undefined | { localPath: string, image: OpenAI.Image, revisedPrompt: string }> {
    const tmpFilePath = getCacheImagePath(key);
    const tmpTextFilePath = tmpFilePath + '.txt';
    if (await exists(tmpFilePath) && await exists(tmpTextFilePath)) {
        const revisedPrompt = await fs.promises.readFile(tmpTextFilePath, 'utf-8');
        return { localPath: tmpFilePath, image: { url: tmpFilePath }, revisedPrompt };
    }
}

async function exists(file: string): Promise<boolean> {
    try {
        await fs.promises.access(file);
        return true;
    } catch (error) {
        return false;
    }
}