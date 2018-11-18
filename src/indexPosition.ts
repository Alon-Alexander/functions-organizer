import { Position } from "vscode";

/**
 * A position in a document.
 * Holds both a vscode.Position and an index.
 */
export default class IndexPosition {
    public index: number;
    public line: number;
    public character: number;
    private txt: string;

    constructor(txt: string, index: number, line: number, character: number) {
        this.txt = txt;
        this.index = index;
        this.line = line;
        this.character = character;
    }

    get position(): Position {
        return new Position(this.line, this.character);
    }

    set text(txt: string) {
        this.txt = txt;
    }

    get current(): string {
        return this.txt[this.index];
    }

    public clone(): IndexPosition {
        return new IndexPosition(this.txt, this.index, this.line, this.character);
    }

    /**
     * Advance the object by one.
     * Change to position accordingly.
     */
    public advance(): void {
        if (this.txt[this.index] === "\n") {
            this.line++;
            this.character = 0;
        } else {
            this.character++;
        }
        this.index++;
    }

}
