/* eslint-disable no-undef */
import { generateKeyVocabulary, generateStringVocabulary, findInVocabulary, findKeyInVocabulary } from '../src/vocabulary';

describe('generateKeyVocabulary', () => {
    it('should handle an empty array', () => {
        const obj: any[] = [];
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({});
    });

    it('should handle an empty object', () => {
        const obj = {};
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({});
    });

    it('should generate a vocabulary for the keys of an object', () => {
        const obj = { a: 1, b: 'hello', c: { d: 2, e: 'world' } };
        const flat_obj = { a: 1, b: 'hello', 'c.d': 2, 'c.e': 'world' };
        const vocabulary = generateKeyVocabulary(flat_obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, 'c.d': 2, 'c.e': 3 });
    });

    it('should generate a vocabulary for the keys of an array', () => {
        const obj = [{ a: 1, b: 'hello' }, { c: 2, d: 'world' }];
        const flat_obj = { '0.a': 1, '0.b': 'hello', '1.c': 2, '1.d': 'world' };
        const vocabulary = generateKeyVocabulary(flat_obj);
        expect(vocabulary).toEqual({ '0.a': 0, '0.b': 1, '1.c': 2, '1.d': 3 });
    })
});

describe('generateStringVocabulary', () => {
    it('should generate a vocabulary for the string values of an object', () => {
        const obj = { a: 1, b: 'hello', c: 2, d: 'world' };
        const vocabulary = generateStringVocabulary(obj);
        console.log(vocabulary);
        expect(vocabulary).toEqual({ 'hello': 0, 'world': 1 });
    });
});

describe('findKeyInVocabulary', () => {
    it('should find a string in a vocabulary and output its integer value', () => {
        const vocabulary = { 'hello': 0, 'world': 1, 'foo': 2, 'bar': 3 };
        expect(findKeyInVocabulary('hello', vocabulary)).toBe(0);
        expect(findKeyInVocabulary('world', vocabulary)).toBe(1);
        expect(findKeyInVocabulary('foo', vocabulary)).toBe(2);
        expect(findKeyInVocabulary('bar', vocabulary)).toBe(3);
        expect(findKeyInVocabulary('baz', vocabulary)).toBe(-1);
    });
});
