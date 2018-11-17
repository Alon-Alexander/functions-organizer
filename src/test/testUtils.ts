import { readFile, readFileSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";

const FOLDER = "src/test/data/";
const INPUT = "input/";
export const OUTPUT = "output/";

export enum ACTION {
    UP = "UP",
    DOWN = "DOWN",
    SORT = "SORT",
}

export interface IRange {
    start: {
        line: number;
        character: number;
    };
    end: {
        line: number;
        character: number;
    };
}

export interface ITestMap {
    name: string;
    isGenerated?: boolean;
    beforeContent?: string;
    afterContent?: string;
    language?: string;
    returnValue: boolean;
    action: ACTION;
    beforeRange: IRange;
    afterRange: IRange;
}

export const resolvePath = (prefix: string, filename: string): string =>
    path.resolve(
        (vscode.workspace.workspaceFolders || [{ uri: { path: "" } }])[0].uri.path,
        FOLDER,
        prefix,
        filename
    );

export async function setupDocument(test: ITestMap): Promise<vscode.TextEditor> {
    let editor;
    if (test.isGenerated) {
        editor = await vscode.workspace.openTextDocument({
            content: test.beforeContent,
            language: test.language,
        }).then((doc) => {
            return vscode.window.showTextDocument(doc);
        });
    } else {
        const openPath = vscode.Uri.file(resolvePath(INPUT, test.name));
        editor = await vscode.workspace.openTextDocument(openPath).then((doc) => {
            return vscode.window.showTextDocument(doc);
        });
    }

    const range = test.beforeRange;
    editor.selection = new vscode.Selection(
        new vscode.Position(range.start.line, range.start.character),
        new vscode.Position(range.end.line, range.end.character)
    );
    return editor;
}

export function closeDocument(): Thenable<{} | undefined> {
    return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
}

export function getOutputContent(test: ITestMap): Thenable<string> {
    if (test.isGenerated) {
        return Promise.resolve(test.afterContent || "");
    } else {
        return new Promise((resolve, reject) => {
            readFile(resolvePath(OUTPUT, test.name), (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(String(data));
                }
            });
        });
    }
}

export function readJSON(filename: string): any {
    return JSON.parse(
        String(
            readFileSync(
                path.resolve(
                    (vscode.workspace.workspaceFolders || [{ uri: { path: "" } }])[0].uri
                        .path,
                    "src",
                    "test",
                    filename,
                )
            )
        )
    );
}
