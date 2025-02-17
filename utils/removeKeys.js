
/**
 * 
 * @param {object} obj 
 * @param {array} keysToRemove 
 * @returns {object}
 */
export default function removeKeys(obj, keysToRemove) {
    let newObj = { ...obj }; // Create a copy of the object
    keysToRemove.forEach(key => {
        delete newObj[key]; // Remove each key
    });
    return newObj; // Return the modified object
}