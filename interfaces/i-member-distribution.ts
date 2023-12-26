import {IPayment} from "@/interfaces/i-payment";

export interface IMemberDistribution {
    id: number,
    invoice_id: string,
    firm_name: string;
    date: string;
    date_formatted: string;
    due_amount: number;
    status: string;
    status_name?: string;
    payments: Array<IPayment>
    updated_at: string;
}
