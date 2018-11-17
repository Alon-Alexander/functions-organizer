import * as vscode from "vscode";

import IndexPosition from "./indexPosition";

export function findPositionAfterBrackets(txt: string, open: string, ip: IndexPosition): void {
    const CLOSE_MAP: { [key: string]: string } = {
        "(": ")",
        "<": ">",
        "[": "]",
        "{": "}",
    };
    const close = CLOSE_MAP[open];

    // Find opening bracket
    while (ip.current !== open) {
        ip.advance();
    }

    // Find closing bracket
    let counter = 1;
    for (ip.advance(); counter > 0 && ip.index < txt.length; ip.advance()) {
        switch (ip.current) {
            case open:
                counter++;
                break;
            case close:
                counter--;
                break;
            default:
        }
    }
}

export function getPositionFromIndex(
    txt: string,
    index: number,
): IndexPosition {
    const ip = new IndexPosition(txt, 0, 0, 0);

    while (ip.index < index) {
        ip.advance();
    }

    return ip;
}

const defaultRange = new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(0, 0),
);
export function getDefaultRange() {
    return defaultRange;
}

export function getValueFromRegexArr(arr: RegExpExecArray, indices: number[]): string {
    for (let i = 0; i < indices.length; i++) {
        if (arr[indices[i]]) {
            return arr[indices[i]];
        }
    }
    return "";
}
