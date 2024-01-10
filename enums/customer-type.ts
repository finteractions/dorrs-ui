export enum CustomerType {
    NONPROFESSIONAL = 'nonprofessional',
    PROFESSIONAL = 'professional',
}

export const CustomerTypeImages = {
    [CustomerType.NONPROFESSIONAL]: '/img/account-type-1.png',
    [CustomerType.PROFESSIONAL]: '/img/account-type-3.png',
};

export const CustomerTypeNames = {
    [CustomerType.NONPROFESSIONAL]: 'Nonprofessional',
    [CustomerType.PROFESSIONAL]: 'Professional',
};

export const CustomerTypeDescriptions = {
    [CustomerType.NONPROFESSIONAL]: 'A non-professional user is an individual who uses market data for personal or non-commercial purposes. They may include individual investors or traders who are not working in the financial industry or using the data for professional or business-related activities.',
    [CustomerType.PROFESSIONAL]: 'A professional user is typically someone who uses market data for commercial, business, or professional purposes. This category may encompass financial institutions, investment firms, hedge funds, financial analysts, and professionals who rely on market data for trading, investment analysis, or other financial activities as part of their job or business.',
};

export const getCustomerTypeImage = (accountType: CustomerType): string => {
    return CustomerTypeImages[accountType] || '/img/account-type-1.png';
};

export const getCustomerTypeName = <T extends CustomerType>(customerType: T): string => {
    return CustomerTypeNames[customerType] || '';
};

export const getCustomerTypeDescription = <T extends CustomerType>(customerType: T): string => {
    return CustomerTypeDescriptions[customerType] || '';
};
