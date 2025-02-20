import * as fs from "fs";
import * as path from "path";
import { flattenObject } from "./utils/util";
import { encodeObject, decodeObject } from "./src/encoder";

// Load largeArray.json from disk.
const filePath = path.join(__dirname, "largeArray.json");
const fileContent = fs.readFileSync(filePath, "utf-8");

// Parse JSON as an array.
const dataArray: any[] = JSON.parse(fileContent);

// Process each object. (best not to encode all at once, encode each object separately and have multiple vocabualries)
dataArray.forEach((obj, index) => {
    // Flatten the object.
    const flatObj = flattenObject(obj);

    // Encode the flattened object.
    const { triples, keyVocabulary, stringVocabulary } = encodeObject(flatObj);

    // Decode the object from the encoded triples.
    const decodedObj = decodeObject(triples, keyVocabulary, stringVocabulary);

    console.log(`Result for object ${index}:`);
    console.log("Original Flattened Object:", flatObj);
    console.log("Encoded Triples:", triples);
    console.log("Decoded Object:", decodedObj);
    console.log("----------");
});