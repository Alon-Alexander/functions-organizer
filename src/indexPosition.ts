import { Position } from 'vscode';

export default class IndexPosition {
    public index: number;
    public line: number;
    public character: number;

    constructor(index: number, line: number, character: number) {
        this.index = index;
        this.line = line;
        this.character = character;
    }

    get position(): Position {
        return new Position(this.line, this.character);
    }

    public clone(): IndexPosition {
        return new IndexPosition(this.index, this.line, this.character);
    }
}