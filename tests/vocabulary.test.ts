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
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, c: 2, 'c.d': 3, 'c.e': 4 });
    });

    it('should handle an array of objects with the same keys', () => {
        const obj = [{ a: 1, b: 'hello' }, { a: 2, b: 'world' }];
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ '-1.a': 0, '-1.b': 1 });
    });

    it('should handle an array of objects with different keys', () => {
        const obj = [{ a: 1, b: 'hello' }, { c: 2, d: 'world' }];
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ '0.a': 0, '0.b': 1, '1.c': 2, '1.d': 3 });
    });

    it('should handle an object with nested arrays', () => {
        const obj = { a: 1, b: 'hello', c: [{ d: 2, e: 'world' }, { f: 3, g: 'foo' }] };
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, c: 2, 'c.0.d': 3, 'c.0.e': 4, 'c.1.f': 5, 'c.1.g': 6 });
    });

    it('should handle an object with nested arrays with the same keys', () => {
        const obj = { a: 1, b: 'hello', c: [{ d: 2, e: 'world' }, { d: 3, e: 'foo' }] };
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, c: 2, 'c.-1.d': 3, 'c.-1.e': 4});
    });

    it('should handle an object with nested objects', () => {
        const obj = { a: 1, b: 'hello', c: { d: 2, e: 'world', f: { g: 3, h: 'foo' } } };
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, c: 2, 'c.d': 3, 'c.e': 4, 'c.f': 5, 'c.f.g': 6, 'c.f.h': 7 });
    });
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