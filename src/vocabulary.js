// the purpose of these functions is the build a "vocabulary" for sensory neurons in a neural network.
// The vocabulary allows the network to recognize input data, which is typically a JSON object.
// NOTE: good idea to flatten the object first, unless nested objects can be ignored.
// there is no need to generate a vocabulary for numbers since they can already be quantized and normalized to a range of 0 to 1.
// NOTE: this works only if there are separate input neurons for keys, numbers, and strings

/**
 * Assigns an integer to each key in the object.
 * @param {object} obj 
 * @returns 
 */
export function generateKeyVocabulary(obj) {
    const keys = Object.keys(obj);
    const vocabulary = {};

    keys.forEach((key, i) => {
        if (!Object.prototype.hasOwnProperty.call(vocabulary, key)) vocabulary[key] = i;
    });

    return vocabulary;
}

/**
 * Assigns an integer to each string value in the object.
 * @param {*} obj 
 * @returns 
 */
export function generateStringVocabulary(obj) {
    const values = Object.values(obj);
    const strings = values.filter(v => typeof v === 'string' || typeof v === 'boolean' );
    const uniqueStrings = [...new Set(strings)];
    const vocabulary = {};

    uniqueStrings.forEach((key, i) => {
       if (!Object.prototype.hasOwnProperty.call(vocabulary, key)) vocabulary[key] = i
    });

    return vocabulary;
}

export function findKeyInVocabulary(string, vocabulary) {
    return Object.prototype.hasOwnProperty.call(vocabulary, string) ? vocabulary[string] : -1;
}

export function findInVocabulary(value, vocabulary) {
    for (let key in vocabulary) {
        if (vocabulary[key] === value) {
            return key;
        }
    }
    return null; // Return null if no key is found for the given value
}