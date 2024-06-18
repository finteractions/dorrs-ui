import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IMarketStatistics {
    symbol_name: string;
    company_profile?: ICompanyProfile,
    last_price: string;
    last_quantity: string;
    price_changed: string;
    percentage_changed: string;
    vwap: string;
    fractional_lot_size: string,
    latest_update?: string;
}
