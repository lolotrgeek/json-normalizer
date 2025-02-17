import { flattenObject, unFlattenObject } from "./utils/util";
import { decodeObject, encodeObject } from "./src/encoder";
import { generateKeyVocabulary, generateStringVocabulary } from "./src/vocabulary";
import { deNormalizeDataset, mergeTripleArraysAndFindMinMax, normalizeDataset } from "./src/normalizer";

// Example JSON string
const jsonStr = `{
    "name": "Alice",
    "age": 30,
    "address": {
        "city": "Wonderland",
        "zip": "12345"
    },
    "hobbies": ["reading", "chess"]
}`;

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

// To prepare for normalization, wrap the triples in a dataset array.
// This example uses a single element dataset.
const dataset = [triples];

// Find the min and max values for each triple for normalization, needed for denormalization later.
const minMaxIndex = mergeTripleArraysAndFindMinMax(dataset);

// Normalize the dataset. (Optionally, you can pass an existing minMaxIndex.)
const normalizedDataset = normalizeDataset(dataset, minMaxIndex);
console.log("Normalized Dataset:", normalizedDataset);

const denormalizedDataset = deNormalizeDataset(normalizedDataset, minMaxIndex);

const object = decodeObject(denormalizedDataset[0], keyVocabulary, stringVocabulary);

console.log("Decoded Object:", object);

const original = unFlattenObject(object);
console.log("Original Object:", original);