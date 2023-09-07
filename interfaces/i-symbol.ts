export interface ISymbol {
    id: number;
    name: string;
    code: string;
    network: string;
    currency_type: string;
    fee: number;
    last_price: number;
    active: boolean;
    image: string;
    status: string;
    comment: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
}
