import { Position, Range } from "vscode";

interface IPosition {
    line: number;
    character: number;
}

export default class MutableRange {
    public static fromRange(range: Range): MutableRange {
        return new this({
            character: range.start.character,
            line: range.start.line,
        },
            {
                character: range.end.character,
                line: range.end.line,
            });
    }

    public static linesAmount(range: MutableRange | Range): number {
        return range.end.line - range.start.line;
    }

    constructor(public start: IPosition, public end: IPosition) { }

    /**
     * Return a vscode.Range with this instance's state
     */
    public toRange(): Range {
        return new Range(
            new Position(this.start.line, this.start.character),
            new Position(this.end.line, this.end.character),
        );
    }

    /**
     * Advance the range by a given amount of lines.
     * Add _amount_ to start and end line numbers.
     *
     * @param amount Amount of lines to advace the range.
     */
    public shiftLines(amount: number): void {
        this.start.line += amount;
        this.end.line += amount;
    }
}
