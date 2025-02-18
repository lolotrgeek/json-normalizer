import { quantize, unquantize } from "../utils/quantize";
import { findInVocabulary, findKeyInVocabulary } from "./vocabulary";

export type Quadruple = [number, number, number, number];

/**
 * Encodes numeric representations of data into quads.
 * @param key 
 * @param value 
 * @param precision used for quantization and typing, `0` means no quantization, `-1` means string
 * @returns `[key, value, type, index]` -> [number, number, number, number] note for numbers the type is the precision
 */
export function encodeQuadruple(key: number, value: number | string, precision: number = 0,  index: number = -1,): Quadruple {
    if (key === null || value === null || precision === null) return [-1, -1, -1, -1];
    if (typeof value === 'string') value = Number(value)
    if (typeof key !== 'number' || isNaN(value) || typeof precision !== 'number') {
        console.log(`Invalid quad: ${key}, ${value}, ${precision}, ${index}`);
        return [-1, -1, -1, -1]
    };
    let type: number = -1;
    if (typeof value === 'number' && precision === -1) type = -1;
    if (typeof value === 'number' && precision === 0) type = 0;
    if (typeof value === 'number' && precision > 0) type = precision;
    // when dealing with quantization set the type to the precision so that it can be decoded later
    return [key, value, type, index];
}

/**
 * Generates an array of quads that can be used as inputs to a neural network.
 * @param obj best to use a flattened object otherwise nested objects will be ignored
 * @param keyVocabulary a mapping from keys to their numeric representations
 * @param stringVocabulary a mapping from string values to their numeric representations
 * @returns Array of [key, value, type] quads.
 */
export function encodeObject(
    obj: Record<string, any>,
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): [number, number, number, number][] {
    return Object.entries(obj).map(([key, value]) => {
        const vocab = findKeyInVocabulary(key, keyVocabulary);
        if (vocab.key === -1) {
            console.log(`Key ${key} not found in keyVocabulary`);
            return [-1, -1, -1, -1];
        }
        let encodedKey = vocab.key;
        // For a uniform key, we want to pass along its original index.
        // Let's assume that if vocab.index !== -1 then it holds the original index.
        const originalIndex = vocab.index; // -1 if not applicable

        const numDecimals = (value.toString().split('.')[1] || []).length;
        const precision = numDecimals === 2 ? 2 : numDecimals > 2 ? 18 : numDecimals;

        if (typeof value === 'boolean') value = value.toString();

        if (typeof value === 'number' && numDecimals >= 2) {
            return encodeQuadruple(encodedKey, quantize(value, precision), precision, originalIndex);
        }
        if (typeof value === 'string') {
            return encodeQuadruple(encodedKey, findKeyInVocabulary(value, stringVocabulary).key, -1, originalIndex);
        }
        if (typeof value === 'number' && numDecimals < 2) {
            return encodeQuadruple(encodedKey, value, 0, originalIndex);
        }
        console.log(`Invalid value ${value} for key ${key}`);
        return [-1, -1, -1, -1];
    });
}

/**
 * Decodes an array of quads into a human readable object.
 * @param quads 
 * @param keyVocabulary requires a vocabulary to lookup the string representation of the encoded keys
 * @param stringVocabulary requires a vocabulary to lookup the string representation of the encoded string values.
 * @returns A human readable object.
 */
export function decodeObject(
    quadruples: Quadruple[],
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): Record<string, any> {
    const object: Record<string, any> = {};
    quadruples.map((quad, index) => {
        if (typeof quad[0] !== 'number' || typeof quad[1] !== 'number' || typeof quad[2] !== 'number') {
            object[index.toString()] = NaN;
        } else {
            let key = findInVocabulary(quad[0], keyVocabulary);
            const value = quad[1];
            const type = quad[2];
            const obj_index = quad[3];
            if (key === null) { object[index.toString()] = undefined; return }
            if(obj_index !== -1) key = `${key}.${obj_index}`;
            if (type === -1) object[key] = findInVocabulary(value, stringVocabulary); // string or null
            if (type === 0) object[key] = value; // unquantized number
            if (type > 0) object[key] = unquantize(value, type); // quantized number
        }
    });
    return object;
}

/**
 * Decodes an array of quads into a mapped human readable object.
 * @param quads 
 * @param keyVocabulary 
 * @param stringVocabulary 
 * @returns An array of key-value pairs.
 */
export function decodeObjectMap(
    quads: Quadruple[],
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): Array<[string | null | undefined, any]> {
    return quads.map((quad) => {
        // Compare arrays by stringifying
        if (JSON.stringify(quad) === JSON.stringify([-1, -1, -1])) return [null, null];
        if (typeof quad[0] !== 'number' || typeof quad[1] !== 'number' || typeof quad[2] !== 'number') return [undefined, NaN];
        const key = findInVocabulary(quad[0], keyVocabulary);
        const value = quad[1];
        const type = quad[2];
        if (key === null) return [undefined, value];
        if (type === -1) return [key, findInVocabulary(value, stringVocabulary)]; // string or null
        if (type === 0) return [key, value]; // unquantized number
        if (type > 0) return [key, unquantize(value, type)]; // quantized number
        return [undefined, value];
    });
}