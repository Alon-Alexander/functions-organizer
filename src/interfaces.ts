import DocumentFunction from "./documentFunction";

export interface IFunctionSelection {
    functionIndex: number;
    start: {
        line: number;
        character: number;
    },
    end: {
        line: number;
        character: number;
    };
}

export interface IFunctionSelectionSwitch extends IFunctionSelection {
    secondIndex: number;
}

export interface ISwapRanges {
    firstIndex: number;
    secondIndex: number;
}

export interface ISwapFunctions {
    first: DocumentFunction;
    second: DocumentFunction;
}

export interface RegexObject {
    reg: RegExp;
    allIndex: number;
    nameIndices: [number];
}
