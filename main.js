function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function isEncodedString(integer) {
    const str = String(integer);
    return str.length > 1 && str.startsWith('0');
}

function flattenObject(ob) {
    const toReturn = {};

    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            const flatObject = flattenObject(ob[i]);
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

function normalizeObject(obj) {
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    const minKey = Math.min(...keys.map(k => k.length));
    const maxKey = Math.max(...keys.map(k => k.length));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const normalized = {};
    keys.forEach((key, i) => {
        normalized[normalize(key.length, minKey, maxKey)] = normalize(values[i], minValue, maxValue);
    });

    return normalized;
}

function objectToArray(obj) {
    return Object.entries(obj);
}

function processJSON(json) {
    const parsed = JSON.parse(json);
    const flattened = flattenObject(parsed);
    const normalized = normalizeObject(flattened);
    return objectToArray(normalized);
}



module.exports = { normalize, isEncodedString, flattenObject, normalizeObject, objectToArray, processJSON };