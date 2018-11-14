import { expect } from 'chai';
import { readFile, readFileSync } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import FunctionMove from '../functions';
import { ACTION, closeDocument, OUTPUT, resolvePath, setupDocument, TestMap } from './testUtils';

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
        // if (i !== 5) continue;
        test(`Case ${i} (${testsMap.tests[i].name})`, async () => {
            const test = testsMap.tests[i];

            const editor = await setupDocument(test);

            const fm = new FunctionMove(editor);
            let returnValue: boolean | null;
            switch (test.action) {
                case ACTION.UP:
                    returnValue = await fm.moveUp(editor.selection);
                    break;
                case ACTION.DOWN:
                    returnValue = await fm.moveDown(editor.selection);
                    break;
                default:
                    returnValue = null;
            }
            expect(returnValue).to.not.be.equal(null, `Error in tests\' map file - invalid action`);
            expect(returnValue).to.be.equal(test.returnValue, `returned value`);

            if (returnValue) {
                const content = await getFile(OUTPUT, test.name);
                expect(editor.document.getText()).to.equal(content, "content of file");
            }

            const after = test.afterRange;
            expect(editor.selection).to.deep.equal(
                new vscode.Selection(
                    new vscode.Position(after.start.line, after.start.character),
                    new vscode.Position(after.end.line, after.end.character)),
                "selection in file",
            )
            await closeDocument();
        });
    }
});
