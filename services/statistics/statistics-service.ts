import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IIndicator} from "@/interfaces/i-indicator";
import {IMarketStatistics} from "@/interfaces/i-market-statistics";

class StatisticsService extends BaseService {

    private PATH = 'statistics/';

    constructor() {
        super();
    }

    public async getIndicators(): Promise<Array<IIndicator>> {
        return (await apiWebBackendService.get<IResponse<Array<IIndicator>>>(`${this.PATH}indicators/`, {}, this.getUserAccessToken())).data;
    }

    public async getMarketData(): Promise<Array<IMarketStatistics>> {
        return (await apiWebBackendService.get<IResponse<Array<IMarketStatistics>>>(`${this.PATH}market/`, {}, this.getUserAccessToken())).data;
    }

}

const symbolService = new StatisticsService();

export default symbolService;

