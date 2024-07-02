import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IIndicator} from "@/interfaces/i-indicator";
import {ILastSale} from "@/interfaces/i-last-sale";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";

class StatisticsService extends BaseService {

    private PATH = 'statistics/';

    constructor() {
        super();
    }

    public async getIndicators(): Promise<Array<IIndicator>> {
        return (await apiWebBackendService.get<IResponse<Array<IIndicator>>>(`${this.PATH}indicators/`, {}, this.getUserAccessToken())).data;
    }

    // IMarketLastSaleStatistics or IMarketBestBidAndBestOfferStatistics
    public async getMarketData<T>(type: string): Promise<Array<T>> {
        let queryString = `?type=${type}`;
        return (await apiWebBackendService.get<IResponse<Array<T>>>(`${this.PATH}market/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async getLastSaleBySymbol(symbol: string): Promise<Array<ILastSale>> {
        let queryString = `?symbol=${symbol}`;

        const url = `${this.PATH}last_sale/${queryString}`;
        return (await apiWebBackendService.get<IResponse<Array<ILastSale>>>(url, {}, this.getUserAccessToken())).data;
    }

    public async getBestBidAndBestOfferBySymbol(symbol: string): Promise<Array<IBestBidAndBestOffer>> {
        let queryString = `symbol=${symbol}`;

        return (await apiWebBackendService.get<IResponse<Array<IBestBidAndBestOffer>>>(`${this.PATH}best_bid_and_best_offer/?${queryString}`, {}, this.getUserAccessToken())).data;
    }

}

const symbolService = new StatisticsService();

export default symbolService;

