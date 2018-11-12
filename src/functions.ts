import * as vscode from "vscode";
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import Position = vscode.Position;
import { AssertionError } from "assert";

interface IndexPosition {
  index: number;
  position: Position;
}

interface RangeAndOffset {
  rangeIndex: number;
  start: {
    lineOffset: number;
    character: number;
  };
  end: {
    lineOffset: number;
    character: number;
  };
}

interface SwapRanges extends RangeAndOffset {
  secondIndex: number;
}

export default class FunctionMove {
  private txt: string = "";
  private ranges: Range[] = [];

  private editor: TextEditor;
  private document: TextDocument;

  constructor(e: TextEditor) {
    this.editor = e;
    this.document = e.document;

    this.txt = this.document.getText();
    this.getFunctionsRanges();
  }

  private getPositionFromIndex(
    txt: string,
    index: number,
    start: IndexPosition | null = null
  ): IndexPosition {
    if (!start) {
      start = {
        index: 0,
        position: new Position(0, 0)
      };
    }

    let line = start.position.line;
    let character = start.position.character;
    for (let i = start.index; i < index; i++) {
      if (txt[i] === "\n") {
        line++;
        character = 0;
      } else {
        character++;
      }
    }

    return {
      index,
      position: new Position(line, character)
    };
  }

  private getClosingBracketPosition(txt: string, start: IndexPosition) {
    let i = start.index;
    let line = start.position.line;
    let character = start.position.character;

    while (txt[i] !== "{") {
      i++;
      if (txt[i] === "\n") {
        line++;
        character = 0;
      } else {
        character++;
      }
    }
    let counter = 1;
    for (i++; counter > 0; i++) {
      switch (txt[i]) {
        case "{":
          counter++;
          break;
        case "}":
          counter--;
          break;
        default:
      }
      if (txt[i] === "\n") {
        line++;
        character = 0;
      } else {
        character++;
      }
    }
    return {
      index: i,
      position: new Position(line, character)
    };
  }

  private getFunctionsRanges(): void {
    const ranges: Range[] = [];

    const reg: RegExp = /function\s+\w+\s*\([^)]*\)/g;

    let arr;
    while ((arr = reg.exec(this.txt)) !== null) {
      const start = this.getPositionFromIndex(
        this.txt,
        reg.lastIndex - arr[0].length
      );
      const end = this.getClosingBracketPosition(this.txt, start);
      ranges.push(new Range(start.position, end.position));
    }

    this.ranges = ranges;
  }

  private getSelectionRangeIndex(sel: Selection): RangeAndOffset | null {
    for (let i = 0; i < this.ranges.length; i++) {
      if (this.ranges[i].contains(sel)) {
        const range = this.ranges[i];

        return {
          rangeIndex: i,
          start: {
            lineOffset: sel.start.line - range.start.line,
            character: sel.start.character
          },
          end: {
            lineOffset: sel.end.line - range.start.line,
            character: sel.end.character
          }
        };
      }
    }
    return null;
  }

  private moveSelection(index: SwapRanges): void {
    const mul = index.secondIndex < index.rangeIndex ? 0 : 1;
    const firstLines = this.ranges[index.rangeIndex].end.line - this.ranges[index.rangeIndex].start.line;
    const secondLines = this.ranges[index.secondIndex].end.line - this.ranges[index.secondIndex].start.line;
    const linesDiff = secondLines - firstLines;

    this.editor.selection = new Selection(
      new Position(
        this.ranges[index.secondIndex].start.line + index.start.lineOffset + mul * linesDiff,
        index.start.character
      ),
      new Position(
        this.ranges[index.secondIndex].start.line + index.end.lineOffset + mul * linesDiff,
        index.end.character
      )
    );
  }

  private swapFunctions(
    sr: SwapRanges
  ): Thenable<boolean> {
    return this.editor.edit(edit => {
      const first = this.document.getText(this.ranges[sr.rangeIndex]);
      const second = this.document.getText(this.ranges[sr.secondIndex]);

      edit.replace(this.ranges[sr.rangeIndex], second);
      edit.replace(this.ranges[sr.secondIndex], first);
    });
  }

  public moveUp(sel: Selection): void {
    const index = this.getSelectionRangeIndex(sel);
    if (this.ranges.length < 2 || !index) {
      return;
    }

    if (index.rangeIndex > 0) {
      const sr: SwapRanges = {
        ...index,
        secondIndex: index.rangeIndex - 1,
      };
      this.swapFunctions(sr).then(() =>
        this.moveSelection(sr)
      );
    }
  }

  public moveDown(sel: Selection): void {
    const index = this.getSelectionRangeIndex(sel);
    if (this.ranges.length < 2 || !index) {
      return;
    }

    if (index.rangeIndex < this.ranges.length - 1) {
      const sr: SwapRanges = {
        ...index,
        secondIndex: index.rangeIndex + 1,
      };
      this.swapFunctions(sr).then(() =>
        this.moveSelection(sr)
      );
    }
}
