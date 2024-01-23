import {format} from 'date-fns';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUp, faArrowDown, faArrowsV} from "@fortawesome/free-solid-svg-icons";
import React from "react";

function numberFormat(
    number: number | undefined,
    minimumFractionDigits = 2,
    maximumFractionDigits = 8,
    locale = 'en-US'): string {

    if (number === undefined || number === null) {
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

function formatAndColorNumberValueHTML(input: string | number) {
    let sign = '';
    let formattedNumber = '';
    let className = '';

    const numberValue = Number(input);
    const isPositive = numberValue > 0;
    const isNegative = numberValue < 0;

    if (isPositive) {
        sign = '+';
        formattedNumber = formatterService.numberFormat(numberValue);
        className = 'up';
    } else if (isNegative) {
        sign = '-';
        formattedNumber = formatterService.numberFormat(Math.abs(numberValue));
        className = 'down';
    } else {
        sign = ''
        formattedNumber = formatterService.numberFormat(numberValue);
        className = 'stay';
    }

    return (<span className={className}><span className={'sign'}>{sign}</span>{formattedNumber}</span>);
}

function formatAndColorNumberBlockTML(input: string | number) {
    let formattedNumber = '';
    let icon: any = '';
    let className = '';

    const numberValue = Number(input);
    const isPositive = numberValue > 0;
    const isNegative = numberValue < 0;

    if (isPositive) {
        formattedNumber = formatterService.numberFormat(numberValue);
        icon = <FontAwesomeIcon className="nav-icon" icon={faArrowUp}/>
        className = 'up bg-up';
    } else if (isNegative) {
        formattedNumber = formatterService.numberFormat(Math.abs(numberValue));
        icon = <FontAwesomeIcon className="nav-icon" icon={faArrowDown}/>
        className = 'down bg-down';
    } else {
        formattedNumber = formatterService.numberFormat(numberValue);
        icon = <FontAwesomeIcon className="nav-icon" icon={faArrowsV}/>
        className = 'stay bg-stay';
    }

    return (
        <span className={className}>
            <span className={'sign'}>{icon}</span> <span>{formattedNumber}%</span>
        </span>
    );
}

const formatterService = {
    numberFormat,
    dateTimeFormat,
    numberDown,
    getDecimalPlaceholder,
    formatAndColorNumberValueHTML,
    formatAndColorNumberBlockTML
}

export default formatterService;
