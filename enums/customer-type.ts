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

export const getCustomerTypeImage = (accountType: CustomerType): string => {
    return CustomerTypeImages[accountType] || '/img/account-type-1.png';
};

export const getCustomerTypeName = <T extends CustomerType>(customerType: T): string => {
    return CustomerTypeNames[customerType] || '';
};
