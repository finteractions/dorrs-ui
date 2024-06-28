import {IMarketStatistics} from "@/interfaces/i-market-statistics";

export interface IMarketBestBidAndBestOfferStatistics extends IMarketStatistics {
    bid_price: string | null;
    bid_quantity: string | null;
    offer_quantity: string | null;
    offer_price: string | null;
    algorand_best_bid_and_best_offer_application_id?: string;
}
