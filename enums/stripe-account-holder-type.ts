export enum StripeAccountHolderType {
    INDIVIDUAL = 'individual',
    COMPANY = 'company',
}

export const StripeAccountHolderTypeNames = {
    [StripeAccountHolderType.INDIVIDUAL]: 'Individual',
    [StripeAccountHolderType.COMPANY]: 'Company',
};

export const getStripeAccountHolderTypeName = <T extends StripeAccountHolderType>(accountHolderType: T): string => {
    return StripeAccountHolderTypeNames[accountHolderType] || '';
};
