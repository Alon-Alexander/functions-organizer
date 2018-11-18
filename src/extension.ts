"use strict";
import * as vscode from "vscode";
import Organizer from "./organizer";

function getOrganizerAndEditor(): {
    editor: vscode.TextEditor | null;
    organizer: Organizer | null;
} {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return {
            editor: null,
            organizer: null
        }; // No open text editor
    }

    const organizer = new Organizer(editor);

    return {
        editor,
        organizer
    };
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.moveFunctionUp", () => {
            const { organizer, editor } = getOrganizerAndEditor();
            if (!!organizer && !!editor) {
                organizer.moveUp(editor.selection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.moveFunctionDown", () => {
            const { organizer, editor } = getOrganizerAndEditor();
            if (!!organizer && !!editor) {
                organizer.moveDown(editor.selection);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("extension.sortFunctions", () => {
            const { organizer, editor } = getOrganizerAndEditor();
            if (!!organizer && !!editor) {
                organizer.sort(editor.selection);
            }
        })
    );
}

// tslint:disable-next-line:no-empty
export function deactivate() { }
