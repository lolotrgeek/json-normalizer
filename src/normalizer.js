// take flattened data, get the min and max for each key

import { round } from "./util.js";

export function mergeObjects(objects) {
    const result = {};

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

export function findMinMax(object, keys_minmax = false) {
    const result = {};
    let keys = Object.keys(object).map(Number);
    let keysMinMax = keys_minmax ? { min: Math.min(...keys), max: Math.max(...keys) } : null;

    keys.forEach(key => {
        result[key] = {
            min: Math.min(...object[key]),
            max: Math.max(...object[key])
        };
    });

    return keys_minmax ? { values: result, keys: keysMinMax } : result;
}

export function mergeObjectsAndFindMinMax(objects) {
    const merged = mergeObjects(objects);
    return findMinMax(merged);
}

/**
 * Combine arrays of array of triples into a single object that holds each key and its values across all triples from the arrays.
 * @param {array} arrays 
 * @returns {object} `{ key: [value, value, ...]}`
 */
export function mergeTripleArrays(arrays) {
    const result = {};
    arrays.forEach(array => {
        array.forEach(triple => {
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

export function mergeTripleArraysAndFindMinMax(arrays) {
    const merged = mergeTripleArrays(arrays);
    return findMinMax(merged, true);
}

/**
 * Generates or updates a minMaxIndex based on the key and value of a triple.
 * @param {object} minMaxIndex 
 * @param {number} key 
 * @param {number} value 
 * @returns 
 */
export function updateMinMaxIndex(minMaxIndex, key, value) {
    if (!minMaxIndex.keys) minMaxIndex.keys = { min: key, max: key }
    else {
        minMaxIndex.keys.min = Math.min(minMaxIndex.keys.min, key)
        minMaxIndex.keys.max = Math.max(minMaxIndex.keys.max, key)
    }
    if (!minMaxIndex.values) minMaxIndex.values = {}
    if (!minMaxIndex.values[key]) minMaxIndex.values[key] = { min: value, max: value }
    else {
        minMaxIndex.values[key] = {
            min: Math.min(minMaxIndex.values[key].min, value),
            max: Math.max(minMaxIndex.values[key].max, value)
        };
    }
    return minMaxIndex;
}

export function normalizeValue(value, min, max) {
    // Check if value, min, or max is not a number or is Infinity/-Infinity
    if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number' ||
        !isFinite(value) || !isFinite(min) || !isFinite(max)) {
        return 0;
    }

    // Check if min and max are the same
    if (min === max) return 0;

    // Normalize the value
    return (value - min) / (max - min);
}

export function denormalizeValue(value, min, max) {
    return value * (max - min) + min;
}

/**
 * 
 * @param {array} dataset array of arrays of `triples`
 * @param {*} precision 
 * @param {*} maxTypePrecision 
 * @returns 
 */
export function normalizeDataset(dataset, minMaxIndex, precision = 6, maxTypePrecision = 18) {
    // Generate minMaxIndex
    if (!minMaxIndex) minMaxIndex = mergeTripleArraysAndFindMinMax(dataset);
    // Normalize each value in the dataset
    return dataset.map(array => {
        return array.map(triple => {
            const key = triple[0];
            const value = triple[1];
            const type = triple[2];
            const minMax = minMaxIndex.values[key];
            const normalizedValue = round(normalizeValue(value, minMax.min, minMax.max), precision)
            const normalizedKey = round(normalizeValue(key, minMaxIndex.keys.min, minMaxIndex.keys.max), precision)
            const normalizedType = round(normalizeValue(type, -1, maxTypePrecision), precision) // TODO: parameterize this
            return [normalizedKey, normalizedValue, normalizedType]
        });
    });
}

export function deNormalizeDataset(dataset, minMaxIndex, precision = 6, maxTypePrecision = 18) {
    return dataset.map(array => {
        return array.map(triple => {
            const key = triple[0];
            const value = triple[1];
            const type = triple[2];
            const denormalizedKey = round(denormalizeValue(key, minMaxIndex.keys.min, minMaxIndex.keys.max), 0)
            // Check if denormalizedKey is a key in minMaxIndex
            if (!Object.prototype.hasOwnProperty.call(minMaxIndex.values, denormalizedKey)) {
                throw new Error(`Key ${denormalizedKey} not found in minMaxIndex`);
            }
            const minMax = minMaxIndex.values[denormalizedKey];
            const denormalizedValue = round(denormalizeValue(value, minMax.min, minMax.max), precision)
            const denormalizedType = round(denormalizeValue(type, -1, maxTypePrecision), precision) // TODO: parameterize this
            return [denormalizedKey, denormalizedValue, denormalizedType]
        });
    });
}