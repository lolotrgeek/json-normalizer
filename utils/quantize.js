export function quantize(decimalString, precision) {
    const decimal = parseFloat(decimalString);
    return Math.round(decimal * Math.pow(10, precision));
}

export function unquantize(integer, precision) {
    return integer / Math.pow(10, precision);
}
