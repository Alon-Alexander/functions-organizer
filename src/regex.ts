// tslint:disable:max-line-length
import c from "./consts";

export default {
    [c.JAVASCRIPT]: {
        [c.CLASS]: {
            allIndex: 2,
            nameIndices: [3],
            reg: /((\n|^)\s*)(class\s+([a-zA-Z]\w*))/g,
            skipIndex: 1,
        },
        [c.CLASS_FUNCTION]: {
            allIndex: 1,
            nameIndices: [6],
            reg: /(\n\s*)((static\s+)?((get|set)\s+)?([a-zA-Z]\w*)\s*\([^)]*\))/g,
            skipIndex: 1,
        },
        [c.FUNCTION]: {
            allIndex: 2,
            nameIndices: [9, 7],
            reg: /((\n|^)\s*)((export\s+)?\s*(((const|var|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>)|(function\s+(\w+)\s*\([^)]*\))))/g,
            skipIndex: 1,
        },
    },
};
