import {IMarketStatistics} from "@/interfaces/i-market-statistics";

export interface IMarketLastSaleStatistics extends IMarketStatistics{
    last_price: string;
    last_quantity: string;
    price_changed: string;
    percentage_changed: string;
    vwap: string;
    algorand_last_sale_application_id?: string;
}
