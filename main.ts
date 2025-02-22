import { encodeObject, decodeObject, Triple, encodeTimestamp, decodeTimestamp } from "./src/encoder";
import { MinMaxIndex, updateMinMaxIndex } from "./src/normalizer";
import { findInVocabulary, findKeyInVocabulary, Vocabulary } from "./src/vocabulary";
import { quantize, unquantize } from "./utils/quantize";
import { flattenObject, isTimestamp, parseDate } from "./utils/util";
export { decodeObject, encodeObject, Triple } from "./src/encoder";
export { deNormalizeDataset, normalizeDataset, normalize, denormalize } from "./src/normalizer";
export { generateVocabulary, Vocabulary } from "./src/vocabulary";
export { flattenObject } from "./utils/util";

/**
 *
 * @param json 
 * @param keyVocab needed to encode keys from json, will be generated if not provided
 * @param stringVocab needed to encode string values from json, will be generated if not provided
 * @returns 
 */
export function encode(json: string): { triples: Triple[], keyVocabulary: Vocabulary, stringVocabulary: Vocabulary } {
    try {
        const parsed = JSON.parse(json);
        const flattened = flattenObject(parsed);
        return encodeObject(flattened);
    } catch (error) {
        throw new Error(`Failed to encode JSON: ${error}`);
    }
}

export function decode(triples: Triple[], keyVocabulary: Vocabulary, stringVocabulary: Vocabulary): string {
    try {
        const decoded = decodeObject(triples, keyVocabulary, stringVocabulary);
        return JSON.stringify(decoded);
    } catch (error) {
        throw new Error(`Failed to decode triples: ${error}`);
    }
}

/**
 * Generates an array of key, value encodings that can be used as inputs to a neural network.
 * @param obj flattens the object before encoding
 * @param keyVocabulary a mapping from keys to their numeric representations, will be mapped if not provided
 * @param stringVocabulary a mapping from string values to their numeric representations, will be mapped if not provided
 * @param minMaxIndex a mapping from keys to their min and max values, will be mapped if not provided
 * @returns Array of [key, value, type] triples.
 */
export function NNEncode(
    obj: Record<string, any>,
    keyVocabulary: Record<string, number> = {},
    stringVocabulary: Record<string, number> = {},
    minMaxIndex: MinMaxIndex = { keys: { min: 0, max: 0 }, values: {} } as MinMaxIndex
): { encodings: [number, number][], keyVocabulary: Record<string, number>, stringVocabulary: Record<string, number>, minMaxIndex: MinMaxIndex, types: Record<number, number> } {
    let encodings: [number, number][] = [];
    let types: Record<number, number> = {};

    obj = flattenObject(obj);

    Object.entries(obj).forEach(([key, value]) => {
        if (!key) return;
        if (value === null || value === undefined) value = String(value);
        let timestamp = parseDate(value);
        if (!timestamp && isTimestamp(key, value)) timestamp = value;
        if (timestamp) {
            // Generate three values using robust unit circle encoding (day, sin, cos).
            const [day, sinVal, cosVal] = encodeTimestamp(timestamp);
            // Update compound key entries in keyVocabulary.
            if (findKeyInVocabulary(key + ".day", keyVocabulary) === -1)
                keyVocabulary[key + ".day"] = Object.keys(keyVocabulary).length;
            if (findKeyInVocabulary(key + ".sin", keyVocabulary) === -1)
                keyVocabulary[key + ".sin"] = Object.keys(keyVocabulary).length;
            if (findKeyInVocabulary(key + ".cos", keyVocabulary) === -1)
                keyVocabulary[key + ".cos"] = Object.keys(keyVocabulary).length;

            encodings.push([keyVocabulary[key + ".day"], day]);
            encodings.push([keyVocabulary[key + ".sin"], sinVal]);
            encodings.push([keyVocabulary[key + ".cos"], cosVal]);

            // Update types for each compound key.
            types[keyVocabulary[key + ".day"]] = -2;
            types[keyVocabulary[key + ".sin"]] = -2;
            types[keyVocabulary[key + ".cos"]] = -2;

            // Update minMaxIndex for each compound key.
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key + ".day"], day);
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key + ".sin"], sinVal);
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key + ".cos"], cosVal);
            return; // Processed timestamp; continue to next property.
        }

        // Fallback for non-timestamp properties.
        if (findKeyInVocabulary(key, keyVocabulary) === -1) {
            keyVocabulary[key] = Object.keys(keyVocabulary).length;
        }

        const numDecimals = (String(value).split('.')[1] || []).length;
        const precision = numDecimals === 2 ? 2 : numDecimals > 2 ? 18 : numDecimals;

        if (typeof value === 'boolean') {
            value = value.toString();
        }
        if (typeof value === 'string') {
            if (findKeyInVocabulary(value, stringVocabulary) === -1) stringVocabulary[value] = Object.keys(stringVocabulary).length;
            encodings.push([keyVocabulary[key], stringVocabulary[value]]);
            types[keyVocabulary[key]] = -1;
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key], stringVocabulary[value]);
        }
        else if (typeof value === 'number' && numDecimals >= 2) {
            const quantizedValue = quantize(value, precision);
            encodings.push([keyVocabulary[key], quantizedValue]);
            types[keyVocabulary[key]] = precision;
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key], quantizedValue);
        } else if (typeof value === 'number' && numDecimals < 2) {
            encodings.push([keyVocabulary[key], value]);
            types[keyVocabulary[key]] = 0;
            updateMinMaxIndex(minMaxIndex, keyVocabulary[key], value);
        } else {
            encodings.push([keyVocabulary[key], -1]);
        }
    });

    return { encodings, keyVocabulary, stringVocabulary, minMaxIndex, types };
}

export function NNDecode( encodings: [number, number][], keyVocabulary: Record<string, number>, stringVocabulary: Record<string, number>, types: Record<number, number> ): Record<string, any> {
    const decoded: Record<string, any> = {};

    encodings.forEach(([key, value], index) => {
        const keyName = findInVocabulary(key, keyVocabulary);
        if (!keyName) {
            decoded[index.toString()] = undefined;
        }
        else if (types[key] === -1) {
            decoded[keyName] = findInVocabulary(value, stringVocabulary);
        } else if (types[key] > 0) {
            decoded[keyName] = unquantize(value, types[key]);
        } else {
            decoded[keyName] = value;
        }
    });

    // Combine timestamp components.
    // Look for keys ending in ".sin" and see if there's a matching ".cos"
    // Combine timestamp components.
    for (const compoundKey in decoded) {
        if (compoundKey.endsWith(".sin")) {
            const baseKey = compoundKey.slice(0, compoundKey.length - 4); // remove ".sin" suffix
            const cosKey = baseKey + ".cos";
            const dayKey = baseKey + ".day";
            if (decoded.hasOwnProperty(cosKey) && decoded.hasOwnProperty(dayKey)) {
                const sinVal = decoded[compoundKey];
                const cosVal = decoded[cosKey];
                const dayVal = decoded[dayKey];
                // Use decodeTimestamp to reconstruct the full timestamp.
                const timestamp = decodeTimestamp([dayVal, sinVal, cosVal]);

                // Add the reconstructed timestamp to the decoded under the baseKey.
                decoded[baseKey] = timestamp;
                // Remove the compound keys.
                delete decoded[compoundKey];
                delete decoded[cosKey];
                delete decoded[dayKey];
            }
        }
    }

    return decoded;
}
