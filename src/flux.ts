import * as fal from "@fal-ai/serverless-client";
import * as vscode from 'vscode';
import { Image } from './ai';

export async function fetchAiImageFlux(extContext: vscode.ExtensionContext, imageGenPrompt: string): Promise<Image> {
    const key = await getUserAiKey(extContext);
    if (!key) {
        throw new Error('Missing FAL/Flux API key');
    }

    fal.config({
        credentials: key
    });

    const result: any = await fal.subscribe("fal-ai/flux/dev", {
        input: {
            prompt: imageGenPrompt,
            "num_inference_steps": 28,
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        },
    });

    return { url: result.images[0].url };
}

const keyName = 'flux.aiKey';
async function getUserAiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(keyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({ placeHolder: 'Enter your FAL API key', prompt: 'You can create an API key [here](https://fal.ai/dashboard/keys)' });
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