export interface Currency {
 code: string;
 name: string;
}

export interface CurrencyMap {
 [s: string]: Currency;
}

export const CURRENCY_MAP: CurrencyMap = {
 USD: {
  code: "USD",
  name: "United States dollar"
 },
 EUR: {
  code: "EUR",
  name: "Euro"
 }
};

export const CURRENCIES = Object.keys(CURRENCY_MAP).map(code => CURRENCY_MAP[code]);
