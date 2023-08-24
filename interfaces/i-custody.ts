export interface ICustody {
    id: number;
    user_id: string;
    approved_by: string|null;
    base_currency: string;
    base_price: number;
    status: string;
    date_time: string;
    type: string;
    quote_price: number;
    transaction_hash: string|null;
    reference_id: string|null;
    from_address: string|null;
    to_address: string|null;
    approved_date_time: string;
    quote_currency: string|null;
    bank_account: number|null;
    comment: string;
    comment_status?: boolean;

}