import * as vscode from 'vscode';

import IndexPosition from './indexPosition';
import MutableRange from './mutableRange';

export function rangeFromObject(mr: MutableRange): vscode.Range {
    return new vscode.Range(
        new vscode.Position(mr.start.line, mr.start.character),
        new vscode.Position(mr.end.line, mr.end.character)
    );
}

export function findPositionAfterBrackets(txt: string, open: string, ip: IndexPosition): void {
    const CLOSE_MAP: { [key: string]: string } = {
        '(': ')',
        '{': '}',
        '[': ']',
        '<': '>',
    };
    const close = CLOSE_MAP[open];

    // Find opening bracket
    while (txt[ip.index] !== open) {
        ip.advance(txt);
    }

    // Find closing bracket
    let counter = 1;
    for (ip.advance(txt); counter > 0 && ip.index < txt.length; ip.advance(txt)) {
        switch (txt[ip.index]) {
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
    const ip = new IndexPosition(0, 0, 0);

    while (ip.index < index) {
        ip.advance(txt);
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
    for (let i = 0; i < indices.length; i++)
        if (arr[indices[i]])
            return arr[indices[i]];
    return '';
}