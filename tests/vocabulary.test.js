/* eslint-disable no-undef */
import { generateKeyVocabulary, generateStringVocabulary, findInVocabulary, findKeyInVocabulary } from '../env/vocabulary';

describe('generateKeyVocabulary', () => {
    it('should generate a vocabulary for the keys of an object', () => {
        const obj = { a: 1, b: 'hello', c: { d: 2, e: 'world' } };
        const vocabulary = generateKeyVocabulary(obj);
        expect(vocabulary).toEqual({ a: 0, b: 1, c: 2 });
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

describe('findInVocabulary', () => {
    it('should find a value in a vocabulary and output its string value', () => {
        const vocabulary = { 'hello': 0, 'world': 1, 'foo': 2, 'bar': 3, 0: 'zero!' };
        expect(findInVocabulary(0, vocabulary)).toBe('hello');
        expect(findInVocabulary(1, vocabulary)).toBe('world');
        expect(findInVocabulary(2, vocabulary)).toBe('foo');
        expect(findInVocabulary(3, vocabulary)).toBe('bar');
        expect(findInVocabulary(-1, vocabulary)).toBe(null);
    });
});