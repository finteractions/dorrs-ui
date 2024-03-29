import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface ILastSale {
    id: number;
    firm_name: string;
    origin: string;
    symbol_name: string;
    symbol: string;
    symbol_suffix: string;
    condition: string;
    mpid: string;
    tick_indication: string;
    quantity: string;
    price: string;
    time: string;
    date: string;
    uti: string;
    created_at: string;
    updated_at: string;
    user_name?: string;
    user_id?: string;
    company_profile?: ICompanyProfile;
    price_formatted?: string;
    total_volume?: string;
}
