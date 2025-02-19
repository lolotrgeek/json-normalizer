import { arrayObjectToArray, flattenObject, unFlattenObject } from "./utils/util";
import { decodeObject, encodeObject } from "./src/encoder";
import { generateKeyVocabulary, generateStringVocabulary } from "./src/vocabulary";
import { denormalize, mergeTripleArraysAndFindMinMax, normalize } from "./src/normalizer";

const jsonStr = `[{
    "name": "Alice",
    "age": 30,
    "timestamp": 1672531200000, 
    "address": {
        "city": "Wonderland",
        "zip": "12345"
    },
    "hobbies": ["reading", "chess"]
}, {
    "name": "Bob",
    "age": 25,
    "timestamp": 1672531200000,
    "address": {
        "city": "Builderland",
        "zip": "67890"
    },
    "hobbies": ["building", "chess"]
}]`;

// Parse JSON and flatten the object so that nested objects and arrays become one level.
const parsedObj = JSON.parse(jsonStr);
const flattened = flattenObject(parsedObj);
console.log("Flattened Object:", flattened);

// Generate vocabularies for keys and string values.
// Note: encodeObject is designed for flattened objects,
// and vocabularies map keys and strings to numeric representations.

// Encode the flattened object into an array of triples [key, value, type]
const {triples, keyVocabulary, stringVocabulary } = encodeObject(flattened);
console.log("Key Vocabulary:", keyVocabulary);
console.log("String Vocabulary:", stringVocabulary);
console.log("Encoded Triples:", triples);

// Find the min and max values for each triple for normalization, needed for denormalization later.
const minMaxIndex = mergeTripleArraysAndFindMinMax(triples);

// Normalize the dataset. (Optionally, you can pass an existing minMaxIndex.)
const normalized = normalize(triples, minMaxIndex);
console.log("Normalized:", normalized);

const denormalized = denormalize(normalized, minMaxIndex);

const object = decodeObject(denormalized, keyVocabulary, stringVocabulary);

console.log("Decoded Object:", object);

const unflattened = unFlattenObject(object);
const original = arrayObjectToArray(unflattened);
console.log("Original Object:", original);