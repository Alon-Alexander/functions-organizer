import { Range, TextEditor } from "vscode";

import consts from "../consts";
import Organizable from "../organizable";
import regex from "../regex";

export default class GlobalFunctions extends Organizable {
    constructor(range: Range, editor: TextEditor, language: string) {
        super(range, editor, regex[language][consts.FUNCTION]);
    }
}
