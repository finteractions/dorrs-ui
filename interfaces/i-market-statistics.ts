import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IMarketStatistics {
    symbol_name: string;
    symbol: string;
    company_profile?: ICompanyProfile,
    last_price: string;
    price_changed: string;
    percentage_changed: string;
}
