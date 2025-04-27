import * as crypto from 'crypto';
import * as fs from 'fs';
import OpenAI from 'openai';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { getImageModel } from './config';
import { fetchAiImageFlux } from './flux';
import { fetchAiImageIdeogram } from './ideogram';
import { fetchAiImageDallE, fetchAiImageGPTImage1, generateAndDownloadAiImageWithTextCheckDallE } from './openai';
import { downloadFile } from './utils';

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
    if (model === 'gpt-image-1') {
        image = await fetchAiImageGPTImage1(extContext, imageGenPrompt, optsOverride);
    } else if (model === 'dall-e' || model === 'gpt-image-1') {
        image = await generateAndDownloadAiImageWithTextCheckDallE(extContext, imageGenPrompt, requireText, retryCount, outputChannel, optsOverride);
    } else if (model === 'flux') {
        image = await fetchAiImageFlux(extContext, imageGenPrompt);
    } else {
        image = await fetchAiImageIdeogram(extContext, imageGenPrompt);
    }

    if (image.url) {
        await downloadFile(image.url!, tmpFilePath);
    } else if (image.b64_json) {
        const buffer = Buffer.from(image.b64_json, 'base64');
        await fs.promises.mkdir(path.dirname(tmpFilePath), { recursive: true });
        await fs.promises.writeFile(tmpFilePath, buffer);
    } else {
        throw new Error('No image URL or base64 data found in image response');
    }
    
    return { localPath: tmpFilePath, image };
}

export async function generateAndDownloadAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string, tmpFileName: string, isForce: boolean, outputChannel: vscode.OutputChannel, optsOverride?: Partial<OpenAI.ImageGenerateParams>): Promise<{ localPath: string, image: OpenAI.Image, revisedPrompt: string }> {
    const tmpFilePath = getCacheImagePath(tmpFileName);
    const tmpTextFilePath = tmpFilePath + '.txt';

    let image: Image;
    const model = getImageModel();
    if (model === 'gpt-image-1') {
        image = await fetchAiImageGPTImage1(extContext, imageGenPrompt, optsOverride);
    } else if (model === 'dall-e') {
        image = await fetchAiImageDallE(extContext, imageGenPrompt, optsOverride);
    } else if (model === 'flux') {
        image = await fetchAiImageFlux(extContext, imageGenPrompt);
    } else {
        image = await fetchAiImageIdeogram(extContext, imageGenPrompt);
    }

    outputChannel.appendLine('    Revised prompt: ' + image.revised_prompt);
    if (image.url) {
        outputChannel.appendLine(`    URL: ${image.url}`);
        await downloadFile(image.url!, tmpFilePath);
    } else if (image.b64_json) {
        const buffer = Buffer.from(image.b64_json, 'base64');
        await fs.promises.mkdir(path.dirname(tmpFilePath), { recursive: true });
        await fs.promises.writeFile(tmpFilePath, buffer);
    } else {
        throw new Error('No image URL or base64 data found in image response');
    }
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