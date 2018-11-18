// tslint:disable:max-line-length
import c from "./consts";

export default {
    [c.JAVASCRIPT]: {
        [c.CLASS]: {
            allIndex: 2,
            nameIndices: [3],
            reg: /(\n|^)\s*(class\s+([a-zA-Z]\w*))/g,
        },
        [c.CLASS_FUNCTION]: {
            allIndex: 1,
            nameIndices: [5],
            reg: /\n\s*((static\s+)?((get|set)\s+)?([a-zA-Z]\w*)\s*\([^)]*\))/g,
        },
        [c.FUNCTION]: {
            allIndex: 2,
            nameIndices: [9, 7],
            reg: /(\n|^)\s*((export\s+)?\s*(((const|var|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>)|(function\s+(\w+)\s*\([^)]*\))))/g,
        },
    },
};
