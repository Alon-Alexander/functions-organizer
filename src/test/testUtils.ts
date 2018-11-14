import * as vscode from "vscode";
import * as path from "path";

const FOLDER = "src/test/data/";
const INPUT = "input/";
export const OUTPUT = "output/";

export enum ACTION {
  UP = 'UP',
  DOWN = 'DOWN',
};

export interface TestMap {
  name: string;
  returnValue: boolean;
  action: ACTION;
  beforeRange: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
  afterRange: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
}

export const resolvePath = (prefix: string, filename: string): string =>
  path.resolve(
    (vscode.workspace.workspaceFolders || [{ uri: { path: "" } }])[0].uri.path,
    FOLDER,
    prefix,
    filename
  );

export async function setupDocument(test: TestMap): Promise<vscode.TextEditor> {
  let openPath = vscode.Uri.file(resolvePath(INPUT, test.name));
  const editor = await vscode.workspace.openTextDocument(openPath).then(doc => {
    return vscode.window.showTextDocument(doc);
  });

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
