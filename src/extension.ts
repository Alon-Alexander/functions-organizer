"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import FunctionMove from "./functionMove";

function getFmAndEditor(): {
    editor: vscode.TextEditor | null;
    fm: FunctionMove | null;
} {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return {
            editor: null,
            fm: null
        }; // No open text editor
    }

    const fm = new FunctionMove(editor);

    return {
        editor,
        fm
    };
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.moveFunctionUp", () => {
            const { fm, editor } = getFmAndEditor();
            if (!!fm && !!editor) {
                fm.moveUp(editor.selection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.moveFunctionDown", () => {
            const { fm, editor } = getFmAndEditor();
            if (!!fm && !!editor) {
                fm.moveDown(editor.selection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.sortFunctions", () => {
            const { fm, editor } = getFmAndEditor();
            if (!!fm && !!editor) {
                fm.sort(editor.selection);
            }
        })
    );
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
