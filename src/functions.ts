import { Position, Range, Selection, TextDocument, TextEditor } from "vscode";
import { mutableRange, rangeFromObject, findPositionAfterBrackets, getPositionFromIndex } from "./utils";
import { ISwapRanges, IRangeAndOffset } from "./interfaces";
import IndexPosition from "./indexPosition";
import consts from "./consts";
import re from "./regex";


export default class FunctionMove {
    private txt: string = "";
    private ranges: Range[] = [];

    private editor: TextEditor;
    private document: TextDocument;

    private language: string;
    private regType: string;

    constructor(e: TextEditor) {
        this.editor = e;
        this.document = e.document;

        this.language = consts.JAVASCRIPT;
        this.regType = consts.FUNCTION;

        this.txt = this.document.getText();
        this.getFunctionsRanges();
    }

    public moveUp(sel: Selection): Thenable<boolean> {
        const index = this.getSelectionRangeIndex(sel);
        if (this.ranges.length < 2 || !index) {
            return Promise.resolve(false);
        }

        if (index.rangeIndex > 0) {
            const sr: ISwapRanges = {
                ...index,
                secondIndex: index.rangeIndex - 1
            };
            return this.swapFunctions(sr).then(() => this.moveSelection(sr));
        }

        return Promise.resolve(false);
    }

    public moveDown(sel: Selection): Thenable<boolean> {
        const index = this.getSelectionRangeIndex(sel);
        if (this.ranges.length < 2 || !index) {
            return Promise.resolve(false);
        }

        if (index.rangeIndex < this.ranges.length - 1) {
            const sr: ISwapRanges = {
                ...index,
                secondIndex: index.rangeIndex + 1
            };
            return this.swapFunctions(sr).then(() => this.moveSelection(sr));
        }

        return Promise.resolve(false);
    }

    private getClosingBracketPosition(txt: string, inout: IndexPosition): void {
        findPositionAfterBrackets(txt, '(', inout);
        findPositionAfterBrackets(txt, '{', inout);
    }

    private getFunctionsRanges(): void {
        const ranges: Range[] = [];

        const reg: RegExp = re[this.language][this.regType];

        let arr = reg.exec(this.txt);
        while (arr !== null) {
            const start = getPositionFromIndex(
                this.txt,
                reg.lastIndex - arr[1].length
            );
            const end = start.clone();
            this.getClosingBracketPosition(this.txt, end);
            ranges.push(new Range(start.position, end.position));
            arr = reg.exec(this.txt);
        }

        this.ranges = ranges;
    }

    private getSelectionRangeIndex(sel: Selection): IRangeAndOffset | null {
        for (let i = 0; i < this.ranges.length; i++) {
            if (this.ranges[i].contains(sel)) {
                const range = this.ranges[i];

                return {
                    end: {
                        character: sel.end.character,
                        lineOffset: sel.end.line - range.start.line
                    },
                    rangeIndex: i,
                    start: {
                        character: sel.start.character,
                        lineOffset: sel.start.line - range.start.line
                    }
                };
            }
        }
        return null;
    }

    private moveSelection(index: ISwapRanges): boolean {
        const secondIsUp = index.secondIndex < index.rangeIndex;
        const mul = secondIsUp ? 0 : -1;

        const firstLines =
            this.ranges[index.rangeIndex].end.line -
            this.ranges[index.rangeIndex].start.line;
        const secondLines =
            this.ranges[index.secondIndex].end.line -
            this.ranges[index.secondIndex].start.line;

        const linesDiff = secondLines - firstLines;

        this.editor.selection = new Selection(
            new Position(
                this.ranges[index.secondIndex].start.line +
                index.start.lineOffset +
                mul * linesDiff,
                index.start.character
            ),
            new Position(
                this.ranges[index.secondIndex].start.line +
                index.end.lineOffset +
                mul * linesDiff,
                index.end.character
            )
        );
        return true;
    }

    private swapInternalRanges(sr: ISwapRanges) {
        let first = this.ranges[sr.rangeIndex];
        let second = this.ranges[sr.secondIndex];
        const switched = first.start.line > second.start.line;

        if (switched) {
            [first, second] = [second, first];
        }

        const firstNew = mutableRange(first);
        const secondNew = mutableRange(second);

        const diffLines = second.start.line - first.start.line;
        firstNew.start.line += diffLines;
        firstNew.end.line += diffLines;
        secondNew.start.line -= diffLines;
        secondNew.end.line -= diffLines;

        this.ranges[switched ? sr.secondIndex : sr.rangeIndex] = rangeFromObject(
            secondNew
        );
        this.ranges[switched ? sr.rangeIndex : sr.secondIndex] = rangeFromObject(
            firstNew
        );
    }

    private swapFunctions(sr: ISwapRanges): Thenable<boolean> {
        return this.editor.edit((edit) => {
            const firstText = this.document.getText(this.ranges[sr.rangeIndex]);
            const secondText = this.document.getText(this.ranges[sr.secondIndex]);

            edit.replace(this.ranges[sr.rangeIndex], secondText);
            edit.replace(this.ranges[sr.secondIndex], firstText);

            this.swapInternalRanges(sr);
        });
    }
}
