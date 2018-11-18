import { Selection } from "vscode";

import DocumentFunction from "./documentFunction";
import { IFunctionSelection } from "./interfaces";

export function getSelectionFunction(
    functions: DocumentFunction[],
    sel: Selection
): IFunctionSelection | null {
    for (let i = 0; i < functions.length; i++) {
        if (functions[i].range.contains(sel)) {
            const range = functions[i].range;

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
