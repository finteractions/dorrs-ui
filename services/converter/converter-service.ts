function getDecimals(number: number | null | undefined): number {
    if (number === null || number === undefined || number === 0) {
        return 0;
    } else if (number < 1) {
        const decimalPart = number.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
    } else {
        return 0;
    }
}

const converterService = {
    getDecimals
}


export default converterService;
