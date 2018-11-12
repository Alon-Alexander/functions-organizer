import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { readFile, readFileSync } from "fs";
import FunctionMove from "../functions";

interface TestMap {
  name: string;
  returnValue: boolean;
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

const testsMap: { tests: TestMap[] } = JSON.parse(
  String(
    readFileSync(
      path.resolve(
        (vscode.workspace.workspaceFolders || [{ uri: { path: "" } }])[0].uri
          .path,
        "src",
        "test",
        "tests.map.json"
      )
    )
  )
);

const FOLDER = "src/test/data/";
const INPUT = "input/";
const OUTPUT = "output/";

const resolvePath = (prefix: string, filename: string): string =>
  path.resolve(
    (vscode.workspace.workspaceFolders || [{ uri: { path: "" } }])[0].uri.path,
    FOLDER,
    prefix,
    filename
  );

function getFile(prefix: string, filename: string): Thenable<string> {
  return new Promise((resolve, reject) => {
    readFile(resolvePath(prefix, filename), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(String(data));
      }
    });
  });
}

async function setupDocument(test: TestMap): Promise<vscode.TextEditor> {
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

suite("Function Move Tests", function() {
  for (let i = 0; i < testsMap.tests.length; i++) {
    test(`Move Up - Case ${testsMap.tests[i].name}`, async () => {
      const test = testsMap.tests[i];

      const editor = await setupDocument(test);

      const returnValue = await new FunctionMove(editor).moveUp(
        editor.selection
      );
      assert.equal(returnValue, test.returnValue);

      const content = await getFile(OUTPUT, test.name);
      assert.equal(editor.document.getText(), content);

      const after = test.afterRange;
      assert.deepEqual(
        editor.selection,
        new vscode.Selection(
          new vscode.Position(after.start.line, after.start.character),
          new vscode.Position(after.end.line, after.end.character)
        )
      );
    });
  }
});
