import removeKeys from "../utils/removeKeys";

describe('removeKeys', () => {
    it('should remove specified keys from the object', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const keysToRemove = ['a', 'c'];
        const newObj = removeKeys(obj, keysToRemove);
        expect(newObj).toEqual({ b: 2, d: 4 });
    });

    it('should not modify the original object', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const originalObj = { ...obj };
        const keysToRemove = ['a', 'c'];
        removeKeys(obj, keysToRemove);
        expect(obj).toEqual(originalObj);
    });

    it('should return a new object even if no keys are removed', () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const keysToRemove = [];
        const newObj = removeKeys(obj, keysToRemove);
        expect(newObj).not.toBe(obj);
        expect(newObj).toEqual(obj);
    });
});