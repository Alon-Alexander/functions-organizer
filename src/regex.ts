import c from './consts';

export default {
    [c.JAVASCRIPT]: {
        [c.FUNCTION]: {
            'reg': /(\n|^)\s*((export\s+)?\s*(((const|var|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>)|(function\s+(\w+)\s*\([^)]*\))))/g,
            'allIndex': 2,
            'nameIndices': [9, 7],
        },
    },
};