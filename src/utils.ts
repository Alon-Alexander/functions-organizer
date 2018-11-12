import * as vscode from "vscode";

interface MutableRange {
  start: {
    line: number;
    character: number;
  };
  end: {
    line: number;
    character: number;
  };
}

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
