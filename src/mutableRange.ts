import { Range, Position } from "vscode";

interface IPosition {
    line: number;
    character: number;
}

export default class MutableRange {
    constructor(public start: IPosition, public end: IPosition) { }

    public static fromRange(range: Range): MutableRange {
        return new this({
            line: range.start.line,
            character: range.start.character,
        },
            {
                line: range.end.line,
                character: range.end.character,
            });
    }

    public toRange(): Range {
        return new Range(
            new Position(this.start.line, this.start.character),
            new Position(this.end.line, this.end.character),
        );
    }

    public shiftLines(amount: number): void {
        this.start.line += amount;
        this.end.line += amount;
    }

    public static linesAmount(range: MutableRange | Range): number {
        return range.end.line - range.start.line;
    }
}