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

function parseMoney(value: string | null | undefined): number | '' {
    if (!value || value === '--') {
        return '';
    }

    const match = value.match(/^\$?([\d,.]+)([MB]M?)$/i);
    if (!match) return '';

    const numberPart = parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2].toUpperCase();

    switch (suffix) {
        case 'B':
            return numberPart * 1_000_000_000;
        case 'M':
            return numberPart * 1_000_000;
        case 'MM':
            return numberPart * 1_000_000;
        default:
            return '';
    }
}

function parseLocationData(location: string | null | undefined): { city: string | ''; country: string | '' } {
    if (!location || location.trim() === '') {
        return {city: '', country: ''};
    }

    const parts = location.split(',').map(p => p.trim());

    if (parts.length === 0) {
        return {city: '', country: ''};
    }

    const city = parts[0] || '';
    const country = parts[parts.length - 1] || '';

    return {city, country};
}

const converterService = {
    getDecimals,
    parseMoney,
    parseLocationData
}


export default converterService;
