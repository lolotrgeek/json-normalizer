import { quantize, unquantize } from "../utils/quantize";
import { findInVocabulary, findKeyInVocabulary } from "./vocabulary";

/**
 * Encodes numeric representations of data into triples.
 * @param key 
 * @param value 
 * @param precision used for quantization and typing, `0` means no quantization, `-1` means string
 * @returns [key, value, type] -> [number, number, number]
 */
export function encodeTriple(key: number, value: number | string, precision: number = 0): [number, number, number] {
    if (key === null || value === null || precision === null) return [-1, -1, -1];
    if(typeof value === 'string') value = Number(value)
    if (typeof key !== 'number' || isNaN(value) || typeof precision !== 'number') return [-1, -1, -1];
    let type: number = -1;
    if (typeof value === 'number' && precision === -1) type = -1;
    if (typeof value === 'number' && precision === 0) type = 0;
    if (typeof value === 'number' && precision > 0) type = precision;
    // when dealing with quantization set the type to the precision so that it can be decoded later
    return [key, value, type];
}

/**
 * Generates an array of triples that can be used as inputs to a neural network.
 * @param obj best to use a flattened object otherwise nested objects will be ignored
 * @param keyVocabulary a mapping from keys to their numeric representations
 * @param stringVocabulary a mapping from string values to their numeric representations
 * @returns Array of [key, value, type] triples.
 */
export function encodeObject(
    obj: Record<string, any>,
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): [number, number, number][] {
    return Object.entries(obj).map(([key, value]) => {
        if (findKeyInVocabulary(key, keyVocabulary) === -1) {
            console.log(`Key ${key} not found in keyVocabulary`);
            return [-1, -1, -1];
        }

        const numDecimals = (value.toString().split('.')[1] || []).length;
        // if the number of decimals is 2 quantize to 2, if it's more than 2 quantize to 18, otherwise don't quantize
        const precision = numDecimals === 2 ? 2 : numDecimals > 2 ? 18 : numDecimals;

        if (typeof value === 'boolean') value = value.toString();

        if (typeof value === 'number' && numDecimals >= 2) {
            return encodeTriple(keyVocabulary[key], quantize(value, precision), precision);
        }
        if (typeof value === 'string') {
            return encodeTriple(keyVocabulary[key], findKeyInVocabulary(value, stringVocabulary), -1);
        }
        if (typeof value === 'number' && numDecimals < 2) {
            return encodeTriple(keyVocabulary[key], value, 0);
        }
        console.log(`Invalid value ${value} for key ${key}`);
        return [-1, -1, -1];
    });
}

/**
 * Decodes an array of triples into a human readable object.
 * @param triples 
 * @param keyVocabulary requires a vocabulary to lookup the string representation of the encoded keys
 * @param stringVocabulary requires a vocabulary to lookup the string representation of the encoded string values.
 * @returns A human readable object.
 */
export function decodeObject(
    triples: [number, number, number][],
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): Record<string, any> {
    const object: Record<string, any> = {};
    triples.map((triple, index) => {
        if (typeof triple[0] !== 'number' || typeof triple[1] !== 'number' || typeof triple[2] !== 'number') {
            object[index.toString()] = NaN;
        } else {
            const key = findInVocabulary(triple[0], keyVocabulary);
            const value = triple[1];
            const type = triple[2];
            if (key === null) object[index.toString()] = undefined;
            else if (type === -1) object[key] = findInVocabulary(value, stringVocabulary); // string or null
            else if (type === 0) object[key] = value; // unquantized number
            else if (type > 0) object[key] = unquantize(value, type); // quantized number
        }
    });
    return object;
}

/**
 * Decodes an array of triples into a mapped human readable object.
 * @param triples 
 * @param keyVocabulary 
 * @param stringVocabulary 
 * @returns An array of key-value pairs.
 */
export function decodeObjectMap(
    triples: [number, number, number][],
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): Array<[string | null | undefined, any]> {
    return triples.map((triple) => {
        // Compare arrays by stringifying
        if (JSON.stringify(triple) === JSON.stringify([-1, -1, -1])) return [null, null];
        if (typeof triple[0] !== 'number' || typeof triple[1] !== 'number' || typeof triple[2] !== 'number') return [undefined, NaN];
        const key = findInVocabulary(triple[0], keyVocabulary);
        const value = triple[1];
        const type = triple[2];
        if (key === null) return [undefined, value];
        if (type === -1) return [key, findInVocabulary(value, stringVocabulary)]; // string or null
        if (type === 0) return [key, value]; // unquantized number
        if (type > 0) return [key, unquantize(value, type)]; // quantized number
        return [undefined, value];
    });
}