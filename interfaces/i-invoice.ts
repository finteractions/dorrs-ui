export interface IInvoice {
    id:number;
    total_value: number;
    date: string;
    status: string;
    status_name?: string;
    services: Array<IInvoiceService>,
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

export interface IInvoiceService {
    key: string;
    name: string;
    value: number;
    accrual_value: number;
    period_type: string;
    customer_type: string;
    customer_type_name: string;
    date: string;
}
