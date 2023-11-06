export enum AccountType {
    USER_PORTAL = 'User Portal',
    DORRS_MEMBER = 'DORRS Member',
    DORRS_ADMIN = 'DORRS Admin'
}

export const AccountTypeImages = {
    [AccountType.USER_PORTAL]: '/img/account-type-1.png',
    [AccountType.DORRS_MEMBER]: '/img/account-type-3.png',
    [AccountType.DORRS_ADMIN]: '/img/account-type-1.png',
};

export const AccountTypeDescriptions = {
    [AccountType.USER_PORTAL]: 'Portal only',
    [AccountType.DORRS_MEMBER]: 'Portal only',
    [AccountType.DORRS_ADMIN]: 'Portal and Admin Zone',
};

export const getAccountTypeImage = (accountType: AccountType): string => {
    return AccountTypeImages[accountType] || '/img/account-type-1.png';
};

export const getAccountTypeDescription = <T extends AccountType>(accountType: T): string => {
    return AccountTypeDescriptions[accountType] || '';
};
