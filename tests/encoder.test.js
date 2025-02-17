/* eslint-disable no-undef */
import { encodeTriple, encodeObject, decodeObjectMap, decodeObject } from "../src/encoder";

describe('encodeTriple', () => {
    it('should return [-1, -1, -1] when any of the parameters is null', () => {
        expect(encodeTriple(null, 1, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, null, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 1, null)).toEqual([-1, -1, -1]);
    });

    it('should return [-1, -1, -1] when any of the parameters is not a number', () => {
        expect(encodeTriple('a', 1, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 'a', 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 1, 'a')).toEqual([-1, -1, -1]);
    });

    it('should return [key, value, 1] when value is a number and precision is 0', () => {
        expect(encodeTriple(1, 2, 0)).toEqual([1, 2, 1]);
    });

    it('should return [key, value, precision] when value is a number and precision is greater than 0', () => {
        expect(encodeTriple(1, 2, 2)).toEqual([1, 2, 2]);
    });
    it('should return [key, value, 0] when value is a string', () => {
        expect(encodeTriple(1, '2', 0)).toEqual([1, '2', 0]);
    });
})

describe('encodeObject', () => {
    it('should return the correct encoding for given inputs', () => {
        const obj = {
            key1: 1.23,
            key2: 'value2'
        };
        const keyVocabulary = {
            key1: 1,
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const result = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            [1, 123, 2],
            [2, 1, -1]
        ]);
    });

    it('should return correct encoding for a string with more than 2 decimals', () => {
        const obj = {
            key1: 1.2345,
        };
        const keyVocabulary = {
            key1: 1
        };
        const stringVocabulary = {};
        const result = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            [1, 1234500000000000000, 18]
        ]);
    })

    it('should return [-1, -1, -1] when the key is not in the keyVocabulary', () => {
        const obj = {
            key1: 1.23,
            key2: 'value2'
        };
        const keyVocabulary = {
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const result = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            [-1, -1, -1],
            [2, 1, -1]
        ]);
    })

    it('should return null encoding for a nested object', () => {
        const obj = {
            key1: {
                key2: 1.23
            }
        };
        const keyVocabulary = {
            key1: 1,
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const result = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            [-1, -1, -1]
        ]);
    });
});

describe('decodeObject', () => {
    it('should decode object with null values', () => {
        const triples = [[-1, -1, -1]];
        const keyVocabulary = [];
        const stringVocabulary = [];
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({0: undefined});
    });

    it('should decode object with NaN values', () => {
        const triples = [['a', 'b', 'c']];
        const keyVocabulary = [];
        const stringVocabulary = [];
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({0: NaN});
    });

    it('should return NaN for any triple containing null', () => {
        const triples = [[null, 1, 1], [1, null, 1], [1, 1, null]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({0: NaN, 1: NaN, 2: NaN});
    });

    it('should return undefined for any triple containing [-1,-1,-1]', () => {
        const triples = [[-1, -1, -1]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({0: undefined});
    })

    it('should return NaN for any triple containing non-number', () => {
        const triples = [['a', 1, 1], [1, 'a', 1], [1, 1, 'a']];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({0: NaN, 1: NaN, 2: NaN});
    });

    it('should return the correct decoding for given inputs', () => {
        const triples = [[1, 2, -1], [2, 3, 0], [3, 4, 2]];
        const keyVocabulary = { key1: 1, key2: 2, key3: 3 };
        const stringVocabulary = { value2: 2 };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({
            key1: 'value2',
            key2: 3,
            key3: 0.04
        
        });
    });
    // Add more tests as needed for different inputs and edge cases
});

describe('decodeObjectMap', () => {
    it('should return null for any triple containing null', () => {
        const triples = [[null, 1, 1], [1, null, 1], [1, 1, null]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[NaN, NaN], [NaN, NaN], [NaN, NaN]]);
    });

    it('should return null for any triple containing [-1,-1,-1]', () => {
        const triples = [[-1, -1, -1]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[undefined, -1]]);
    })

    it('should return null for any triple containing non-number', () => {
        const triples = [['a', 1, 1], [1, 'a', 1], [1, 1, 'a']];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 'value1' };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[NaN, NaN], [NaN, NaN], [NaN, NaN]]);
    });

    it('should return the correct decoding for given inputs', () => {
        const triples = [[1, 2, -1], [2, 3, 0], [3, 4, 2]];
        const keyVocabulary = { key1: 1, key2: 2, key3: 3 };
        const stringVocabulary = { value2: 2 };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            ['key1', 'value2'],
            ['key2', 3],
            ['key3', 0.04]
        ]);
    });

    // Add more tests as needed for different inputs and edge cases
});