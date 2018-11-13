import * as vscode from 'vscode';

import { MutableRange } from './interfaces';
import IndexPosition from './indexPosition';

export function mutableRange(p: vscode.Range): MutableRange {
    return {
        start: {
            line: p.start.line,
            character: p.start.character
        },
        end: {
            line: p.end.line,
            character: p.end.character
        }
    };
}

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
        ip.index++;
        if (txt[ip.index] === "\n") {
            ip.line++;
            ip.character = 0;
        } else {
            ip.character++;
        }
    }

    // Find closing bracket
    let counter = 1;
    for (ip.index++; counter > 0; ip.index++) {
        switch (txt[ip.index]) {
            case open:
                counter++;
                break;
            case close:
                counter--;
                break;
            default:
        }
        if (txt[ip.index] === "\n") {
            ip.line++;
            ip.character = 0;
        } else {
            ip.character++;
        }
    }
}

export function getPositionFromIndex(
    txt: string,
    index: number,
): IndexPosition {
    const ip = new IndexPosition(0, 0, 0);

    for (; ip.index < index; ip.index++) {
        if (txt[ip.index] === "\n") {
            ip.line++;
            ip.character = 0;
        } else {
            ip.character++;
        }
    }

    return ip;
}
