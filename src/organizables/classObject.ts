import { Range, TextEditor } from "vscode";

import consts from "../consts";
import Organizable from "../organizable";
import re from "../regex";

export default class ClassObject extends Organizable {
    constructor(range: Range, editor: TextEditor, language: string) {
        super(range, editor, re[language][consts.CLASS_FUNCTION]);
    }
}
