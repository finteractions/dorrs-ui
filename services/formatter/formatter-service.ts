import {format} from 'date-fns';

function numberFormat(
    number: number | undefined,
    minimumFractionDigits = 2,
    maximumFractionDigits = 8,
    locale = 'en-US'): string {

    if (number === undefined) {
        return '';
    }

    const roundedNumber = numberDown(number, maximumFractionDigits);

    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: maximumFractionDigits,
    }).format(Number(roundedNumber));
}

function numberDown(number: number | string, decimals: number) {
    if (number === undefined) {
        return '';
    }

    const parsedNumber = number.toString().replace(/,/g, '')
    const decimalParts = toPlainString(parsedNumber).split('.');
    if (decimalParts.length === 1) {
        return number.toString();
    }

    return `${decimalParts[0]}.${decimalParts[1].substring(0, decimals)}`;
}

function dateTimeFormat(datetime: string, pattern: string = 'dd/MM/yyyy HH:mm:ss'): string {
    if ([undefined, null, ''].includes(datetime)) return '';
    return format(new Date(datetime), pattern);
}

function getDecimalPlaceholder(decimalScale: number): string {
    if (decimalScale === 0) {
        return '1';
    } else {
        return `0.${'0'.repeat(decimalScale - 1)}1`;
    }
}

function toPlainString(num: string) {
    return ('' + +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
        function (a, b, c, d, e) {
            return e < 0
                ? b + '0.' + Array(1 - e - c.length).join('0') + c + d
                : b + c + d + Array(e - d.length + 1).join('0');
        });
}

const formatterService = {
    numberFormat,
    dateTimeFormat,
    numberDown,
    getDecimalPlaceholder
}

export default formatterService;
