/* eslint-disable no-undef */
import { flattenObject, round, unFlattenObject } from "../env/util";

describe('round', () => {
    it('should round number to specified decimal places', () => {
        expect(round(1.23456, 2)).toBe(1.23);
        expect(round(1.23456, 3)).toBe(1.235);
        expect(round(1.23456, 0)).toBe(1);
    });

    it('should handle negative numbers', () => {
        expect(round(-1.23456, 2)).toBe(-1.23);
    });

    it('should handle rounding half to even', () => {
        expect(round(1.5, 0)).toBe(2);
        expect(round(2.5, 0)).toBe(3);
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('flattenObject', () => {
    it('should flatten object with nested keys', () => {
        const nestedObject = {
            a: { b: { c: 1, d: 2 } },
            e: 3,
            f: { g: 4 }
        };
        const result = flattenObject(nestedObject);
        expect(result).toEqual({
            'a.b.c': 1,
            'a.b.d': 2,
            'e': 3,
            'f.g': 4
        });
    });

    it('should handle object with no nested keys', () => {
        const flatObject = {
            a: 1,
            b: 2,
            c: 3
        };
        const result = flattenObject(flatObject);
        expect(result).toEqual({
            a: 1,
            b: 2,
            c: 3
        });
    });

    it('should handle object with arrays', () => {
        const objectWithArray = {
            a: [1, 2, 3],
            b: 4
        };
        const result = flattenObject(objectWithArray);
        expect(result).toEqual({
            'a.0': 1,
            'a.1': 2,
            'a.2': 3,
            'b': 4
        });
    })

    it('should handle empty object', () => {
        const result = flattenObject({});
        expect(result).toEqual({});
    });
    // Add more tests as needed for different inputs and edge cases
});

describe('unFlattenObject', () => {
    it('should unflatten object with nested keys', () => {
        const flatObject = {
            'a.b.c': 1,
            'a.b.d': 2,
            'e': 3,
            'f.g': 4
        };
        const result = unFlattenObject(flatObject);
        expect(result).toEqual({
            a: { b: { c: 1, d: 2 } },
            e: 3,
            f: { g: 4 }
        });
    });

    it('should handle object with no nested keys', () => {
        const flatObject = {
            'a': 1,
            'b': 2,
            'c': 3
        };
        const result = unFlattenObject(flatObject);
        expect(result).toEqual({
            a: 1,
            b: 2,
            c: 3
        });
    });

    it('should handle object with arrays', () => {
        const flatObject = {
            'a.0': 1,
            'a.1': 2,
            'a.2': 3,
            'b': 4
        };
        const result = unFlattenObject(flatObject);
        expect(result).toEqual({
            a: [1, 2, 3],
            b: 4
        });
    });

    it('should handle object with mixed nested keys and arrays', () => {
        const flatObject = {
            'a.0.b': 1,
            'a.1.c': 2,
            'a.2.d': 3,
            'e': 4
        };
        const result = unFlattenObject(flatObject);
        expect(result).toEqual({
            a: [{ b: 1 }, { c: 2 }, { d: 3 }],
            e: 4
        });
    });


    it('should handle empty object', () => {
        const result = unFlattenObject({});
        expect(result).toEqual({});
    });

    // Add more tests as needed for different inputs and edge cases
});