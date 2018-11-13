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
    closeDocument,
    ACTION
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

suite("Function Move Tests", function () {
    for (let i = 0; i < testsMap.tests.length; i++) {
        test(`Move Up - Case ${i} (${testsMap.tests[i].name})`, async () => {
            const test = testsMap.tests[i];

            const editor = await setupDocument(test);

            const fm = new FunctionMove(editor);
            for (let j = 0; j < test.actions.length; j++) {
                let returnValue: boolean | null;
                switch (test.actions[j]) {
                    case ACTION.UP:
                        returnValue = await fm.moveUp(editor.selection);
                        break;
                    case ACTION.DOWN:
                        returnValue = await fm.moveDown(editor.selection);
                        break;
                    default:
                        returnValue = null;
                }
                assert.notEqual(returnValue, null, `Error in tests\' map file - invalid action on index ${j}`);
                assert.equal(returnValue, test.returnValues[j], "returned value");
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
