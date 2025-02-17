import { decodeObject, encodeObject } from "./src/encoder";
import { deNormalizeDataset, normalizeDataset } from "./src/normalizer";
import { generateVocabulary, Vocabulary } from "./src/vocabulary";
import { flattenObject } from "./utils/util";


/**
 *
 * @param json 
 * @param keyVocab needed to encode keys from json, will be generated if not provided
 * @param stringVocab needed to encode string values from json, will be generated if not provided
 * @returns 
 */
export function encode(json: string, keyVocab?: Vocabulary, stringVocab?: Vocabulary): [number, number, number][] {
    try {
        const parsed = JSON.parse(json);
        const flattened = flattenObject(parsed);
        if (!keyVocab || !stringVocab) {
            const vocab = generateVocabulary(flattened);
            keyVocab = vocab.keyVocab;
            stringVocab = vocab.stringVocab;
        }
        return encodeObject(flattened, keyVocab, stringVocab);
    } catch (error) {
        throw new Error(`Failed to encode JSON: ${error}`);
    }

}


export { generateVocabulary, normalizeDataset, deNormalizeDataset, decodeObject };