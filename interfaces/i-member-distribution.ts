import {IPayment} from "@/interfaces/i-payment";

export interface IMemberDistribution {
    key: string;
    name: string;
    period_type: string;
    date: string;
    date_formatted: string;
    forecast_amount: number,
    total_amount: number,
    approved_amount: number;
    commission_amount: number;
    due_amount: number;
    updated_at: string;
    status: string;
    status_name: string;
    payments: Array<IPayment>
}
