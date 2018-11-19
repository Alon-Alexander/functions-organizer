import { expect } from "chai";
import * as vscode from "vscode";

import Organizer from "../organizer";
import TestGenerator from "./automated";
import {
    ACTION,
    closeDocument,
    getOutputContent,
    ITestMap,
    readJSON,
    setupDocument,
} from "./testUtils";

const testsMap: { tests: ITestMap[] } = readJSON("tests.map.json");
const GENERATED_AMOUNT = 100;

async function performAction(
    fm: Organizer,
    action: ACTION,
    sel: vscode.Selection
): Promise<boolean | null> {
    let returnValue;
    switch (action) {
        case ACTION.UP:
            returnValue = await fm.moveUp(sel);
            break;
        case ACTION.DOWN:
            returnValue = await fm.moveDown(sel);
            break;
        case ACTION.SORT:
            returnValue = await fm.sort(sel);
            break;
        default:
            returnValue = null;
    }
    return returnValue;
}

async function executeTest(test: ITestMap) {
    const editor = await setupDocument(test);
    const organizer = new Organizer(editor);
    const returnValue: boolean | null = await performAction(
        organizer, test.action, editor.selection
    );
    if (returnValue !== test.returnValue) {
        process.exit(-1);
    }
    expect(returnValue).to.not.be.equal(null, `Error in tests\' map file - invalid action`);
    expect(returnValue).to.be.equal(test.returnValue, `returned value`);

    if (returnValue) {
        const content = await getOutputContent(test);
        expect(editor.document.getText()).to.equal(content, "content of file");
    }

    if (test.action !== ACTION.SORT) {
        const after = test.afterRange;
        expect(editor.selection).to.deep.equal(
            new vscode.Selection(
                new vscode.Position(after.start.line, after.start.character),
                new vscode.Position(after.end.line, after.end.character)),
            "selection in file",
        );
    }
    await closeDocument();
}

suite("Generated Tests", async () => {
    const tg = new TestGenerator(
        (len) => Math.floor(Math.random() * len),
        {
            maxFunctions: 5,
            maxNameLength: 10,
            maxStatement: 4,
            maxWhitespace: 3,
        },
    );

    for (let i = 0; i < GENERATED_AMOUNT; i++) {
        const gen = tg.generate();
        await test(gen.name, () => executeTest(gen));
    }
});

suite("Written Tests", async () => {
    for (let i = 0; i < testsMap.tests.length; i++) {
        await test(`Case ${i} (${testsMap.tests[i].name})`, () => executeTest(testsMap.tests[i]));
    }
});
