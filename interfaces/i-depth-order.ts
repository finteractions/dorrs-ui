import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IDepthOrder {
    symbol_name: string;
    bid_mpid: string;
    bid_quantity: string;
    bid_price: string;
    bid_updated_at: string;
    offer_mpid: string;
    offer_quantity: string;
    offer_price: string;
    offer_updated_at: string;
    company_profile?: ICompanyProfile
}
