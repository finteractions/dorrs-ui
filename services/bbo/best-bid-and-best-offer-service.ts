import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";

class BestBidAndBestOfferService extends BaseService {

    private PATH = 'bbo/';

    constructor() {
        super();
    }

    public async getBestBidAndBestOffer(): Promise<Array<IBestBidAndBestOffer>> {
        return (await apiWebBackendService.get<IResponse<Array<IBestBidAndBestOffer>>>(`${this.PATH}reporting/`, {}, this.getUserAccessToken())).data;
    }


    public async createBestBidAndBestOffer(data: any): Promise<Array<IBestBidAndBestOffer>> {
        return (await apiWebBackendService.post<IResponse<Array<IBestBidAndBestOffer>>>(`${this.PATH}reporting/`, data, {}, this.getUserAccessToken())).data
    }

    public updateBestBidAndBestOffer(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}reporting/${id}/`, data, {}, this.getUserAccessToken());
    }

    public async getBestBidAndBestOfferBySymbol(symbol: string): Promise<Array<IBestBidAndBestOffer>> {
        return (await apiWebBackendService.get<IResponse<Array<IBestBidAndBestOffer>>>(`${this.PATH}reporting/?symbol=${symbol}`, {}, this.getUserAccessToken())).data;
    }

    public async getBestBidAndBestOfferChartBySymbol(symbol: string, type: string): Promise<Array<ITradingView>> {
        return (await apiWebBackendService.get<IResponse<Array<ITradingView>>>(`${this.PATH}chart/?symbol=${symbol}&type=${type}`, {}, this.getUserAccessToken())).data;
    }

    public async downloadBestBidAndBestOffer(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_bbo/`, data, {}, this.getUserAccessToken()));
    }

    public async downloadBestBidAndBestOfferBySymbol(symbol: string, data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_bbo/?symbol=${symbol}`, data, {}, this.getUserAccessToken()));
    }
}

const bestBidAndBestOfferService = new BestBidAndBestOfferService();

export default bestBidAndBestOfferService;

