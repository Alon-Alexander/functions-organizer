import { Position, Selection, TextDocument, TextEditor } from "vscode";

import consts from "./consts";
import DocumentFunction from "./documentFunction";
import { IFunctionSelection, IRegexObject, ISwapFunctions, ISwapRanges } from "./interfaces";
import MutableRange from "./mutableRange";
import re from "./regex";

export default class Organizer {
    private txt: string = "";
    private editor: TextEditor;
    private document: TextDocument;

    private functions: DocumentFunction[] = [];

    private language: string;
    private regType: string;

    constructor(e: TextEditor) {
        this.editor = e;
        this.document = e.document;

        this.language = consts.JAVASCRIPT;
        this.regType = consts.FUNCTION;

        this.init();
    }

    public moveUp(sel: Selection): Thenable<boolean> {
        const fsel = this.getSelectionFunction(sel);
        if (this.functions.length < 2 || !fsel) {
            return Promise.resolve(false);
        }

        if (fsel.functionIndex > 0) {
            return this.swapFunctions({
                first: this.functions[fsel.functionIndex],
                second: this.functions[fsel.functionIndex - 1],
            }).then(() => {
                return this.moveSelection({
                    ...fsel,
                    functionIndex: fsel.functionIndex - 1,
                });
            });
        }

        return Promise.resolve(false);
    }

    public moveDown(sel: Selection): Thenable<boolean> {
        const fsel = this.getSelectionFunction(sel);
        if (this.functions.length < 2 || !fsel) {
            return Promise.resolve(false);
        }

        if (fsel.functionIndex < this.functions.length - 1) {
            return this.swapFunctions({
                first: this.functions[fsel.functionIndex],
                second: this.functions[fsel.functionIndex + 1],
            }).then(() => {
                return this.moveSelection({
                    ...fsel,
                    functionIndex: fsel.functionIndex + 1,
                });
            });
        }

        return Promise.resolve(false);
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
                this.document.positionAt(0),
                this.document.positionAt(this.document.getText().length),
            );
        }

        let { functions, sorted } = getSortedAndFunctions();

        for (let i = 0; i < sorted.length; i++) {
            if (functions[i].name !== sorted[i].name) {
                await this.swapFunctions({
                    first: functions[i],
                    second: sorted[i],
                });

                this.init();
                const saf = getSortedAndFunctions();
                functions = saf.functions;
                sorted = saf.sorted;
            }
        }
        return true;
    }

    private init(): void {
        this.txt = this.document.getText();
        this.initFunctions();
    }

    private initFunctions(): void {
        const regObj: IRegexObject = re[this.language][this.regType];
        this.functions = [];

        let arr = regObj.reg.exec(this.txt);
        let cnt = 0;
        while (arr !== null) {
            const df = new DocumentFunction(arr, regObj, this.txt, cnt++);
            this.functions.push(df);
            arr = regObj.reg.exec(this.txt);
        }
    }

    private getSelectionFunction(sel: Selection): IFunctionSelection | null {
        for (let i = 0; i < this.functions.length; i++) {
            if (this.functions[i].range.contains(sel)) {
                const range = this.functions[i].range;

                return {
                    end: {
                        character: sel.end.character,
                        line: sel.end.line - range.start.line,
                    },
                    functionIndex: i,
                    start: {
                        character: sel.start.character,
                        line: sel.start.line - range.start.line,
                    },
                };
            }
        }
        return null;
    }

    private moveSelection(sel: IFunctionSelection): boolean {
        const startLine = this.functions[sel.functionIndex].range.start.line;

        this.editor.selection = new Selection(
            new Position(
                startLine + sel.start.line,
                sel.start.character,
            ),
            new Position(
                startLine + sel.end.line,
                sel.end.character,
            )
        );

        return true;
    }

    private swapInternalFunctions(sr: ISwapRanges) {
        let first = this.functions[sr.firstIndex];
        let second = this.functions[sr.secondIndex];

        const firstIsUp = sr.firstIndex < sr.secondIndex;

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

        this.functions[sr.firstIndex] = second;
        this.functions[sr.secondIndex] = first;
    }

    private swapFunctions(sr: ISwapFunctions): Thenable<boolean> {
        return this.editor.edit((edit) => {
            const firstText = this.document.getText(sr.first.range);
            const secondText = this.document.getText(sr.second.range);

            edit.replace(sr.first.range, secondText);
            edit.replace(sr.second.range, firstText);

            this.swapInternalFunctions({
                firstIndex: sr.first.index,
                secondIndex: sr.second.index,
            });
        });
    }
}
