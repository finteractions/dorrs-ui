export enum InvoiceStatus {
    OPEN = 'open',
    PAYMENT_DUE = 'payment-due',

}

export const InvoiceStatusNames = {
    [InvoiceStatus.OPEN]: 'Open',
    [InvoiceStatus.PAYMENT_DUE]: 'Payment Due',
};

export const getInvoiceStatusNames = <T extends InvoiceStatus>(status: T): string => {
    return InvoiceStatusNames[status] || '';
};
