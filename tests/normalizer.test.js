import { deNormalizeDataset, findMinMax, mergeObjects, mergeObjectsAndFindMinMax, mergeTripleArrays, mergeTripleArraysAndFindMinMax, normalizeDataset, normalizeValue, updateMinMaxIndex } from "../src/normalizer";

/* eslint-disable no-undef */
describe('mergeObjects', () => {
    it('should merge array of objects into a single object with array values', () => {
        const objects = [
            { key1: 'value1', key2: 'value2' },
            { key1: 'value3', key2: 'value4' },
            { key1: 'value5', key2: 'value6' }
        ];
        const result = mergeObjects(objects);
        expect(result).toEqual({
            key1: ['value1', 'value3', 'value5'],
            key2: ['value2', 'value4', 'value6']
        });
    });

    it('should handle empty array', () => {
        const objects = [];
        const result = mergeObjects(objects);
        expect(result).toEqual({});
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('mergeObjectsAndFindMinMax', () => {
    it('should merge array of objects and find min and max values', () => {
        const objects = [
            { key1: 1, key2: 2 },
            { key1: 3, key2: 4 },
            { key1: 5, key2: 6 }
        ];
        const result = mergeObjectsAndFindMinMax(objects);
        expect(result).toEqual({
            key1: { min: 1, max: 5 },
            key2: { min: 2, max: 6 }
        });
    });

    it('should handle empty array', () => {
        const objects = [];
        const result = mergeObjectsAndFindMinMax(objects);
        expect(result).toEqual({});
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('mergeTripleArrays', () => {
    it('should merge array of arrays with triples into a single object with array values', () => {
        const arrays = [
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ];
        const result = mergeTripleArrays(arrays);
        expect(result).toEqual({
            0: [1, 3],
            1: [2, 4]
        });
    });

    it('should handle empty array', () => {
        const arrays = [];
        const result = mergeTripleArrays(arrays);
        expect(result).toEqual({});
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('mergeTripleArraysAndFindMinMax', () => {
    it('should merge array of arrays with triples and find min and max values for each key', () => {
        const arrays = [
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ];
        const result = mergeTripleArraysAndFindMinMax(arrays);
        expect(result).toEqual({
            values: {
                0: { min: 1, max: 3 },
                1: { min: 2, max: 4 }
            },
            keys: { min: 0, max: 1 }
        });
    });

    it('should handle empty array', () => {
        const arrays = [];
        const result = mergeTripleArraysAndFindMinMax(arrays);
        expect(result).toEqual({ values: {}, keys: { min: Infinity, max: -Infinity } });
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('findMinMax', () => {
    it('should find min and max values for each key in the object', () => {
        const object = {
            0: [1, 2, 3],
            1: [2, 3, 4]
        };
        const result = findMinMax(object);
        expect(result).toEqual({
            0: { min: 1, max: 3 },
            1: { min: 2, max: 4 }
        });
    });

    it('should find min and max keys if keys_minmax is true', () => {
        const object = {
            0: [1, 2, 3],
            1: [2, 3, 4]
        };
        const result = findMinMax(object, true);
        expect(result).toEqual({
            values: {
                0: { min: 1, max: 3 },
                1: { min: 2, max: 4 }
            },
            keys: { min: 0, max: 1 }
        });
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('updateMinMaxIndex', () => {
    it('should update minMaxIndex for new key', () => {
        let minMaxIndex = { };
        minMaxIndex = updateMinMaxIndex(minMaxIndex, 1, 10);
        expect(minMaxIndex).toEqual({
            keys: { min: 1, max: 1},
            values: { 1: { min: 10, max: 10 } }
        });
    });

    it('should update minMaxIndex for existing key', () => {
        let minMaxIndex = {
            keys: { min: 1, max: 1 },
            values: { 1: { min: 10, max: 10 } }
        };
        minMaxIndex = updateMinMaxIndex(minMaxIndex, 1, 20);
        expect(minMaxIndex).toEqual({
            keys: { min: 1, max: 1 },
            values: { 1: { min: 10, max: 20 } }
        });
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('normalizeValue', () => {
    it('should normalize value within given range', () => {
        const result = normalizeValue(5, 0, 10);
        expect(result).toBe(0.5);
    });

    it('should handle value equal to min', () => {
        const result = normalizeValue(0, 0, 10);
        expect(result).toBe(0);
    });

    it('should handle value equal to max', () => {
        const result = normalizeValue(10, 0, 10);
        expect(result).toBe(1);
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('normalizeDataset', () => {
    it('should normalize dataset with default precision', () => {
        const dataset = [
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ];
        const result = normalizeDataset(dataset);
        expect(result).toEqual([
            [[0, 0, 0.157895], [1, 0, 0.210526]],
            [[0, 1, 0.263158], [1, 1, 0.315789]]
        ]);
    });

    it('should normalize dataset with specified precision', () => {
        const dataset = [
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ];
        const result = normalizeDataset(dataset, null, 2);
        expect(result).toEqual([
            [[0, 0, 0.16], [1, 0, 0.21]],
            [[0, 1, 0.26], [1, 1, 0.32]]
        ]);
    });

    it('should normalize dataset with provided minMaxIndex', () => {
        const dataset = [
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ];
        const minMaxIndex = {
            keys: { min: 0, max: 1 },
            values: { 
                0: { min: 1, max: 3 },
                1: { min: 2, max: 4 }
            }
        };
        const result = normalizeDataset(dataset, minMaxIndex);
        expect(result).toEqual([
            [[0, 0, 0.157895], [1, 0, 0.210526]],
            [[0, 1, 0.263158], [1, 1, 0.315789]]
        ]);
    });

    it('should handle empty dataset', () => {
        const dataset = [];
        const result = normalizeDataset(dataset);
        expect(result).toEqual([]);
    });

    // Add more tests as needed for different inputs and edge cases
});

describe('deNormalizeDataset', () => {
    it('should denormalize dataset with provided minMaxIndex', () => {
        const dataset = [
            [[0, 0, 0.157895], [1, 0, 0.210526]],
            [[0, 1, 0.263158], [1, 1, 0.315789]]
        ]
        const minMaxIndex = {
            keys: { min: 0, max: 1 },
            values: { 
                0: { min: 1, max: 3 },
                1: { min: 2, max: 4 }
            }
        };
        const result = deNormalizeDataset(dataset, minMaxIndex);
        expect(result).toEqual([
            [[0, 1, 2], [1, 2, 3]],
            [[0, 3, 4], [1, 4, 5]]
        ]);
    });

    // Add more tests as needed for different inputs and edge cases
});