import { quantize, unquantize } from "../utils/quantize.js";
import { findInVocabulary, findKeyInVocabulary } from "./vocabulary.js";


/**
 * Encodes numeric representations of data into triples.
 * @param {number} key 
 * @param {number} value 
 * @param {number} precision used for quantization and typing, `0` means no quantization, `-1` means string
 * @returns {array} `[key, value, type]` -> [number, number, number]
 */
export function encodeTriple(key, value, precision = 0) {
    if (key === null || value === null || precision === null) return [-1, -1, -1]
    if (typeof key !== 'number' || typeof value !== 'number' || typeof precision !== 'number') return [-1, -1, -1]
    let type = -1
    if (typeof value === 'number' && precision === -1) type = -1
    if (typeof value === 'number' && precision === 0) type = 0
    if (typeof value === 'number' && precision > 0) type = precision
    // when dealing with quanitization set the type to the precision so that it can be decoded later
    return [key, value, type]
}

/**
 * Generates an array of triples that can be used as inputs to a neural network.
 * @param {object} obj best to use a flattened object otherwise nested objects will be ignored
 * @returns {array} `[[key, value, type],...]`
 */
export function encodeObject(obj, keyVocabulary, stringVocabulary) {
    return Object.entries(obj).map(([key, value]) => {
        if (findKeyInVocabulary(key, keyVocabulary) === -1) {
            console.log(`Key ${key} not found in keyVocabulary`)
            return [-1, -1, -1]
        }

        const numDecimals = (value.toString().split('.')[1] || []).length;
        // if the number of decimals is 2 quantize to 2, if it's more than 2 quantize to 18, otherwise don't quantize
        const precision = numDecimals === 2 ? 2 : numDecimals > 2 ? 18 : numDecimals;

        if (typeof value === 'boolean') value = value.toString()

        if (typeof value === 'number' && numDecimals >= 2) {
            return encodeTriple(keyVocabulary[key], quantize(value, precision), precision)
        }
        if (typeof value === 'string') {
            return encodeTriple(keyVocabulary[key], findKeyInVocabulary(value, stringVocabulary), -1)
        }
        if (typeof value === 'number' && numDecimals < 2) {
            return encodeTriple(keyVocabulary[key], value, 0)
        }
        console.log(`Invalid value ${value} for key ${key}`)
        return [-1, -1, -1]
    })
}


/**
 * Decodes an array of triples into a human readable object.
 * @param {array} triples 
 * @param {object} keyVocabulary requires a vocabulary to lookup the string representation of the encoded keys
 * @param {object} stringVocabulary requires a vocabulary to lookup the string representation of the encoded string values.
 * @returns {object} 
 */
export function decodeObject(triples, keyVocabulary, stringVocabulary) {
    const object = {}
    triples.map((triple, index) => {
        if (typeof triple[0] !== 'number' || typeof triple[1] !== 'number' || typeof triple[2] !== 'number') object[index] = NaN
        else {
            const key = findInVocabulary(triple[0], keyVocabulary)
            const value = triple[1]
            const type = triple[2]
            if (key === null) object[index] = undefined
            else if (type === -1) object[key] = findInVocabulary(value, stringVocabulary) // string or null
            else if (type === 0) object[key] = value // unquantized number
            else if (type > 0) object[key] = unquantize(value, type) // quantized number
        }
    })
    return object
}

/**
 * Decodes an array of triples into a Mapped human readable object.
 * @param {array} triples 
 * @param {object} keyVocabulary 
 * @param {object} stringVocabulary 
 * @returns 
 */
export function decodeObjectMap(triples, keyVocabulary, stringVocabulary) {
    return triples.map(triple => {
        if (triple == [-1, -1,-1]) return [null, null]
        if (typeof triple[0] !== 'number' || typeof triple[1] !== 'number' || typeof triple[2] !== 'number') return [NaN, NaN]
        const key = findInVocabulary(triple[0], keyVocabulary)
        const value = triple[1]
        const type = triple[2]
        if (key === null) return [undefined, value]
        if (type === -1) return [key, findInVocabulary(value, stringVocabulary)] // string or null
        if (type === 0) return [key, value] // unquantized number
        if (type > 0) return [key, unquantize(value, type)] // quantized number
    })
}
