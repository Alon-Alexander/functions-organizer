export interface IRangeAndOffset {
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

export interface ISwapRanges extends IRangeAndOffset {
    secondIndex: number;
}

export interface MutableRange {
    start: {
        line: number;
        character: number;
    };
    end: {
        line: number;
        character: number;
    };
}
