/* eslint-disable no-undef */
import { encodeTriple, encodeTimestamp, decodeTimestamp, encodeObject, decodeObjectMap, decodeObject } from "../src/encoder";

describe('encodeTriple', () => {
    it('should return [-1, -1, -1] when any of the parameters is null', () => {
        // Cast to any to intentionally allow null values
        expect(encodeTriple(null as any, 1, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, null as any, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 1, null as any)).toEqual([-1, -1, -1]);
    });

    it('should return [-1, -1, -1] when any of the parameters is not a number', () => {
        expect(encodeTriple('a' as any, 1, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 'a' as any, 1)).toEqual([-1, -1, -1]);
        expect(encodeTriple(1, 1, 'a' as any)).toEqual([-1, -1, -1]);
    });

    it('should return input when value is a number and precision is 0', () => {
        expect(encodeTriple(1, 2, 0)).toEqual([1, 2, 0]);
    });

    it('should return [key, value, precision] when value is a number and precision is greater than 0', () => {
        expect(encodeTriple(1, 2, 2)).toEqual([1, 2, 2]);
    });

    it('should return [key, value, 0] when value is a string', () => {
        expect(encodeTriple(1, '2', 0)).toEqual([1, 2, 0]);
    });
});

describe('encodeTimestamp', () => {
  const msInDay = 24 * 60 * 60 * 1000;

  it('should encode a timestamp of 0 ms correctly', () => {
    // At timestamp 0, day = 0, remainder = 0, normalizedTime = 0.
    // Therefore, sin(0)=0 and cos(0)=1.
    const timestamp = 0;
    const encoded = encodeTimestamp(timestamp);
    expect(encoded[0]).toEqual(0);
    expect(encoded[1]).toBeCloseTo(0, 5);
    expect(encoded[2]).toBeCloseTo(1, 5);
  });

  it('should encode a timestamp corresponding to 6AM correctly', () => {
    // For 6AM:
    // 6 hours in ms = 6 * 3600 * 1000 = 21,600,000 ms.
    // normalizedTime = 21,600,000 / msInDay = 0.25.
    // Expected: sin(0.25*2π)=sin(π/2)=1 and cos(π/2)=0.
    const timestamp = 6 * 3600 * 1000; // 21,600,000 ms
    const encoded = encodeTimestamp(timestamp);
    expect(encoded[0]).toEqual(0); // Still day 0
    expect(encoded[1]).toBeCloseTo(Math.sin(0.25 * 2 * Math.PI), 5);
    expect(encoded[2]).toBeCloseTo(Math.cos(0.25 * 2 * Math.PI), 5);
  });

  it('should encode a timestamp corresponding to 12PM (noon) correctly', () => {
    // For 12PM:
    // 12 hours in ms = 12 * 3600 * 1000 = 43,200,000 ms.
    // normalizedTime = 43,200,000 / msInDay = 0.5.
    // Expected: sin(0.5*2π)=sin(π)=0 and cos(π) = -1.
    const timestamp = 12 * 3600 * 1000; // 43,200,000 ms
    const encoded = encodeTimestamp(timestamp);
    expect(encoded[0]).toEqual(0); // Day 0
    expect(encoded[1]).toBeCloseTo(0, 5);
    expect(encoded[2]).toBeCloseTo(-1, 5);
  });

  it('should encode a timestamp on a non-zero day correctly', () => {
    // Let’s choose a timestamp with day = 19400 and normalized time = 0.75.
    // Full timestamp = (19400 + 0.75) * msInDay.
    const day = 19400;
    const normalizedTime = 0.75;
    const timestamp = day * msInDay + normalizedTime * msInDay;
    const encoded = encodeTimestamp(timestamp);
    expect(encoded[0]).toEqual(day);
    expect(encoded[1]).toBeCloseTo(Math.sin(normalizedTime * 2 * Math.PI), 5);
    expect(encoded[2]).toBeCloseTo(Math.cos(normalizedTime * 2 * Math.PI), 5);
  });

  it('should roundtrip correctly with an example timestamp', () => {
    // Using a sample timestamp, verify that the computed day and time fraction match.
    const sampleTimestamp = 1672531200000; // example timestamp in ms
    const encoded = encodeTimestamp(sampleTimestamp);

    const expectedDay = Math.floor(sampleTimestamp / msInDay);
    const remainder = sampleTimestamp % msInDay;
    const normalizedTime = remainder / msInDay;

    expect(encoded[0]).toEqual(expectedDay);
    expect(encoded[1]).toBeCloseTo(Math.sin(normalizedTime * 2 * Math.PI), 5);
    expect(encoded[2]).toBeCloseTo(Math.cos(normalizedTime * 2 * Math.PI), 5);
  });
});

describe('decodeTimestamp', () => {
    const msInDay = 24 * 60 * 60 * 1000;

    it('should decode a timestamp of 0 ms', () => {
        // For timestamp 0:
        // day = 0, remainder = 0, normalizedTime = 0.
        // Thus the triple is: [0, sin(0)=0, cos(0)=1].
        const encoded: [number, number, number] = [0, 0, 1];
        const decoded = decodeTimestamp(encoded);
        expect(decoded).toBeCloseTo(0, 5);
    });

    it('should decode a timestamp corresponding to 6AM', () => {
        // For 6AM:
        // 6 hours in ms = 6 * 3600 * 1000 = 21,600,000 ms.
        // Normalized time = 21,600,000 / msInDay = 0.25.
        // Angle = 0.25 * 2π = π/2, sin(π/2)=1, cos(π/2)=0.
        const encoded: [number, number, number] = [0, 1, 0];
        const decoded = decodeTimestamp(encoded);
        expect(decoded).toBeCloseTo(21_600_000, 5);
    });

    it('should decode a timestamp corresponding to 12PM (noon)', () => {
        // For 12PM:
        // 12 hours = 12 * 3600 * 1000 = 43,200,000 ms.
        // Normalized time = 0.5, Angle = π.
        // sin(π)=0, cos(π)=-1.
        const encoded: [number, number, number] = [0, 0, -1];
        const decoded = decodeTimestamp(encoded);
        expect(decoded).toBeCloseTo(43_200_000, 5);
    });

    it('should decode a timestamp on a non-zero day', () => {
        // Let's assume the following triple:
        // day = 19400, normalizedTime = 0.75.
        // Then the full timestamp should be: (19400 + 0.75) * msInDay.
        // 0.75 * 2π = 1.5π, sin(1.5π) = -1, cos(1.5π) = 0.
        const day = 19400;
        const normalizedTime = 0.75;
        const encoded: [number, number, number] = [
            day,
            Math.sin(normalizedTime * 2 * Math.PI),
            Math.cos(normalizedTime * 2 * Math.PI)
        ];
        const decoded = decodeTimestamp(encoded);
        const expected = (day + normalizedTime) * msInDay;
        expect(decoded).toBeCloseTo(expected, 5);
    });

    it('should roundtrip correctly with an example timestamp', () => {
        // Using a sample timestamp. EncodeTimestamp is assumed to produce a triple [day, sin, cos]
        // All information is present so that decodeTimestamp returns the original full timestamp.
        // For example, using 1672531200000 ms.
        const sampleTimestamp = 1672531200000;
        // Manually compute the encoded triple:
        const day = Math.floor(sampleTimestamp / msInDay);
        const remainder = sampleTimestamp % msInDay;
        const normalizedTime = remainder / msInDay;
        const encoded: [number, number, number] = [
            day,
            Math.sin(normalizedTime * 2 * Math.PI),
            Math.cos(normalizedTime * 2 * Math.PI)
        ];
        const decoded = decodeTimestamp(encoded);
        expect(decoded).toBeCloseTo(sampleTimestamp, 5);
    });

    it('should decode a timestamp afer encoding', () => {
        const timestamp = 1672531200000;
        const timestampTriple = encodeTimestamp(timestamp);
        const decodedTimestamp = decodeTimestamp(timestampTriple);
        console.log(decodedTimestamp)
        expect(decodedTimestamp).toBeCloseTo(timestamp);
    });
});

describe('encodeObject', () => {
    it('should return the correct encoding for given inputs', () => {
        const obj = {
            key1: 1.23,
            key2: 'value2'
        };
        const keyVocabulary = {
            key1: 1,
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const { triples } = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(triples).toEqual([
            [1, 123, 2],
            [2, 1, -1]
        ]);
    });

    it('should return correct encoding for a number with more than 2 decimals', () => {
        const obj = {
            key1: 1.2345,
        };
        const keyVocabulary = {
            key1: 1
        };
        const stringVocabulary: Record<string, number> = {};
        const { triples } = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(triples).toEqual([
            [1, 1234500000000000000, 18]
        ]);
    });

    it('should return generate key when the key is not in the keyVocabulary', () => {
        const obj = {
            key1: 1.23,
            key2: 'value2'
        };
        const keyVocabulary = {
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const { triples } = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(triples).toEqual([
            [1, 123, 2],
            [2, 1, -1]
        ]);
    });

    it('should return [-1, -1, -1] for a nested object', () => {
        const obj = {
            key1: {
                key2: 1.23
            }
        };
        const keyVocabulary = {
            key1: 1,
            key2: 2
        };
        const stringVocabulary = {
            value2: 1
        };
        const { triples } = encodeObject(obj, keyVocabulary, stringVocabulary);
        expect(triples).toEqual([
            [-1, -1, -1]
        ]);
    });

    it('should encode a timestamp correctly', () => {
        const obj = {
            timestamp: 1672531200000
        };
        const { triples } = encodeObject(obj);
        expect(triples).toEqual([
            [0, 19358, -2],
            [1, 0, -2],
            [2, 1, -2]
        ]);
    });
    it('should encode a date string as a timestamp', () => {
        const obj = {
            timestamp: '2023-01-01T00:00:00Z'
        };
        const { triples } = encodeObject(obj);
        expect(triples).toEqual([
            [0, 19358, -2],
            [1, 0, -2],
            [2, 1, -2]
        ]);
    });
    it('should encode a null and undefined values as strings', () => {
        const obj = {
            key1: null,
            key2: undefined
        };
        const { triples } = encodeObject(obj);
        expect(triples).toEqual([
            [0, -1, -1],
            [1, -1, -1]
        ]);
    });
});

describe('decodeObject', () => {
    it('should decode object with null values', () => {
        const triples: [number, number, number][] = [[-1, -1, -1]];
        const keyVocabulary: Record<string, number> = {};
        const stringVocabulary: Record<string, number> = {};
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({ 0: undefined });
    });

    it('should decode object with NaN values', () => {
        const triples: any = [['a', 'b', 'c']];
        const keyVocabulary: Record<string, number> = {};
        const stringVocabulary: Record<string, number> = {};
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({ 0: NaN });
    });

    it('should return NaN for any triple containing null', () => {
        const triples: any = [[null, 1, 1], [1, null, 1], [1, 1, null]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({ 0: NaN, 1: NaN, 2: NaN });
    });

    it('should return undefined for any triple containing [-1,-1,-1]', () => {
        const triples: [number, number, number][] = [[-1, -1, -1]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({ 0: undefined });
    });

    it('should return NaN for any triple containing non-number', () => {
        const triples: any = [['a', 1, 1], [1, 'a', 1], [1, 1, 'a']];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({ 0: NaN, 1: NaN, 2: NaN });
    });

    it('should return the correct decoding for given inputs', () => {
        const triples: [number, number, number][] = [[1, 2, -1], [2, 3, 0], [3, 4, 2]];
        const keyVocabulary = { key1: 1, key2: 2, key3: 3 };
        const stringVocabulary = { value2: 2 };
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({
            key1: 'value2',
            key2: 3,
            key3: 0.04
        });
    });

    it('should return the correct decoding for input with timestamp', () => {
        const obj = {
            timestamp: 1672531200000
        };
        const { triples, keyVocabulary, stringVocabulary } = encodeObject(obj);
        const result = decodeObject(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual({
            timestamp: 1672531200000
        });
    })
});

describe('decodeObjectMap', () => {
    it('should return [[undefined, NaN]] for any triple containing null', () => {
        const triples: any = [[null, 1, 1], [1, null, 1], [1, 1, null]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[undefined, NaN], [undefined, NaN], [undefined, NaN]]);
    });

    it('should return [[null, null]] for any triple containing [-1,-1,-1]', () => {
        const triples: [number, number, number][] = [[-1, -1, -1]];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[null, null]]);
    });

    it('should return [[undefined, NaN]] for any triple containing non-number', () => {
        const triples: any = [['a', 1, 1], [1, 'a', 1], [1, 1, 'a']];
        const keyVocabulary = { key1: 1 };
        const stringVocabulary = { value1: 0 };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([[undefined, NaN], [undefined, NaN], [undefined, NaN]]);
    });

    it('should return the correct decoding for given inputs', () => {
        const triples: [number, number, number][] = [[1, 2, -1], [2, 3, 0], [3, 4, 2]];
        const keyVocabulary = { key1: 1, key2: 2, key3: 3 };
        const stringVocabulary = { value2: 2 };
        const result = decodeObjectMap(triples, keyVocabulary, stringVocabulary);
        expect(result).toEqual([
            ['key1', 'value2'],
            ['key2', 3],
            ['key3', 0.04]
        ]);
    });
});