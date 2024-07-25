import {format} from 'date-fns';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown,
    faMinus
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import moment, {Moment} from 'moment';


function numberFormat(
    number: number | undefined,
    decimals = 2,
    locale = 'en-US'): string {

    if (number === undefined || number === null) {
        return '';
    }

    const roundedNumber = numberDown(number, decimals);

    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
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
    if (num) {
        return ('' + +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
            function (a, b, c, d, e) {
                return e < 0
                    ? b + '0.' + Array(1 - e - c.length).join('0') + c + d
                    : b + c + d + Array(e - d.length + 1).join('0');
            });
    } else {
        return '';
    }

}

function formatAndColorNumberValueHTML(input: string | number, decimals = Number(process.env.PRICE_DECIMALS || '2')) {
    let sign = '';
    let formattedNumber = '';
    let className = '';

    const numberValue = Number(input);
    const isPositive = numberValue > 0;
    const isNegative = numberValue < 0;

    if (isPositive) {
        sign = '+';
        formattedNumber = formatterService.numberFormat(numberValue, decimals);
        className = 'up';
    } else if (isNegative) {
        sign = '-';
        formattedNumber = formatterService.numberFormat(Math.abs(numberValue), decimals);
        className = 'down';
    } else {
        sign = ''
        formattedNumber = formatterService.numberFormat(numberValue, decimals);
        className = 'stay';
    }

    return (
        <span>
            <span className={className}><span style={sign == '' ? {width: 10} : {}}
                                              className={'sign'}>{sign}</span><span>{formattedNumber}</span></span>
        </span>
    );
}

function formatAndColorTickIndicationValueHTML(tickIndication: string) {
    let icon: any = '';
    let className = '';

    switch (tickIndication) {
        case 'U':
            icon = <FontAwesomeIcon className="nav-icon" icon={faArrowUp}/>
            className = 'up';
            break;
        case 'D':
            icon = <FontAwesomeIcon className="nav-icon" icon={faArrowDown}/>
            className = 'down';
            break;
        case 'N':
            icon = <FontAwesomeIcon className="nav-icon" icon={faMinus}/>
            className = 'stay';
            break;
    }

    return (
        <span className={'span-flex'}>
            <span className={className}>
                <span className={'sign'}>{icon}</span>
            </span>
        </span>
    );
}

function formatAndColorNumberBlockHTML(input: string | number, percentageSign = true, decimals = 2) {
    let formattedNumber = '';
    let icon: any = '';
    let className = '';

    const numberValue = Number(input);
    const isPositive = numberValue > 0;
    const isNegative = numberValue < 0;

    if (isPositive) {
        formattedNumber = formatterService.numberFormat(numberValue, decimals);
        icon = <FontAwesomeIcon className="nav-icon" icon={faArrowUp}/>
        className = 'up bg-up';
    } else if (isNegative) {
        formattedNumber = formatterService.numberFormat(Math.abs(numberValue));
        icon = <FontAwesomeIcon className="nav-icon" icon={faArrowDown}/>
        className = 'down bg-down';
    } else {
        formattedNumber = formatterService.numberFormat(numberValue);
        icon = <FontAwesomeIcon className="nav-icon" icon={faMinus}/>
        className = 'stay bg-stay';
    }

    return (
        <span className={'span-flex'}>
            <span className={className}>
                <span className={'sign'}>{icon}</span> <span>{formattedNumber}{percentageSign ? '%' : ''}</span>
             </span>
       </span>
    );
}

function getBackgroundColourByValue(input: string | number) {
    const numberValue = Number(input);
    const isPositive = numberValue > 0;
    const isNegative = numberValue < 0;

    if (isPositive) {
        return 'up bg-up';
    } else if (isNegative) {
        return 'down bg-down';
    } else {
        return 'stay bg-stay';
    }
}

function formatDateString(dateString: string) {
    const [monthString, day] = dateString.split(', ');

    const date = new Date(`${monthString} ${day}, ${new Date().getFullYear()}`);

    const dayPadded = String(date.getDate()).padStart(2, '0');
    const monthPadded = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы нумеруются с 0
    const year = date.getFullYear();

    return `${dayPadded}-${monthPadded}-${year}`;
}

function formatSymbolName(symbol: string) {
    return symbol.replace('-', ' / ')
}

function getSymbolName(symbol: string) {
    return symbol.split('-')[0]
}

function getTransactionStatusColour(value: string | null) {
    return value ? 'approved' : 'pending'
}

function getTransactionStatusName(value: string | null) {
    return value ? 'Approved' : 'Pending'
}

function renderMonthElement({month, onMonthSelect, onYearSelect}: {
    month: Moment;
    onMonthSelect: (currentMonth: Moment, newMonth: string) => void;
    onYearSelect: (currentMonth: Moment, newYear: string) => void;
}) {
    return (
        <div style={{display: 'flex', justifyContent: 'center', padding: '0 40px', height: '33px', marginTop: '-5px'}}>
            <div style={{flex: 1}}>
                <select
                    className={'b-select'}
                    style={{
                        fontWeight: '600',
                        border: "none",
                        padding: '0 8px',
                        backgroundPosition: 'right -4px center',
                        backgroundSize: '18px'
                    }}
                    value={month.month()}
                    onChange={(e) => onMonthSelect(month, e.target.value)}
                >
                    {moment.months().map((label, value) => (
                        <option value={value} key={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{flex: 1}}>
                <select
                    className={'b-select'}
                    style={{
                        fontWeight: '600',
                        border: "none",
                        padding: '0 8px',
                        backgroundSize: '18px'
                    }}
                    value={month.year()}
                    onChange={(e) => onYearSelect(month, e.target.value)}
                >
                    {Array.from({length: 100}, (_, i) => moment().year() - 50 + i).map((year) => (
                        <option value={year} key={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}


const formatterService = {
    numberFormat,
    dateTimeFormat,
    numberDown,
    getDecimalPlaceholder,
    formatAndColorNumberValueHTML,
    formatAndColorNumberBlockHTML,
    formatAndColorTickIndicationValueHTML,
    getBackgroundColourByValue,
    toPlainString,
    formatDateString,
    formatSymbolName,
    getSymbolName,
    getTransactionStatusColour,
    getTransactionStatusName,
    renderMonthElement
}

export default formatterService;
