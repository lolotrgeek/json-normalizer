export function quantize(decimalString: string | number, precision: number): number {
    const decimal = Number(decimalString);
    return Math.round(decimal * Math.pow(10, precision));
}

export function unquantize(integer: number, precision: number): number {
    return integer / Math.pow(10, precision);
}