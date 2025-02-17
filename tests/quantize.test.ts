/* eslint-disable no-undef */
import { quantize, unquantize } from '../utils/quantize';

describe('quantize', () => {
    it('should quantize a decimal string into an integer based on a given precision', () => {
        expect(quantize('0.1234', 2)).toBe(12);
        expect(quantize('0.5678', 3)).toBe(568);
        expect(quantize(0.5678, 3)).toBe(568);
        expect(quantize('0.9999', 1)).toBe(10);
        expect(quantize(10, 0)).toBe(10);
        expect(quantize('0.9999', 0)).toBe(1);
        expect(quantize(0.005256529595356732, 18)).toBe(5256529595356732);
    });
});

describe('unquantize', () => {
    it('should unquantize an integer into a decimal based on a given precision', () => {
        expect(unquantize(12, 2)).toBe(0.12);
        expect(unquantize(568, 3)).toBe(0.568);
        expect(unquantize(10, 2)).toBe(0.1);
        expect(unquantize(1, 1)).toBe(0.1);
        expect(unquantize(5256529595356732, 18)).toBe(0.005256529595356732);
    });
});