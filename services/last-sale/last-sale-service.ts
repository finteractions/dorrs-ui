import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ILastSale} from "@/interfaces/i-last-sale";

class LastSaleService extends BaseService {

    private PATH = 'last_sale/';

    constructor() {
        super();
    }

    public async getLastSaleReporting(): Promise<Array<ILastSale>> {
        return (await apiWebBackendService.get<IResponse<Array<ILastSale>>>(`${this.PATH}reporting/`, {}, this.getUserAccessToken())).data;
    }

    public async createLastSaleReport(data: any): Promise<Array<ILastSale>> {
        return (await apiWebBackendService.post<IResponse<Array<ILastSale>>>(`${this.PATH}reporting/`, data, {}, this.getUserAccessToken())).data
    }

    public updateLastSaleReport(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}reporting/${id}/`, data, {}, this.getUserAccessToken());
    }
}

const lastSaleService = new LastSaleService();

export default lastSaleService;

