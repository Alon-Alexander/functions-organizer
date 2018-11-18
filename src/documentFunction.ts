import { Range, TextEditor } from "vscode";

import IndexPosition from "./indexPosition";
import { IRegexObject } from "./interfaces";
import MutableRange from "./mutableRange";
import {
    findPositionAfterBrackets,
    getPositionFromIndex,
    getValueFromRegexArr
} from "./utils";

/**
 * Represent a function in a document.
 * Has a name, a zero-based index (index of function in the document)
 * and a range (location in document).
 */
export default class DocumentFunction {
    private _range: Range;
    private _name: string;
    private _index: number;

    constructor(
        arr: RegExpExecArray,
        regObj: IRegexObject,
        txt: string,
        index: number,
        shiftLines: number,
    ) {
        const start = getPositionFromIndex(
            txt,
            arr.index + arr[regObj.skipIndex].length
        );
        const end = start.clone();
        this.getClosingBracketPosition(txt, end);
        start.line += shiftLines;
        end.line += shiftLines;
        this._range = new Range(start.position, end.position);

        this._name = getValueFromRegexArr(arr, regObj.nameIndices);
        this._index = index;
    }

    public async switch(editor: TextEditor, other: DocumentFunction): Promise<boolean> {
        return editor.edit((edit) => {
            const firstText = editor.document.getText(this.range);
            const secondText = editor.document.getText(other.range);

            edit.replace(this.range, secondText);
            edit.replace(other.range, firstText);

            this.swapInternal(other);
        });
    }

    get index(): number {
        return this._index;
    }

    set index(index: number) {
        this._index = index;
    }

    get name(): string {
        return this._name;
    }

    get range(): Range {
        return this._range;
    }

    set range(range: Range) {
        this._range = range;
    }

    private getClosingBracketPosition(txt: string, inout: IndexPosition): void {
        findPositionAfterBrackets(txt, "(", inout);
        findPositionAfterBrackets(txt, "{", inout);
    }

    private swapInternal(other: DocumentFunction): void {
        let first: DocumentFunction = this;
        let second: DocumentFunction = other;
        const firstIsUp = first.index < second.index;

        if (!firstIsUp) {
            [first, second] = [second, first];
        }

        const firstRange = MutableRange.fromRange(first.range);
        const firstCopy = first.range;
        const secondRange = MutableRange.fromRange(second.range);

        firstRange.start.line = secondRange.start.line +
            MutableRange.linesAmount(secondRange)
            - MutableRange.linesAmount(firstRange);
        firstRange.end.line = secondRange.end.line;

        secondRange.shiftLines(firstCopy.start.line - secondRange.start.line);

        first.range = firstRange.toRange();
        second.range = secondRange.toRange();

        if (!firstIsUp) {
            [first, second] = [second, first];
        }

        const tmp = first.index;
        first._index = second.index;
        second._index = tmp;
    }
}
