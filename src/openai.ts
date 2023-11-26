'use strict';

import * as vscode from 'vscode';
import OpenAI from 'openai';
// import axios from 'axios';
// import * as fs from 'fs';
// import * as os from 'os';
// import * as path from 'path';
// import * as crypto from 'crypto';
// import * as https from 'https';
// import sharp from 'sharp';
// import { GitExtension } from './git';

export async function getAiImage(extContext: vscode.ExtensionContext, imageGenPrompt: string): Promise<string> {
    const key = await getUserAiKey(extContext);
    if (!key) {
        throw new Error('Missing OpenAI API key');
    }

    const openai = new OpenAI({ apiKey: key });
    const imageGen = await openai.images.generate({
        prompt: imageGenPrompt,
        model: "dall-e-3",
        n: 1,
        size: '1024x1024',
        quality: "standard",
    });
    const resultUrl = imageGen.data[0].url!;
    return resultUrl;
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
