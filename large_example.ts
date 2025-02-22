import * as fs from "fs";
import * as path from "path";
import { flattenObject, unFlattenObject } from "./utils/util";
import { encodeObject, decodeObject } from "./src/encoder";
import { normalize } from "./main";
import { denormalize, mergeDatasetAndFindMinMax } from "./src/normalizer";

// Load largeArray.json from disk.
const filePath = path.join(__dirname, "largeArray.json");
const fileContent = fs.readFileSync(filePath, "utf-8");

const startTime = performance.now();

// Parse JSON as an array.
const dataArray: any[] = JSON.parse(fileContent);

// Process each object. (best not to encode all at once, encode each object separately and have multiple vocabularies)
const encoded = dataArray.map((obj, index) => {
    // Flatten the object.
    const flatObj = flattenObject(obj);

    // Encode the flattened object.
    const { triples, keyVocabulary, stringVocabulary } = encodeObject(flatObj);

    return { triples, keyVocabulary, stringVocabulary };
});

const minMaxIndex = mergeDatasetAndFindMinMax(encoded.map((obj) => obj.triples));

const normalized = encoded.map(obj => normalize(obj.triples, minMaxIndex));
// console.log(normalized)
const endTime = performance.now();

const denormalized = normalized.map(obj => denormalize(obj, minMaxIndex))

const decoded = denormalized.map((obj, index) => unFlattenObject(decodeObject(obj, encoded[index].keyVocabulary, encoded[index].stringVocabulary)));


console.log(decoded);
console.log(`Time taken: ${endTime - startTime} ms`);
