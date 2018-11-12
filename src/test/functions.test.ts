import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { readFile, readFileSync, writeFileSync } from "fs";
import FunctionMove from "../functions";
import {
  TestMap,
  resolvePath,
  setupDocument,
  OUTPUT,
  closeDocument
} from "./testUtils";

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

suite("Function Move Tests", function() {
  before("Open editor", async () => {
    await setupDocument(testsMap.tests[0]);
    await closeDocument();
  });

  for (let i = 0; i < testsMap.tests.length; i++) {
    test(`Move Up - Case ${i} (${testsMap.tests[i].name})`, async () => {
      const test = testsMap.tests[i];

      const editor = await setupDocument(test);

      const fm = new FunctionMove(editor);
      for (let j = 0; j < test.amount; j++) {
        const returnValue = await fm.moveUp(editor.selection);
        assert.equal(returnValue, test.returnValue, "returned value");
      }

      writeFileSync(
        resolvePath(OUTPUT, `output-${i}.js`),
        editor.document.getText()
      );
      const content = await getFile(OUTPUT, test.name);
      assert.equal(editor.document.getText(), content, "content of file");

      const after = test.afterRange;
      assert.deepEqual(
        editor.selection,
        new vscode.Selection(
          new vscode.Position(after.start.line, after.start.character),
          new vscode.Position(after.end.line, after.end.character)
        ),
        "selection in file"
      );
      await closeDocument();
    });
  }
});
