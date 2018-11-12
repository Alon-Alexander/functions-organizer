import * as vscode from "vscode";
export import Range = vscode.Range;
export import Selection = vscode.Selection;
export import Position = vscode.Position;

export interface Editor {
  document: Document;
  selection: Selection;
  edit: (callback: (editBuilder: Edit) => void) => Thenable<boolean>;
}

export interface Document {
  getText: (range?: Range | undefined) => string;
}

export interface Edit {
  replace: (location: Range, value: string) => void;
  insert: (location: Position, value: string) => void;
  delete: (location: Range | Selection) => void;
}
