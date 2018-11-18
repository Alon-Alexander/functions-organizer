import { Position, Range, Selection, TextEditor } from "vscode";

import DocumentFunction from "./documentFunction";
import { IFunctionSelection, IRegexObject } from "./interfaces";
import MutableRange from "./mutableRange";
import { getSelectionFunction } from "./organizableUtils";

export default abstract class Organizable {
    protected txt: string = "";
    protected _range: MutableRange;
    protected editor: TextEditor;
    protected regObj: IRegexObject;
    protected functions: DocumentFunction[] = [];

    constructor(range: Range, editor: TextEditor, regObj: IRegexObject) {
        this._range = MutableRange.fromRange(range);
        this.editor = editor;
        this.regObj = regObj;
        this.init();
    }

    public async moveUp(sel: Selection): Promise<boolean> {
        const fsel = getSelectionFunction(this.functions, sel);
        if (this.functions.length < 2 || !fsel) {
            return Promise.resolve(false);
        }

        if (fsel.functionIndex > 0) {
            return this
                .switch(fsel.functionIndex, fsel.functionIndex - 1)
                .then(() => this.moveSelection({
                    ...fsel,
                    functionIndex: fsel.functionIndex - 1,
                }))
                .then(() => true);
        }

        return false;
    }

    public async moveDown(sel: Selection): Promise<boolean> {
        const fsel = getSelectionFunction(this.functions, sel);
        if (this.functions.length < 2 || !fsel) {
            return false;
        }
        if (fsel.functionIndex < this.functions.length - 1) {
            return this
                .switch(fsel.functionIndex, fsel.functionIndex + 1)
                .then(() => this.moveSelection({
                    ...fsel,
                    functionIndex: fsel.functionIndex + 1,
                }))
                .then(() => true);
        }

        return false;
    }

    public async sort(sel: Selection): Promise<boolean> {
        const getSortedAndFunctions: () => {
            functions: DocumentFunction[],
            sorted: DocumentFunction[]
        } = () => {
            const funcs = this.functions.filter((func) => sel.contains(func.range));

            const sortedFuncs = funcs.slice(0);
            sortedFuncs.sort((funcA, funcB) => {
                if (funcA.name < funcB.name) { return -1; }
                if (funcA.name > funcB.name) { return 1; }
                return 0;
            });
            return {
                functions: funcs,
                sorted: sortedFuncs,
            };
        };

        if ((!sel) || sel.isEmpty) {
            sel = new Selection(
                this.range.start,
                this.range.end,
            );
        }

        let { functions, sorted } = getSortedAndFunctions();

        for (let i = 0; i < sorted.length; i++) {
            if (functions[i].name !== sorted[i].name) {
                await this.switch(
                    this.functions.indexOf(functions[i]),
                    this.functions.indexOf(sorted[i]),
                );

                this.init();
                const saf = getSortedAndFunctions();
                functions = saf.functions;
                sorted = saf.sorted;
            }
        }
        return true;
    }

    public contains(sel: Selection): boolean {
        return this.range.contains(sel);
    }

    get range(): Range {
        return this._range.toRange();
    }

    private init(): void {
        this.txt = this.editor.document.getText(this.range);
        this.initFunctions();
    }

    private initFunctions(): void {
        this.functions = [];

        let arr = this.regObj.reg.exec(this.txt);
        let cnt = 0;
        while (arr !== null) {
            const df = new DocumentFunction(
                arr,
                this.regObj,
                this.txt,
                cnt++,
                this.range.start.line,
            );
            this.functions.push(df);
            arr = this.regObj.reg.exec(this.txt);
        }
    }

    private switch(i1: number, i2: number): Promise<void> {
        return this.functions[i1]
            .switch(this.editor, this.functions[i2])
            .then(() => {
                const tmp = this.functions[i1];
                this.functions[i1] = this.functions[i2];
                this.functions[i2] = tmp;
            });
    }

    private moveSelection(fsel: IFunctionSelection): void {
        const startLine = this.functions[fsel.functionIndex].range.start.line;

        this.editor.selection = new Selection(
            new Position(
                startLine + fsel.start.line,
                fsel.start.character,
            ),
            new Position(
                startLine + fsel.end.line,
                fsel.end.character,
            )
        );
    }
}
