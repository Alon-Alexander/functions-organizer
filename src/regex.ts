import c from './consts';

export default {
    [c.JAVASCRIPT]: {
        [c.FUNCTION]: /\n?\s*(((const|var|let)\s+\w+\s*=\s*\([^)]*\)\s*=>)|(function\s+\w+\s*\([^)]*\)))/g,
    },
};