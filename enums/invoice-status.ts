export enum InvoiceStatus {
    OPEN = 'open',
    PAYMENT_DUE = 'payment-due',
    PENDING = 'pending',
    PAYMENT_APPROVED = 'approved',

}

export const InvoiceStatusNames = {
    [InvoiceStatus.OPEN]: 'Open',
    [InvoiceStatus.PAYMENT_DUE]: 'Payment Due',
    [InvoiceStatus.PENDING]: 'Pending',
    [InvoiceStatus.PAYMENT_APPROVED]: 'Approved',
};

export const getInvoiceFormStatus = (): InvoiceStatus[] => {
    return [InvoiceStatus.PAYMENT_DUE, InvoiceStatus.PENDING, InvoiceStatus.PAYMENT_APPROVED];
};

export const getApprovedInvoiceStatus = (): InvoiceStatus[] => {
    return [InvoiceStatus.PAYMENT_APPROVED];
};

export const getInvoiceStatusNames = <T extends InvoiceStatus>(status: T): string => {
    return InvoiceStatusNames[status] || '';
};
