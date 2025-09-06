import * as vscode from 'vscode';
import { Image } from './ai';

export async function fetchAiImageGemini(extContext: vscode.ExtensionContext, imageGenPrompt: string): Promise<Image> {
    const key = await getUserGeminiKey(extContext);
    if (!key) {
        throw new Error('Missing Google AI API key');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: key });

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                role: 'user',
                parts: [{
                    text: imageGenPrompt
                }]
            }]
        });

        // Check if we have image data in the response
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;

            // Look for image parts in the response
            for (const part of content.parts || []) {
                if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                    return {
                        b64_json: part.inlineData.data,
                        revised_prompt: imageGenPrompt // Gemini doesn't provide revised prompts like DALL-E
                    };
                }
            }
        }

        throw new Error('No image data found in Gemini response');
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while generating image with Gemini');
    }
}

const geminiKeyName = 'gemini.aiKey';
async function getUserGeminiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    const storedKey = await context.secrets.get(geminiKeyName);
    if (storedKey) {
        return storedKey;
    } else {
        const newKey = await vscode.window.showInputBox({
            placeHolder: 'Enter your Google AI API key',
            prompt: 'You can create an API key at https://aistudio.google.com/app/apikey',
            password: true
        });
        if (newKey) {
            context.secrets.store(geminiKeyName, newKey);
            return newKey;
        } else {
            return;
        }
    }
}

export function clearUserGeminiKey(context: vscode.ExtensionContext) {
    context.secrets.delete(geminiKeyName);
}