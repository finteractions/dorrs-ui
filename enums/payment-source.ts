export enum PaymentSource {
    wire = 'wire',
    card = 'card',
    us_bank_account = 'us_bank_account',
}

export const PaymentSourceDescriptions = {
    [PaymentSource.wire]: 'WIRE',
    [PaymentSource.card]: 'Credit/Debit Card',
    [PaymentSource.us_bank_account]: 'Bank Account (ACH)',
};
export const getPaymentSourceName = <T extends PaymentSource>(source: T): string => {
    return PaymentSourceDescriptions[source] || '';
}
