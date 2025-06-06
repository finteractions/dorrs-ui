export enum LogActivitySourceType {
    AUTHENTICATION = 'authentication',
    BBO = 'bbo',
    FIRM = 'firm',
    FORM = 'form',
    LAST_SALE = 'last_sale',
    PAYMENT = 'payment',
    SYMBOL = 'symbol',
    PENDING_SYMBOL = 'pending_symbol',
    USER = 'user',
    DOB = 'dob',
    PROFILE = 'profile',
}

export const LogActivitySourceTypeNames = {
    [LogActivitySourceType.AUTHENTICATION]: 'Authentication',
    [LogActivitySourceType.BBO]: 'Best Bid And Best Offer',
    [LogActivitySourceType.FIRM]: 'Firm',
    [LogActivitySourceType.FORM]: 'Form',
    [LogActivitySourceType.LAST_SALE]: 'Last Sale',
    [LogActivitySourceType.PAYMENT]: 'Payment',
    [LogActivitySourceType.SYMBOL]: 'Symbol',
    [LogActivitySourceType.PENDING_SYMBOL]: 'Pending Symbol',
    [LogActivitySourceType.USER]: 'User',
    [LogActivitySourceType.DOB]: 'Order',
    [LogActivitySourceType.PROFILE]: 'Profile',
};

export const getLogActivitySourceTypeNames = <T extends LogActivitySourceType>(logActivitySourceType: T): string => {
    return LogActivitySourceTypeNames[logActivitySourceType] || '';
};
