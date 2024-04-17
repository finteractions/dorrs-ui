import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IOrder {
    id: number;
    origin: string;
    action?: string;
    symbol_name: string;
    symbol: string;
    quote_condition: string;
    mpid: string;
    side: string;
    quantity: string;
    price: string;
    date: string;
    time: string;
    uti: string;
    ref_id: string;
    status: string;
    fractional_lot_size: string;
    status_name?: string;
    created_at: string;
    updated_at: string;
    user_name?: string;
    user_id?: string;
    company_profile?: ICompanyProfile;
    data_feed_provider_logo: string;
}
