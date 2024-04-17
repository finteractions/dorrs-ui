import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface IBestBidAndBestOffer {
    id: number;
    origin: string;
    symbol_name: string;
    symbol: string;
    quote_condition: string;
    bid_mpid: string;
    bid_quantity: string;
    bid_price: string;
    bid_date: string;
    bid_time: string;
    offer_mpid: string;
    offer_quantity: string;
    offer_price: string;
    offer_date: string;
    offer_time: string;
    uti: string;
    fractional_lot_size: string;
    created_at: string;
    updated_at: string;
    user_name?: string;
    user_id?: string;
    company_profile?: ICompanyProfile;
    data_feed_provider_logo: string;
}
