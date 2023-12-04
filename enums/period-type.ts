export enum PeriodType {
    ACTION = 'action',
    DAY = 'day',
    WEEk = 'week',
    MONTH = 'month',
    QUARTER = 'quarter',
    HALF_YEAR = 'half-year',
    ANNUAL = 'annual',
}

export const PeriodTypeNames = {
    [PeriodType.ACTION]: 'Action',
    [PeriodType.DAY]: 'Day',
    [PeriodType.WEEk]: 'Week',
    [PeriodType.MONTH]: 'Month',
    [PeriodType.QUARTER]: 'Quarter',
    [PeriodType.HALF_YEAR]: 'Half-Year',
    [PeriodType.ANNUAL]: 'Annual',
};

export const getPeriodTypeNameNames = <T extends PeriodType>(period_type: T): string => {
    return PeriodTypeNames[period_type] || '';
};
