import c from './consts';

export default {
    [c.JAVASCRIPT]: {
        [c.FUNCTION]: {
            'reg': /(\n|^)\s*(export\s+)?\s*(((const|var|let)\s+\w+\s*=\s*\([^)]*\)\s*=>)|(function\s+\w+\s*\([^)]*\)))/g,
            'index': 3,
        },
    },
};