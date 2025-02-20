import { decodeObject, encodeObject, Triple } from "./src/encoder";
import { deNormalizeDataset, normalizeDataset, normalize, denormalize } from "./src/normalizer";
import { generateVocabulary, Vocabulary } from "./src/vocabulary";
import { flattenObject } from "./utils/util";


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


export { generateVocabulary, normalize, denormalize, normalizeDataset, deNormalizeDataset, decodeObject, encodeObject, flattenObject };