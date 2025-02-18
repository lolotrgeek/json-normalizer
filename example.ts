import { arrayObjectToArray, flattenObject, unFlattenObject } from "./utils/util";
import { decodeObject, encodeObject } from "./src/encoder";
import { generateKeyVocabulary, generateStringVocabulary } from "./src/vocabulary";
import { denormalize, mergeTripleArraysAndFindMinMax, normalize } from "./src/normalizer";

// Example JSON string
const jsonStr = `[{
    "name": "Alice",
    "age": 30,
    "address": {
        "city": "Wonderland",
        "zip": "12345"
    },
    "hobbies": ["reading", "chess"]
}, {
    "name": "Bob",
    "age": 25,
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
const keyVocabulary = generateKeyVocabulary(flattened);
const stringVocabulary = generateStringVocabulary(flattened);
console.log("Key Vocabulary:", keyVocabulary);
console.log("String Vocabulary:", stringVocabulary);

// Encode the flattened object into an array of triples [key, value, type]
const triples = encodeObject(flattened, keyVocabulary, stringVocabulary);
console.log("Encoded Triples:", triples);


// Find the min and max values for each triple for normalization, needed for denormalization later.
const minMaxIndex = mergeTripleArraysAndFindMinMax(triples);

// Normalize the dataset. (Optionally, you can pass an existing minMaxIndex.)
const normalized = normalize(triples, minMaxIndex);
console.log("Normalized Dataset:", normalized);

const denormalized = denormalize(normalized, minMaxIndex);

const object = decodeObject(denormalized, keyVocabulary, stringVocabulary);

console.log("Decoded Object:", object);

const unflattened = unFlattenObject(object);
const original = arrayObjectToArray(unflattened);
console.log("Original Object:", original);