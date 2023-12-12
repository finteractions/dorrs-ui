export interface IInvoice {
    total_value: number;
    date: string;
    status: string;
    status_name?: string;
    services: Array<IInvoiceService>,
    user_id?: string
    user_name?: string
    firm_name?: string
    customer_type?: string
    count?: number;
    invoice_id: string,
    reference_number: string,
    approved_by: string,
    approved_date_time: string,
    created_at?: string;
    updated_at?: string;
}

export interface IInvoiceService {
    key: string;
    name: string;
    value: number;
    period_type: string;
}
