import { getDefaultRange, getPositionFromIndex } from '../utils';
import { ACTION, IRange, readJSON, TestMap } from './testUtils';

export default class TestGenerator {

    private counter: number = 0;
    private expressions: string[];
    private statements: (string | boolean)[][];
    private blocks: (string | boolean)[][];
    private functions: (string | boolean)[][];

    constructor(
        private random: (len: number) => number,
        private maxFunctions: number,
        private maxStatement: number,
        private maxWhitespace: number,
        private maxNameLength: number,
    ) {
        const data = readJSON('automated.data.json');
        this.expressions = data.expressions;
        this.statements = data.statements;
        this.blocks = data.blocks;
        this.functions = data.functions;
    }

    public generate(): TestMap {
        const size = (arr: string[]) => arr.reduce((p, n) => p + n.length, 0);
        const amount = this.random(this.maxFunctions - 1) + 2;
        const swapIndex = this.random(amount);
        let builderIn: string[] = [];
        let builderOut: string[] = [];

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

                const bInTxt = builderIn.join('');
                const beforeIp = getPositionFromIndex(bInTxt, builderSize);

                // Decide selection
                const offset = this.random(size(first) - 3) + 1;
                const selectionSize = Math.max(0, this.random(size(first) - offset - 2));

                // Create before range
                for (let i = 0; i < offset; i++) {
                    beforeIp.advance(bInTxt);
                }
                const beforeEnd = beforeIp.clone();
                for (let i = 0; i < selectionSize; i++) {
                    beforeEnd.advance(bInTxt);
                }

                beforeRange = {
                    start: beforeIp.position,
                    end: beforeEnd.position,
                };

                // Generate and append mid-block
                const midBlock = this.generateStatementBlock();
                builderIn.push(...midBlock);
                builderOut.push(...midBlock);

                builderSize = size(builderOut);

                builderIn.push(wsSecond, ...second);
                builderOut.push(wsFirst, ...first);

                // Create after range
                const bOutTxt = builderOut.join('');
                const afterIp = getPositionFromIndex(bOutTxt, builderSize);
                for (let i = 0; i < offset; i++) {
                    afterIp.advance(bOutTxt);
                }
                const afterEnd = afterIp.clone();
                for (let i = 0; i < selectionSize; i++) {
                    afterEnd.advance(bOutTxt);
                }

                afterRange = {
                    start: afterIp,
                    end: afterEnd,
                };

                i++
            } else {
                func = [this.randomWhitespace(true, true), ...this.generateFunction()];

                builderIn.push(...func);
                builderOut.push(...func);
            }

            builderIn.push(...block);
            builderOut.push(...block);
        }

        let beforeContent = builderIn.join('');
        let afterContent = builderOut.join('');

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
            name: `Generated ${this.counter++}`,
            isGenerated: true,
            beforeContent,
            afterContent,
            language: 'javascript',
            returnValue: true,
            action,
            beforeRange,
            afterRange,
        };
    }

    private generateFunction = (): string[] => {
        let builder: string[] = [];
        const func = this.choose(this.functions);

        builder.push(...this.fillComplex(func, this.generateName));
        builder.push("{")
        builder.push(...this.generateStatementBlock());
        builder.push("}")

        if (func[0] !== "funcion") {
            builder.push(";\n");
        }

        return builder;
    }

    private generateName = (): string => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const alphanumery: string[] = [...alphabet, ...'1234567890'.split('')]

        let builder = "";
        builder += this.choose(alphabet);
        for (let i = 0; i < this.random(this.maxNameLength); i++) {
            builder += this.choose(alphanumery);
        }
        return builder;
    }

    private generateStatementBlock = (): string[] => {
        const amount = this.random(this.maxStatement + 1);
        const blockIndex = this.randomBoolean() ? this.random(amount) : -1;
        let builder: string[] = [];

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

    private fillComplex = (comp: (string | boolean)[], falseGenerate: () => string): string[] => {
        const builder: string[] = [];

        for (let j = 0; j < comp.length; j++) {
            if (comp[j] === false) {
                builder.push(falseGenerate());
                builder.push(this.randomWhitespace(false, true));
            } else if (comp[j] === true) {
                builder.push(this.randomWhitespace(true, true));
                builder.push(...this.fillComplex(this.choose(this.statements), falseGenerate));
                builder.push(this.randomWhitespace(true, true));
            } else {
                builder.push(String(comp[j]));
                builder.push(this.randomWhitespace(false, false));
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
        const wsInline = [' '];
        const wss = [...wsInline, '\n']

        const amount: number = allowEmpty ? this.random(this.maxWhitespace + 1) : (this.random(this.maxWhitespace) + 1);
        const list = allowNewline ? wss : wsInline;

        return Array.from(Array(amount)).map(() => String(this.choose(list))).reduce((p, n) => p + n, '');
    }
}