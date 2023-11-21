export enum ReportType {
    LAST_SALE_TOTALS_BY_ATS = 'last_sale_totals_by_ats',
    LAST_SALE_TOTALS_FOR_EACH_SYMBOL = 'last_sale_totals_for_each_symbol',
    NUMBER_OF_SYMBOLS_ADDITIONS_AND_DELETIONS = 'number_of_symbols_additions_and_deletions'
}

export const ReportTypeNames = {
    [ReportType.LAST_SALE_TOTALS_BY_ATS]: 'Last Sale Totals by ATS',
    [ReportType.LAST_SALE_TOTALS_FOR_EACH_SYMBOL]: 'Last Sale Totals for Each Symbol',
    [ReportType.NUMBER_OF_SYMBOLS_ADDITIONS_AND_DELETIONS]: 'Number of Symbol Additions and Deletions',
};

export const getReportTypeName = <T extends ReportType>(reportType: T): string => {
    return ReportTypeNames[reportType] || '';
};
