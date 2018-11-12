import { Editor, Edit, Document } from "../interfaces";
import { Selection } from "vscode";

export class MockEditor implements Editor {
  document: Document;
  selection: Selection;
  private txt: string;

  edit(callback: (editBuilder: Edit) => void): Thenable<boolean> {
    callback({
      delete: location => {},
      insert: (location, value) => {},
      replace: (location, value) => {}
    });
    return Promise.resolve(true);
  }

  constructor(data: string, selection: Selection) {
    this.txt = data;
    this.selection = selection;
    this.document = {
      getText: range => {
        if (!range) {
          return this.txt;
        }

        const lines = this.txt.split("\n");
        if (range.start.line === range.end.line) {
          return lines[range.start.line - 1].substring(
            range.start.character,
            range.end.character
          );
        }
        let s = lines[range.start.line - 1].substring(range.start.character);
        for (let i = range.start.line; i < range.end.line - 1; i++) {
          s += lines[i];
        }
        s += lines[range.end.line - 1].substring(0, range.end.character);
        return s;
      }
    };
  }
}
