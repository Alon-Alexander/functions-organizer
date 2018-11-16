"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import FunctionMove from "./functionMove";

function getFmAndEditor(): {
    editor: vscode.TextEditor | null;
    fm: FunctionMove | null;
} {
    let editor = vscode.window.activeTextEditor;
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "functions-organizer" is now active!'
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
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

// this method is called when your extension is deactivated
export function deactivate() { }
