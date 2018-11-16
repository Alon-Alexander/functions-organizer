import { Range } from "vscode";
import { RegexObject } from "./interfaces";
import { getPositionFromIndex, findPositionAfterBrackets, getValueFromRegexArr } from "./utils";
import IndexPosition from "./indexPosition";

export default class DocumentFunction {
    private _range: Range;
    private _name: string;
    private _index: number;

    constructor(arr: RegExpExecArray, regObj: RegexObject, txt: string, index: number) {
        const start = getPositionFromIndex(
            txt,
            regObj.reg.lastIndex - arr[regObj.allIndex].length
        );
        const end = start.clone();
        this.getClosingBracketPosition(txt, end);
        this._range = new Range(start.position, end.position);

        this._name = getValueFromRegexArr(arr, regObj.nameIndices)
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
        findPositionAfterBrackets(txt, '(', inout);
        findPositionAfterBrackets(txt, '{', inout);
    }
}