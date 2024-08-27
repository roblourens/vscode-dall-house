import * as vscode from 'vscode';

export function getImageModel() {
    return vscode.workspace.getConfiguration('dallHouse').get<string>('imageModel');
}