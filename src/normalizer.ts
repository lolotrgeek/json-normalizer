import { round } from "../utils/util";
import { Triple } from "./encoder";

export interface MinMax {
    min: number;
    max: number;
}

export interface KeysMinMax {
    values: Record<string, MinMax>;
    keys: MinMax;
}

export interface MinMaxIndex {
    keys?: MinMax;
    values?: Record<number, MinMax>;
}

/**
 * Merges an array of objects by combining the values for matching keys.
 * @param objects An array of objects with numeric values.
 * @returns An object with keys mapped to an array of values.
 */
export function mergeObjects(objects: Record<string, number>[]): Record<string, number[]> {
    const result: Record<string, number[]> = {};

    objects.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(obj[key]);
        });
    });

    return result;
}

/**
 * Finds the minimum and maximum for each key.
 * @param object An object whose values are arrays of numbers.
 * @param keys_minmax If true, also returns the min and max keys.
 * @returns Either an object mapping keys to {min, max} or an object containing both values and keys min/max.
 */
export function findMinMax(
    object: Record<string, number[]>,
    keys_minmax: boolean = false
): Record<string, MinMax> | KeysMinMax {
    const result: Record<string, MinMax> = {};
    const keys = Object.keys(object).map(Number);
    const keysMinMax = keys_minmax ? { min: Math.min(...keys), max: Math.max(...keys) } : null;

    keys.forEach(key => {
        result[key] = {
            min: Math.min(...object[key.toString()]),
            max: Math.max(...object[key.toString()])
        };
    });

    return keys_minmax ? { values: result, keys: keysMinMax! } : result;
}

/**
 * Merges an array of objects and finds the min and max for each key.
 * 
 * `NOTE` in this implementation the object keys must be numbers or can be converted to numbers.
 * 
 * @param objects An array of objects with number values.
 * @returns Either an object mapping keys to {min, max} or an object containing both values and keys min/max.
 */
export function mergeObjectsAndFindMinMax(objects: Record<string | number, number>[]): Record<string, MinMax> | KeysMinMax {
    const merged = mergeObjects(objects);
    return findMinMax(merged);
}

/**
 * Combines arrays of triples into a single object that holds each key and its values across all triples.
 * @param triples An array of triples [key, value, type].
 * @returns An object mapping key to an array of values.
 */
export function mergeTriples(triples: Triple[]): Record<number, number[]> {
    const result: Record<number, number[]> = {};
    triples.forEach(triple => {
        const key = triple[0];
        const value = triple[1];

        if (!result[key]) {
            result[key] = [];
        }

        result[key].push(value);
    });

    return result;
}

export function mergeDataset(dataset: Triple[][]): Record<number, number[]> {
    const result: Record<number, number[]> = {};
    dataset.map(triples => {
        triples.forEach(triple => {
            const key = triple[0];
            const value = triple[1];
    
            if (!result[key]) {
                result[key] = [];
            }
    
            result[key].push(value);
        });
    });
    return result;
}

/**
 * Combines triple arrays and finds the min and max of the merged values along with key boundaries.
 * @param triples An array of triples [key, value, type].
 * @returns An object with min/max for values and keys.
 */
export function mergeTripleArraysAndFindMinMax(triples: Triple[]): KeysMinMax {
    const merged = mergeTriples(triples);
    return findMinMax(
        // Since mergeTripleArrays returns keys as numbers, we need to convert keys to string for findMinMax.
        Object.keys(merged).reduce((acc, key) => {
            acc[key] = merged[Number(key)];
            return acc;
        }, {} as Record<string, number[]>),
        true
    ) as KeysMinMax;
}

export function mergeDatasetAndFindMinMax(dataset: Triple[][]): KeysMinMax {
    const merged = mergeDataset(dataset);
    return findMinMax(
        // Since mergeTripleArrays returns keys as numbers, we need to convert keys to string for findMinMax.
        Object.keys(merged).reduce((acc, key) => {
            acc[key] = merged[Number(key)];
            return acc;
        }
        , {} as Record<string, number[]>),
        true
    ) as KeysMinMax;
}


/**
 * Generates or updates a minMaxIndex based on the key and value of a triple.
 * @param minMaxIndex The current minMaxIndex object.
 * @param key The key from the triple.
 * @param value The value from the triple.
 * @returns The updated minMaxIndex.
 */
export function updateMinMaxIndex(minMaxIndex: MinMaxIndex, key: number, value: number): MinMaxIndex {
    if (!minMaxIndex.keys) {
        minMaxIndex.keys = { min: key, max: key };
    } else {
        minMaxIndex.keys.min = Math.min(minMaxIndex.keys.min, key);
        minMaxIndex.keys.max = Math.max(minMaxIndex.keys.max, key);
    }
    if (!minMaxIndex.values) {
        minMaxIndex.values = {};
    }
    if (!minMaxIndex.values[key]) {
        minMaxIndex.values[key] = { min: value, max: value };
    } else {
        minMaxIndex.values[key] = {
            min: Math.min(minMaxIndex.values[key].min, value),
            max: Math.max(minMaxIndex.values[key].max, value)
        };
    }
    return minMaxIndex;
}

/**
 * Normalizes a value to be between 0 and 1 based on the provided min and max.
 * @param value The value to normalize.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The normalized value.
 */
export function normalizeValue(value: number, min: number, max: number): number {
    // Check if value, min, or max is not a number or is Infinity/-Infinity
    if (
        typeof value !== 'number' ||
        typeof min !== 'number' ||
        typeof max !== 'number' ||
        !isFinite(value) ||
        !isFinite(min) ||
        !isFinite(max)
    ) {
        return 0;
    }

    // Check if min and max are the same
    if (min === max) return 0;

    // Normalize the value
    return (value - min) / (max - min);
}

/**
 * Denormalizes a value from the normalized [0,1] range back to its original scale.
 * @param value The normalized value.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The denormalized value.
 */
export function denormalizeValue(value: number, min: number, max: number): number {
    return value * (max - min) + min;
}

/**
 * 
 * @param triples 
 * @param minMaxIndex An existing minMaxIndex;
 * @param precision The number of decimal places for rounding (default 6).
 * @param maxTypePrecision The maximum type precision (default 18).
 * @returns A normalized dataset with the same structure as the input.
 */
export function normalize(triples: Triple[], minMaxIndex: KeysMinMax, precision: number = 6, maxTypePrecision: number = 18): Triple[] {
    return triples.map(triple => {
        const key = triple[0];
        const value = triple[1];
        const type = triple[2];
        const minMax = minMaxIndex.values![key];
        const normalizedValue = round(normalizeValue(value, minMax.min, minMax.max), precision);
        const normalizedKey = round(normalizeValue(key, minMaxIndex.keys.min, minMaxIndex.keys.max), precision);
        const normalizedType = round(normalizeValue(type, -1, maxTypePrecision), precision);
        return [normalizedKey, normalizedValue, normalizedType];
    })
}

/**
 * 
 * @param triples 
 * @param minMaxIndex The minMaxIndex that was used for normalization.
 * @param precision The number of decimal places for rounding (default 6).
 * @param maxTypePrecision The maximum type precision (default 18).
 * @returns A denormalized dataset with the same structure as the input.
 */
export function denormalize(triples: Triple[], minMaxIndex: KeysMinMax, precision: number = 6, maxTypePrecision: number = 18): Triple[] {
    return triples.map(triple => {
        const key = triple[0];
        const value = triple[1];
        const type = triple[2];
        const denormalizedKey = round(denormalizeValue(key, minMaxIndex.keys.min, minMaxIndex.keys.max), 0);
        // Check if denormalizedKey is a key in minMaxIndex
        if (!Object.prototype.hasOwnProperty.call(minMaxIndex.values, denormalizedKey)) {
            throw new Error(`Key ${denormalizedKey} not found in minMaxIndex`);
        }
        const minMax = minMaxIndex.values[denormalizedKey];
        const denormalizedValue = round(denormalizeValue(value, minMax.min, minMax.max), precision);
        const denormalizedType = round(denormalizeValue(type, -1, maxTypePrecision), precision);
        return [denormalizedKey, denormalizedValue, denormalizedType];
    })
}

/**
 * Normalizes a dataset of triple arrays.
 * @param dataset An array of arrays of triples [key, value, type].
 * @param minMaxIndex An existing minMaxIndex; if null, it will be generated.
 * @param precision The number of decimal places for rounding (default 6).
 * @param maxTypePrecision The maximum type precision (default 18).
 * @returns A normalized dataset with the same structure as the input.
 */
export function normalizeDataset(
    dataset: Triple[][],
    minMaxIndex: KeysMinMax | null = null,
    precision: number = 6,
    maxTypePrecision: number = 18
): Triple[][] {
    // Generate minMaxIndex if not provided
    if (!minMaxIndex) {
        minMaxIndex = mergeDatasetAndFindMinMax(dataset);
    }
    // Normalize each value in the dataset
    return dataset.map(triples => {
        return normalize(triples, minMaxIndex, precision, maxTypePrecision);
    });
}

/**
 * Denormalizes a dataset of triple arrays.
 * @param dataset An array of arrays of normalized triples [key, value, type].
 * @param minMaxIndex The minMaxIndex that was used for normalization.
 * @param precision The number of decimal places for rounding (default 6).
 * @param maxTypePrecision The maximum type precision (default 18).
 * @returns A denormalized dataset with the same structure as the input.
 */
export function deNormalizeDataset(
    dataset: Triple[][],
    minMaxIndex: KeysMinMax,
    precision: number = 6,
    maxTypePrecision: number = 18
): Triple[][] {
    return dataset.map(triples => {
        return denormalize(triples, minMaxIndex, precision, maxTypePrecision);
    });
}