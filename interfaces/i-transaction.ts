export interface ITransaction {
    id: number;
    type: string;
    status: string;
    date_time: string;
    base_price: number;
    base_currency: IAsset;
    quote_price: number;
    quote_currency: IAsset | null;
    transaction_hash: string|null;
    reference_id: string;
    bank_account: string|null;
}
