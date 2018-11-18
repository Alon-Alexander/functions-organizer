import { Range, Selection } from "vscode";
import consts from "./consts";
import DocumentFunction from "./documentFunction";
import { IOrganizable, IRegexObject } from "./interfaces";
import MutableRange from "./mutableRange";
import re from "./regex";

export default class ClassObject implements IOrganizable {
    private txt: string;
    private _range: MutableRange;
    private language: string;
    private functions: DocumentFunction[];
    private name: string;

    constructor(txt: string, range: Range, language: string) {
        this.txt = txt;
        this._range = MutableRange.fromRange(range);
        this.language = language;
        this.functions = this.initFunctions();
        this.name = this.initName();
    }

    get range(): Range {
        return this._range.toRange();
    }

    public async moveUp(sel: Selection): Promise<boolean> {
        return true;
    }

    public async moveDown(sel: Selection): Promise<boolean> {
        return true;
    }

    public async sort(sel: Selection): Promise<boolean> {
        return true;
    }

    private initFunctions(): DocumentFunction[] {
        const functions: DocumentFunction[] = [];
        const regObj: IRegexObject = re[this.language][consts.CLASS_FUNCTION];

        let arr = regObj.reg.exec(this.txt);
        let cnt = 0;
        while (arr !== null) {
            const df = new DocumentFunction(arr, regObj, this.txt, cnt++);
            functions.push(df);
            arr = regObj.reg.exec(this.txt);
        }
        return functions;
    }

    private initName(): string {
        const regObj: IRegexObject = re[this.language][consts.CLASS];

        const arr = regObj.reg.exec(this.txt);

        if (!arr) {
            throw Error("ClassObject created with invalid input");
        }

        return arr[regObj.nameIndices[0]];
    }
}
