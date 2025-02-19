import { quantize, unquantize } from "../utils/quantize";
import { isTimestamp } from "../utils/util";
import { findInVocabulary, findKeyInVocabulary } from "./vocabulary";

export type Triple = [number, number, number];
/** [day, sinVal, cosVal] */
export type TimestampTriple = [number, number, number];
/**
 * Encodes numeric representations of data into triples.
 * @param key 
 * @param value 
 * @param precision used for quantization and typing, `0` means no quantization, `-1` means string, `-2` means timestamp
 * @returns [key, value, type] -> [number, number, number]
 */
export function encodeTriple(key: number, value: number | string, precision: number = 0): Triple {
    if (key === null || value === null || precision === null) return [-1, -1, -1];
    if (typeof value === 'string') value = Number(value)
    if (typeof key !== 'number' || isNaN(value) || typeof precision !== 'number') return [-1, -1, -1];
    let type: number = -1;
    if (typeof value === 'number' && precision === -2) type = -2;
    if (typeof value === 'number' && precision === -1) type = -1;
    if (typeof value === 'number' && precision === 0) type = 0;
    if (typeof value === 'number' && precision > 0) type = precision;
    // when dealing with quantization set the type to the precision so that it can be decoded later
    return [key, value, type];
}


/**
 * Encodes a timestamp into a triple containing:
 *   - day: The number of whole days since the epoch.
 *   - sin: The sine of the normalized time-of-day.
 *   - cos: The cosine of the normalized time-of-day.
 *
 * This function assumes that the timestamp is in milliseconds.
 *
 * @param timestamp The full timestamp in milliseconds.
 * @returns A triple: [day, sin(time), cos(time)].
 */
export function encodeTimestamp(timestamp: number): [number, number, number] {
    const msInDay = 24 * 60 * 60 * 1000;
    const day = Math.floor(timestamp / msInDay);
    const remainder = timestamp % msInDay;
    const normalizedTime = remainder / msInDay;
    return [
        day,
        Math.sin(normalizedTime * 2 * Math.PI),
        Math.cos(normalizedTime * 2 * Math.PI)
    ];
}

/**
 * Decodes a timestamp from its robust triple representation.
 *
 * @param encoded A triple [day, sinVal, cosVal] produced by encodeTimestamp.
 * @returns The reconstructed full timestamp in milliseconds.
 */
export function decodeTimestamp(encoded: [number, number, number]): number {
    const [day, sinVal, cosVal] = encoded;
    
    // Compute the angle in radians using atan2.
    let angle = Math.atan2(sinVal, cosVal);
    // Ensure the angle is in the range [0, 2π).
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    // Convert angle into a normalized time fraction.
    const normalizedTime = angle / (2 * Math.PI);
    
    const msInDay = 24 * 60 * 60 * 1000;
    // Reconstruct full timestamp: combine the day component and the time-of-day portion.
    const timestamp = day * msInDay + normalizedTime * msInDay;
    
    return timestamp;
}

/**
 * Generates an array of triples that can be used as inputs to a neural network.
 * @param obj best to use a flattened object otherwise nested objects will be ignored
 * @param keyVocabulary a mapping from keys to their numeric representations, will be mapped if not provided
 * @param stringVocabulary a mapping from string values to their numeric representations, will be mapped if not provided
 * @returns Array of [key, value, type] triples.
 */
export function encodeObject(
    obj: Record<string, any>,
    keyVocabulary: Record<string, number> = {},
    stringVocabulary: Record<string, number> = {}
): { triples: Triple[], keyVocabulary: Record<string, number>, stringVocabulary: Record<string, number> } {
    let triples: Triple[] = [];

    Object.entries(obj).forEach(([key, value]) => {
        if (isTimestamp(key, value)) {
            // Generate two values using unit circle encoding.
            const [day, sinVal, cosVal] = encodeTimestamp(value);
            // Use compound keys e.g., "timestamp.sin" and "timestamp.cos".
            if (findKeyInVocabulary(key + ".day", keyVocabulary) === -1) keyVocabulary[key + ".day"] = Object.keys(keyVocabulary).length;
            if (findKeyInVocabulary(key + ".sin", keyVocabulary) === -1) keyVocabulary[key + ".sin"] = Object.keys(keyVocabulary).length;
            if (findKeyInVocabulary(key + ".cos", keyVocabulary) === -1) keyVocabulary[key + ".cos"] = Object.keys(keyVocabulary).length;

            triples.push(encodeTriple(keyVocabulary[key + ".day"], day, -2));
            triples.push(encodeTriple(keyVocabulary[key + ".sin"], sinVal, -2));
            triples.push(encodeTriple(keyVocabulary[key + ".cos"], cosVal, -2));

            return; // Processed timestamp; continue to next property.
        }

        // Fallback to existing processing for other values.
        if (findKeyInVocabulary(key, keyVocabulary) === -1) {
            keyVocabulary[key] = Object.keys(keyVocabulary).length;
        }

        const numDecimals = (value.toString().split('.')[1] || []).length;
        const precision = numDecimals === 2 ? 2 : numDecimals > 2 ? 18 : numDecimals;

        if (typeof value === 'boolean') value = value.toString();
        if (typeof value === 'number' && numDecimals >= 2) {
            triples.push(encodeTriple(keyVocabulary[key], quantize(value, precision), precision));
        } else if (typeof value === 'string') {
            if (findKeyInVocabulary(value, stringVocabulary) === -1) stringVocabulary[value] = Object.keys(stringVocabulary).length;
            triples.push(encodeTriple(keyVocabulary[key], stringVocabulary[value], -1));
        } else if (typeof value === 'number' && numDecimals < 2) {
            triples.push(encodeTriple(keyVocabulary[key], value, 0));
        } else {
            console.log(`Invalid value ${value} for key ${key}`);
            triples.push([-1, -1, -1]);
        }
    });

    return { triples, keyVocabulary, stringVocabulary };
}

/**
 * Decodes an array of triples into a human readable object.
 * @param triples 
 * @param keyVocabulary requires a vocabulary to lookup the string representation of the encoded keys
 * @param stringVocabulary requires a vocabulary to lookup the string representation of the encoded string values.
 * @returns A human readable object.
 */
export function decodeObject(
    triples: Triple[],
    keyVocabulary: Record<string, number>,
    stringVocabulary: Record<string, number>
): Record<string, any> {
    const object: Record<string, any> = {};
    triples.forEach((triple, index) => {
        if (
            typeof triple[0] !== 'number' ||
            typeof triple[1] !== 'number' ||
            typeof triple[2] !== 'number'
        ) {
            object[index.toString()] = NaN;
        } else {
            const key = findInVocabulary(triple[0], keyVocabulary);
            const value = triple[1];
            const type = triple[2];
            if (key === null) {
                object[index.toString()] = undefined;
            } else if (type === -1) {
                object[key] = findInVocabulary(value, stringVocabulary); // string or null
            } else if (type === 0) {
                object[key] = value; // unquantized number
            } else if (type > 0) {
                object[key] = unquantize(value, type); // quantized number
            } else if (type === -2) {
                // Leave timestamp components in the object for now.
                // They will be combined below.
                object[key] = value;
            }
        }
    });

    // Combine timestamp components.
    // Look for keys ending in ".sin" and see if there's a matching ".cos"
    // Combine timestamp components.
    for (const compoundKey in object) {
        if (compoundKey.endsWith(".sin")) {
            const baseKey = compoundKey.slice(0, compoundKey.length - 4); // remove ".sin" suffix
            const cosKey = baseKey + ".cos";
            const dayKey = baseKey + ".day";
            if (object.hasOwnProperty(cosKey) && object.hasOwnProperty(dayKey)) {
                const sinVal = object[compoundKey];
                const cosVal = object[cosKey];
                const dayVal = object[dayKey];
                // Use decodeTimestamp to reconstruct the full timestamp.
                const timestamp = decodeTimestamp([dayVal, sinVal, cosVal]);
    
                // Add the reconstructed timestamp to the object under the baseKey.
                object[baseKey] = timestamp;
                // Remove the compound keys.
                delete object[compoundKey];
                delete object[cosKey];
                delete object[dayKey];
            }
        }
    }

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
    triples: Triple[],
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