interface IAdminBankAccount {
    id: number;
    user_id: string;
    approved_by: string|null;
    currency: string|null;
    beneficiary_name: string;
    account_number: string;
    iban: string;
    swift: string;
    bank_name: string|null;
    bank_address: string|null;
    // active: boolean;
    is_approved: boolean;
    approved_date_time: string;
    status: string;
    comment: string;
    deleted: boolean;
}