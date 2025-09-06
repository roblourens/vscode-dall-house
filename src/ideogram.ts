import ideogram from '@api/ideogram';
import * as vscode from 'vscode';
import { Image } from './ai';

export async function fetchAiImageIdeogram(extContext: vscode.ExtensionContext, imageGenPrompt: string): Promise<Image> {
    const key = await getUserAiKey(extContext);
    if (!key) {
        throw new Error('Missing Ideogram API key');
    }

    const sdk = ideogram.auth(key);
    const result = await sdk.post_generate_image({ image_request: { prompt: imageGenPrompt, model: 'V_2', magic_prompt_option: 'AUTO' } });
    console.log(result);

    return {
        url: result.data.data[0].url ?? undefined,
        revised_prompt: result.data.data[0].prompt
    };
}

const keyName = 'ideogram.aiKey';
async function getUserAiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(keyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({ placeHolder: 'Enter your Ideogram API key', prompt: 'You can create an API key [here](https://ideogram.ai/manage-api)' });
        if (newKey) {
            context.secrets.store(keyName, newKey);
            return newKey;
        } else {
            return;
        }
    }
}

export function clearUserAiKey(context: vscode.ExtensionContext) {
    context.secrets.delete(keyName);
}