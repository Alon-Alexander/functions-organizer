import { Range } from "vscode";

import IndexPosition from "./indexPosition";
import { IRegexObject } from "./interfaces";
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

    constructor(arr: RegExpExecArray, regObj: IRegexObject, txt: string, index: number) {
        const start = getPositionFromIndex(
            txt,
            regObj.reg.lastIndex - arr[regObj.allIndex].length
        );
        const end = start.clone();
        this.getClosingBracketPosition(txt, end);
        this._range = new Range(start.position, end.position);

        this._name = getValueFromRegexArr(arr, regObj.nameIndices);
        this._index = index;
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
}
