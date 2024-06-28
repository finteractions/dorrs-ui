import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IMarketStatistics {
    id: number;
    symbol_name: string;
    fractional_lot_size: string,
    latest_update?: string;
    company_profile?: ICompanyProfile,
    digital_asset_category: string;
}
