import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {IIndicator} from "@/interfaces/i-indicator";

class StatisticsService extends BaseService {

    private PATH = 'statistics/';

    constructor() {
        super();
    }

    public async getIndicators(): Promise<Array<IIndicator>> {
        return (await apiWebBackendService.get<IResponse<Array<IIndicator>>>(`${this.PATH}indicators/`, {}, this.getUserAccessToken())).data;
    }

}

const symbolService = new StatisticsService();

export default symbolService;

