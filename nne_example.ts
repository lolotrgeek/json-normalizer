import * as fs from "fs";
import * as path from "path";
import { flattenObject, unFlattenObject } from "./utils/util";
import { encodeObject, decodeObject } from "./src/encoder";
import { NNDecode, NNEncode, normalize } from "./main";
import { denormalize, mergeAndFindMinMax, mergeDatasetAndFindMinMax, MinMaxIndex, NNdenormalize, NNnormalize } from "./src/normalizer";

// Load largeArray.json from disk.
const filePath = path.join(__dirname, "largeArray.json");
const fileContent = fs.readFileSync(filePath, "utf-8");
const startTime = performance.now();

// Parse JSON as an array.
const dataArray: any[] = JSON.parse(fileContent);

// let minMaxIndex = {keys: {min: 0, max: 0}, values: {}} as MinMaxIndex;
let keyVocabulary = {}
let stringVocabulary = {}
let types = {}

const encoded = dataArray.map((obj, index) => {
    const nne = NNEncode(obj, keyVocabulary, stringVocabulary);
    keyVocabulary = nne.keyVocabulary;
    stringVocabulary = nne.stringVocabulary;
    types = nne.types;

    return nne.encodings
});

//TODO: clean up ununsed functions and write tests for NN fns

const minMaxIndex = mergeAndFindMinMax(encoded);

const normalized = encoded.map(obj => NNnormalize(obj, minMaxIndex, types));

const endTime = performance.now();

const decoded = encoded.map((obj, index) => {
    return NNDecode(obj, keyVocabulary, stringVocabulary, types);
});
const denormalized = normalized.map(obj => NNdenormalize(obj, minMaxIndex, types))
// console.log(types)
const rebuilt = denormalized.map(obj => NNDecode(obj, keyVocabulary, stringVocabulary, types))

console.log(stringVocabulary)

console.log(encoded[encoded.length - 1])
console.log(denormalized[denormalized.length - 1])
console.log(decoded[decoded.length - 1])
console.log(rebuilt[rebuilt.length - 1])

console.log(`Time taken: ${endTime - startTime} ms`);