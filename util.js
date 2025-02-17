
export const getMedian = (arr) => {
    arr.sort((a, b) => a - b);
    if (arr.length % 2 != 0) {
        return arr[Math.floor(arr.length / 2)];
    } else {
        return getMean(arr.slice(Math.floor(arr.length / 2), Math.floor(arr.length / 2) + 2));
    }
}

export const getMean = (arr) => {
    if (arr.length == 0) return 0;
    const total = arr.reduce((curr, acc) => acc + curr, 0);
    return total / arr.length;
}

export const eqThrsh = (a, b, threshold = 0.00001) => Math.abs(a - b) < threshold;

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
export const randomInt = (n) => Math.floor(Math.random() * n);

/**
 * @param {Number} n
 * @returns Random Float Between 0 and n-1
 */
export const randomFloat = (n) => Math.random() * n;

/**
 * Uses Box-Muller transform to generate random numbers that produce a normal distribution
 * @param {Number} min 
 * @param {Number} max 
 * @returns random float between min and max that follows a normal distribution
 */
export const randomFloatUniform = (min, max) => {
    let u1 = Math.random();
    if (u1 == 0) u1 = 0.000000001;
    let u2 = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * 0.1 + 0.5;

    let res = z * (max - min) + min;
    if (res > max) res = max;
    if (res < min) res = min;
    return res;
}

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
export const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
export const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
export const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;


/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
export const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Shuffles a provided array
 * @param {Array} a the array to be shuffled
 * @returns a shuffled copy of the array
 */
export const shuffleArray = (a) => [...a].sort(() => Math.random() - 0.5);


export const execAsync = (fun) => {
    setTimeout(() => {
        fun;
    }, 0)
}

/**
 * 
 * @param {*} ob 
 * @returns 
 */
export function flattenObject(ob) {
    const toReturn = {};

    for (let i in ob) {
        if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            const flatObject = flattenObject(ob[i]);
            for (let x in flatObject) {
                if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

export function unFlattenObject(data) {
    const result = {};
    for (const key in data) {
        const keys = key.split('.');
        keys.reduce((r, k, i, arr) => {
            if (i === arr.length - 1) {
                if (isNaN(k)) {
                    r[k] = data[key];
                } else {
                    r[parseInt(k)] = data[key];
                }
            } else {
                r[k] = r[k] || (isNaN(arr[i + 1]) ? {} : []);
            }
            return r[k];
        }, result);
    }
    return result;
}

/**
 * round half to even
 * @param {*} num 
 * @param {*} decimalPlaces 
 * @returns 
 */
export function round(num, decimalPlaces = 2) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}