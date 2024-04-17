import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IDepthOrder {
    symbol_name: string;
    bid_origin: string;
    bid_mpid: string;
    bid_quantity: string;
    bid_price: string;
    bid_updated_at: string;
    bid_data_feed_provider_logo: string
    offer_origin: string;
    offer_mpid: string;
    offer_quantity: string;
    offer_price: string;
    offer_updated_at: string;
    offer_data_feed_provider_logo: string;
    company_profile?: ICompanyProfile
}
