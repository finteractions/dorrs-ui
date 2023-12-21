export interface IPayment {
    amount: number;
    date: string;
    status: string;
    status_name?: string;
    user_id?: string
    user_name?: string
    firm_name?: string
    customer_type?: string
    number?: string;
    invoice_id: string,
    reference_number: string,
    approved_by: string,
    approved_date_time: string,
    created_at?: string;
    updated_at?: string;
}
