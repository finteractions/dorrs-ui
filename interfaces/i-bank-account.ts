interface IBankAccount {
    id: number;
    currency: string;
    beneficiary_name: string;
    account_number: string;
    iban: string;
    swift: string;
    bank_name: string;
    bank_address: string;
    is_approved: boolean;
    approved_by: string;
    status: string;
}
