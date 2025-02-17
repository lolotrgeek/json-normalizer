export const getMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    if (sorted.length % 2 !== 0) {
        return sorted[Math.floor(sorted.length / 2)];
    } else {
        return getMean(sorted.slice(Math.floor(sorted.length / 2), Math.floor(sorted.length / 2) + 2));
    }
};

export const getMean = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const total = arr.reduce((acc, curr) => acc + curr, 0);
    return total / arr.length;
};

export const eqThrsh = (a: number, b: number, threshold: number = 0.00001): boolean => {
    return Math.abs(a - b) < threshold;
};

/**
 * Returns a random integer between 0 and n-1
 * @param n Maximum number (exclusive)
 */
export const randomInt = (n: number): number => {
    return Math.floor(Math.random() * n);
};

/**
 * Returns a random float between 0 and n
 * @param n Maximum value (exclusive)
 */
export const randomFloat = (n: number): number => {
    return Math.random() * n;
};

/**
 * Uses Box-Muller transform to generate random numbers that produce a normal distribution
 * @param min 
 * @param max 
 * @returns A random float between min and max that follows a normal distribution
 */
export const randomFloatUniform = (min: number, max: number): number => {
    let u1 = Math.random();
    if (u1 === 0) u1 = 0.000000001;
    let u2 = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * 0.1 + 0.5;
    let res = z * (max - min) + min;
    if (res > max) res = max;
    if (res < min) res = min;
    return res;
};

/**
 *  Returns a random color in the format rgba(r, g, b, a)
 * @param {*} r 
 * @param {*} g 
 * @param {*} b 
 * @returns 
 */
export const rgb = (r: number, g: number, b: number): string => {
    return `rgba(${r}, ${g}, ${b})`;
};

/**
 *  Returns a random color in the format rgba(r, g, b, a)
 * @param {*} r 
 * @param {*} g 
 * @param {*} b 
 * @param {*} a 
 * @returns 
 */
export const rgba = (r: number, g: number, b: number, a: number): string => {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 *  Returns a random color in the format hsl(h, s, l)
 * @param {*} h 
 * @param {*} s 
 * @param {*} l 
 * @returns 
 */

export const hsl = (h: number, s: number, l: number): string => {
    return `hsl(${h}, ${s}%, ${l}%)`;
};

export interface Point {
    x: number;
    y: number;
}

export const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const shuffleArray = <T>(a: T[]): T[] => {
    return [...a].sort(() => Math.random() - 0.5);
};

export const execAsync = (fun: () => void): void => {
    setTimeout(() => {
        fun();
    }, 0);
};

/**
 * Flattens an object into a single level object with keys as the path to the value
 * 
 * Nested Objects: { a: { b: 2 } } --> { "a.b": 2 }.
 * 
 * Arrays: { a: [1, 2] } --> { "a.0": 1, "a.1": 2 }
 * 
 * @param ob 
 * @returns 
 */
export function flattenObject(ob: Record<string, any>): Record<string, any> {
    const toReturn: Record<string, any> = {};
    for (const i in ob) {
        if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
        if (typeof ob[i] === 'object' && ob[i] !== null) {
            const flatObject = flattenObject(ob[i]);
            for (const x in flatObject) {
                if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

/**
 * 
 * @param data 
 * @returns 
 */
export function unFlattenObject(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in data) {
        const keys = key.split('.');
        keys.reduce((r, k, i, arr) => {
            if (i === arr.length - 1) {
                if (isNaN(Number(k))) {
                    r[k] = data[key];
                } else {
                    r[parseInt(k)] = data[key];
                }
            } else {
                r[k] = r[k] || (isNaN(Number(arr[i + 1])) ? {} : []);
            }
            return r[k];
        }, result);
    }
    return result;
}

/**
 * Round half to even
 * @param num The number to round.
 * @param decimalPlaces The number of decimal places (default is 2).
 * @returns The rounded number.
 */
export function round(num: number, decimalPlaces: number = 2): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}