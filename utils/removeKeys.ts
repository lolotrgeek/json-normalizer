/**
 * Removes the specified keys from an object.
 * @param obj The object to remove keys from.
 * @param keysToRemove An array of keys to remove.
 * @returns A new object without the specified keys.
 */
export default function removeKeys(obj: Record<string, any>, keysToRemove: string[]): Record<string, any> {
    let newObj = { ...obj }; // Create a copy of the object
    keysToRemove.forEach(key => {
        delete newObj[key]; // Remove each key
    });
    return newObj; // Return the modified object
}