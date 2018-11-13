import c from './consts';

export default {
    [c.JAVASCRIPT]: {
        [c.FUNCTION]: /\n?\s*(function\s+\w+\s*\([^)]*\))/g,
    },
};