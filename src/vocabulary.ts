// the purpose of these functions is the build a "vocabulary" for sensory neurons in a neural network.
// The vocabulary allows the network to recognize input data, which is typically a JSON object.
// NOTE: good idea to flatten the object first, unless nested objects can be ignored.
// there is no need to generate a vocabulary for numbers since they can already be quantized and normalized to a range of 0 to 1.
// NOTE: this works only if there are separate input neurons for keys, numbers, and strings

export interface Vocabulary {
    [key: string]: number;
}


/**
 * Recursively processes the input, flattening keys as it goes.
 * For objects, keys are concatenated with a dot.
 * For arrays, if all elements are objects with identical keys, the index is replaced with -1.
 * Otherwise, indices are used normally.
 *
 * Each new flattened key is added to the vocabulary with a unique integer.
 * 
 * This significantly reduces the size of the vobaulary, but means that indicies must be passed along with key, value and type (Quads)
 *
 * @param obj The un-flattened input object.
 * @returns A mapping from flattened key strings to unique numbers.
 */
export function generateKeyVocabulary(obj: Record<string, any>): Vocabulary {
    const vocabulary: Vocabulary = {};
    let currentIndex = 0;

    // Helper to add a key if not already present and assign a unique integer.
    const addKey = (key: string) => {
        if (!(key in vocabulary)) {
            vocabulary[key] = currentIndex++;
        }
    };

    /**
     * Recursively processes the given value with the current prefix.
     * @param value The current value to process.
     * @param prefix The flattened key accumulated so far.
     */
    const process = (value: any, prefix: string = ""): void => {
        if (Array.isArray(value)) {
            // Determine if all elements are objects and have the same keys.
            let uniform = false;
            if (
                value.length > 0 &&
                value.every(
                    (elem) =>
                        elem !== null &&
                        typeof elem === "object" &&
                        !Array.isArray(elem)
                )
            ) {
                const firstKeys = Object.keys(value[0]).sort();
                uniform = value.every((elem) => {
                    const elemKeys = Object.keys(elem).sort();
                    return JSON.stringify(elemKeys) === JSON.stringify(firstKeys);
                });
            }

            if (uniform) {
                // Use -1 as index if the elements are uniform.
                const newPrefix = prefix ? `${prefix}.-1` : `-1`;
                // addKey(newPrefix);
                // Process only the first element (all share the same structure).
                process(value[0], newPrefix);
            } else {
                // Not uniform; process each element with its index.
                value.forEach((elem, index) => {
                    const newPrefix = prefix ? `${prefix}.${index}` : `${index}`;
                    // addKey(newPrefix);
                    process(elem, newPrefix);
                });
            }
        } else if (value && typeof value === "object") {
            // Process each property of the object.
            Object.keys(value).forEach((key) => {
                const newPrefix = prefix ? `${prefix}.${key}` : key;
                addKey(newPrefix);
                process(value[key], newPrefix);
            });
        }
        // Primitive values do not need further processing.
    };

    process(obj);
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
 * If the key is not found as-is and includes any negative index segments,
 * these segments are replaced with "-1" and the function searches again.
 *
 * For example, "a.1.c" is searched as-is, but "a.-0.c" becomes "a.-1.c"
 * and "-2.a.c" becomes "-1.a.c".
 *
 * @param str The string to lookup.
 * @param vocabulary A mapping from strings to numbers.
 * @returns The corresponding number if found, otherwise -1.
 */
export function findKeyInVocabulary(str: string, vocabulary: Vocabulary): number {
    if (Object.prototype.hasOwnProperty.call(vocabulary, str)) {
        return vocabulary[str];
    }
    
    // First, replace any negative index at the beginning of the string.
    let modifiedStr = str.replace(/^(-\d+)(?=\.|$)/, "-1");

    // Replace any negative index segments following a dot.
    modifiedStr = modifiedStr.replace(/(\.-)\d+/g, "$1-1");

    return Object.prototype.hasOwnProperty.call(vocabulary, modifiedStr) ? vocabulary[modifiedStr] : -1;
}

/**
 * Finds the key associated with a given value in the vocabulary.
 * If not found directly, and the key might belong to a uniform array,
 * it then replaces any negative index with -1 (e.g. "a.-0.c" becomes "a.-1.c")
 * and checks again.
 *
 * @param value The numeric value to lookup.
 * @param vocabulary A mapping from string keys to numbers.
 * @returns The key as a string if found; otherwise, null.
 */
export function findInVocabulary(value: number, vocabulary: Vocabulary): string | null {
    // First, try the standard reverse lookup.
    for (const key in vocabulary) {
        if (vocabulary[key] === value) {
            return key;
        }
    }
    // Next, try to replace any negative index with -1 only.
    for (const key in vocabulary) {
        // This regex only targets segments that start with ".-" followed by digits.
        const modifiedKey = key.replace(/(\.-)[0-9]+/g, "$1-1");
        if (modifiedKey in vocabulary && vocabulary[modifiedKey] === value) {
            return modifiedKey;
        }
    }
    return null; // Return null if no key is found.
}