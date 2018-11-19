import { Range, Selection, TextDocument, TextEditor } from "vscode";

import consts from "./consts";
import { IRegexObject } from "./interfaces";
import ClassObject from "./organizables/classObject";
import GlobalFunctions from "./organizables/globalFunctions";
import regex from "./regex";
import { findPositionAfterBrackets, getPositionFromIndex } from "./utils";

export default class Organizer {
    private editor: TextEditor;
    private document: TextDocument;

    private gf: GlobalFunctions;
    private classes: ClassObject[] = [];

    private language: string;

    constructor(e: TextEditor) {
        this.editor = e;
        this.document = e.document;

        this.language = consts.JAVASCRIPT;

        this.gf = new GlobalFunctions(
            new Range(
                this.document.positionAt(0),
                this.document.positionAt(this.document.getText().length),
            ),
            this.editor,
            this.language,
        );

        this.initClasses();
    }

    public moveUp(sel: Selection): Thenable<boolean> {
        for (let i = 0; i < this.classes.length; i++) {
            if (this.classes[i].contains(sel)) {
                return this.classes[i].moveUp(sel);
            }
        }
        return this.gf.moveUp(sel);
    }

    public moveDown(sel: Selection): Thenable<boolean> {
        for (let i = 0; i < this.classes.length; i++) {
            if (this.classes[i].contains(sel)) {
                return this.classes[i].moveDown(sel);
            }
        }
        return this.gf.moveDown(sel);
    }

    public async sort(sel: Selection): Promise<boolean> {
        for (let i = 0; i < this.classes.length; i++) {
            if (this.classes[i].contains(sel)) {
                return this.classes[i].sort(sel);
            }
        }
        return this.gf.sort(sel);
    }

    private initClasses(): void {
        this.classes = [];
        const txt = this.document.getText();
        const regObj: IRegexObject = regex[this.language][consts.CLASS];

        txt.replace(regObj.reg, (sub, ...arr) => {
            const start = getPositionFromIndex(
                txt,
                arr[arr.length - 2] + arr[regObj.skipIndex].length,
            );
            const end = start.clone();
            findPositionAfterBrackets(txt, "{", end);
            const co = new ClassObject(
                new Range(
                    start.position,
                    end.position,
                ),
                this.editor,
                this.language,
            );
            this.classes.push(co);

            return sub;
        });
        return;
    }
}
