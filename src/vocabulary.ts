// the purpose of these functions is the build a "vocabulary" for sensory neurons in a neural network.
// The vocabulary allows the network to recognize input data, which is typically a JSON object.
// NOTE: good idea to flatten the object first, unless nested objects can be ignored.
// there is no need to generate a vocabulary for numbers since they can already be quantized and normalized to a range of 0 to 1.
// NOTE: this works only if there are separate input neurons for keys, numbers, and strings

export interface Vocabulary {
    [key: string]: number;
}


/**
 * Assigns an integer to each key in the object.
 * @param obj An object whose keys will be used to create the vocabulary.
 * @returns A mapping from key string to a unique number.
 */
export function generateKeyVocabulary(obj: Record<string, any>): Vocabulary {
    const keys = Object.keys(obj);
    const vocabulary: Vocabulary = {};

    keys.forEach((key, i) => {
        if (!Object.prototype.hasOwnProperty.call(vocabulary, key)) {
            vocabulary[key] = i;
        }
    });

    return vocabulary;
}

/**
 * Assigns an integer to each string value in the object.
 * @param obj An object whose string (or boolean) values will be used to create the vocabulary.
 * @returns A mapping from string to a unique number.
 */
export function generateStringVocabulary(obj: Record<string, any>): Vocabulary {
    const values = Object.values(obj);
    const strings = values.filter(v => typeof v === 'string' || typeof v === 'boolean');
    const uniqueStrings = [...new Set(strings)];
    const vocabulary: Vocabulary = {};

    uniqueStrings.forEach((value, i) => {
        if (typeof value === 'boolean') value = value.toString();
        if (!Object.prototype.hasOwnProperty.call(vocabulary, value)) {
            vocabulary[value] = i;
        }
    });

    return vocabulary;
}

export function generateVocabulary(obj: Record<string, any>): { keyVocab: Vocabulary, stringVocab: Vocabulary } {
    return {
        keyVocab: generateKeyVocabulary(obj),
        stringVocab: generateStringVocabulary(obj)
    }
}

/**
 * Finds the integer associated with the given string in the vocabulary.
 * @param str The string to lookup.
 * @param vocabulary A mapping from strings to numbers.
 * @returns The corresponding number if found, otherwise -1.
 */
export function findKeyInVocabulary(str: string, vocabulary: Vocabulary): number {
    return Object.prototype.hasOwnProperty.call(vocabulary, str) ? vocabulary[str] : -1;
}

/**
 * Finds the key associated with a given value in the vocabulary.
 * @param value The numeric value to lookup.
 * @param vocabulary A mapping from string keys to numbers.
 * @returns The key as a string if found; otherwise, null.
 */
export function findInVocabulary(value: number, vocabulary: Vocabulary): string | null {
    for (const key in vocabulary) {
        if (vocabulary[key] === value) {
            return key;
        }
    }
    return null; // Return null if no key is found for the given value
}