import { getDefaultRange, getPositionFromIndex } from "../utils";
import { ACTION, IRange, ITestMap, readJSON } from "./testUtils";

interface IMaxObj {
    maxStatement: number;
    maxFunctions: number;
    maxWhitespace: number;
    maxNameLength: number;
}

export default class TestGenerator {

    private counter: number = 0;
    private expressions: string[];
    private statements: Array<Array<string | boolean>>;
    private blocks: Array<Array<string | boolean>>;
    private functions: Array<Array<string | boolean>>;
    private max: IMaxObj;

    constructor(
        private random: (len: number) => number,
        max: IMaxObj,
    ) {
        this.max = max;
        const data = readJSON("automated.data.json");
        this.expressions = data.expressions;
        this.statements = data.statements;
        this.blocks = data.blocks;
        this.functions = data.functions;
    }

    public generate(): ITestMap {
        const size = (arr: string[]) => arr.reduce((p, n) => p + n.length, 0);
        const amount = this.randomWithMin(this.max.maxFunctions + 1, 2);
        const swapIndex = this.random(amount);
        const builderIn: string[] = [];
        const builderOut: string[] = [];

        let beforeRange: IRange = getDefaultRange();
        let afterRange: IRange = getDefaultRange();

        let func;
        let block;
        if (this.randomBoolean()) {
            block = this.generateStatementBlock();

            builderIn.push(...block);
            builderOut.push(...block);
        }
        for (let i = 0; i < amount; i++) {
            block = this.generateStatementBlock();

            if (i === swapIndex) {
                // Generate 2 functions
                const first = this.generateFunction();
                const second = this.generateFunction();
                const wsFirst = "\n";
                const wsSecond = "\n";

                // Get an index-position to this location
                let builderSize = size(builderIn);

                // Push different functions to the builders
                builderIn.push(wsFirst, ...first);
                builderOut.push(wsSecond, ...second);

                const bInTxt = builderIn.join("");
                const beforeIp = getPositionFromIndex(bInTxt, builderSize);

                // Decide selection
                const offset = this.randomWithMin(size(first) - 2, 1);
                const selectionSize = Math.max(0, this.random(size(first) - offset - 2));

                // Create before range
                for (let j = 0; j < offset; j++) {
                    beforeIp.advance();
                }
                const beforeEnd = beforeIp.clone();
                for (let j = 0; j < selectionSize; j++) {
                    beforeEnd.advance();
                }

                beforeRange = {
                    end: beforeEnd.position,
                    start: beforeIp.position,
                };

                // Generate and append mid-block
                const midBlock = this.generateStatementBlock();
                builderIn.push(...midBlock);
                builderOut.push(...midBlock);

                builderSize = size(builderOut);

                builderIn.push(wsSecond, ...second);
                builderOut.push(wsFirst, ...first);

                // Create after range
                const bOutTxt = builderOut.join("");
                const afterIp = getPositionFromIndex(bOutTxt, builderSize);
                for (let j = 0; j < offset; j++) {
                    afterIp.advance();
                }
                const afterEnd = afterIp.clone();
                for (let j = 0; j < selectionSize; j++) {
                    afterEnd.advance();
                }

                afterRange = {
                    end: afterEnd,
                    start: afterIp,
                };

                i++;
            } else {
                func = [this.randomWhitespace(true, true), ...this.generateFunction()];

                builderIn.push(...func);
                builderOut.push(...func);
            }

            builderIn.push(...block);
            builderOut.push(...block);
        }

        let beforeContent = builderIn.join("");
        let afterContent = builderOut.join("");

        // Decide whether action is UP or DOWN
        let action: ACTION;
        if (this.randomBoolean()) {
            action = ACTION.UP;
            [beforeContent, afterContent] = [afterContent, beforeContent];
            [beforeRange, afterRange] = [afterRange, beforeRange];
        } else {
            action = ACTION.DOWN;
        }

        return {
            action,
            afterContent,
            afterRange,
            beforeContent,
            beforeRange,
            isGenerated: true,
            language: "javascript",
            name: `Generated ${this.counter++}`,
            returnValue: true,
        };
    }

    private generateFunction = (): string[] => {
        const builder: string[] = [];
        const func = this.choose(this.functions);

        builder.push(...this.fillComplex(func, this.generateName));
        builder.push("{");
        builder.push(...this.generateStatementBlock());
        builder.push("}");

        if (func[0] !== "funcion") {
            builder.push(";\n");
        }

        return builder;
    }

    private generateName = (): string => {
        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        const alphanumery: string[] = [...alphabet, ..."1234567890".split("")];

        let builder = "";
        builder += this.choose(alphabet);
        for (let i = 0; i < this.random(this.max.maxNameLength); i++) {
            builder += this.choose(alphanumery);
        }
        return builder;
    }

    private generateStatementBlock = (): string[] => {
        const amount = this.random(this.max.maxStatement + 1);
        const blockIndex = this.randomBoolean() ? this.random(amount) : -1;
        const builder: string[] = [];

        let block;
        for (let i = 0; i < amount; i++) {
            if (i === blockIndex) {
                block = this.choose(this.blocks);
            } else {
                block = this.choose(this.statements);
            }
            builder.push(this.randomWhitespace(true, true));
            builder.push(...this.fillComplex(block, () => this.choose(this.expressions)));

            if (i !== blockIndex) {
                builder.push(";");
            }
        }

        return builder;
    }

    private fillComplex = (
        comp: Array<string | boolean>,
        falseGenerate: () => string,
    ): string[] => {
        const builder: string[] = [];

        for (let j = 0; j < comp.length; j++) {
            if (comp[j] === false) {
                builder.push(
                    falseGenerate(),
                    this.randomWhitespace(false, true),
                );
            } else if (comp[j] === true) {
                builder.push(
                    this.randomWhitespace(true, true),
                    ...this.fillComplex(this.choose(this.statements), falseGenerate),
                    this.randomWhitespace(true, true),
                );
            } else {
                builder.push(
                    String(comp[j]),
                    this.randomWhitespace(false, false),
                );
            }
        }

        return builder;
    }

    private choose = (arr: any[]): any => {
        return arr[this.random(arr.length)];
    }

    private randomBoolean = (): boolean => {
        return this.random(2) === 1;
    }

    private randomWhitespace = (allowNewline: boolean, allowEmpty: boolean): string => {
        const wsInline = [" "];
        const wss = [...wsInline, "\n"];

        const amount: number = this.randomWithMin(this.max.maxWhitespace + 1, allowEmpty ? 0 : 1);
        const list = allowNewline ? wss : wsInline;

        return Array.from(Array(amount))
            .map(() => String(this.choose(list)))
            .reduce((p, n) => p + n, "");
    }

    private randomWithMin(len: number, min: number) {
        return this.random(len - min) + min;
    }
}
