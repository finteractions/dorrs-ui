import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IBBO} from "@/interfaces/i-bbo";

class BBOService extends BaseService {

    private PATH = 'bbo/';

    constructor() {
        super();
    }

    public async getBBO(): Promise<Array<IBBO>> {
        return (await apiWebBackendService.get<IResponse<Array<IBBO>>>(`${this.PATH}reporting/`, {}, this.getUserAccessToken())).data;
    }


    public async createBBO(data: any): Promise<Array<IBBO>> {
        return (await apiWebBackendService.post<IResponse<Array<IBBO>>>(`${this.PATH}reporting/`, data, {}, this.getUserAccessToken())).data
    }

    public updateBBO(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}reporting/${id}/`, data, {}, this.getUserAccessToken());
    }

    public async getBBOBySymbol(symbol: string): Promise<Array<IBBO>> {
        return (await apiWebBackendService.get<IResponse<Array<IBBO>>>(`${this.PATH}reporting/?symbol=${symbol}`, {}, this.getUserAccessToken())).data;
    }

    public async getBBOChartBySymbol(symbol: string, type: string): Promise<Array<ITradingView>> {
        return (await apiWebBackendService.get<IResponse<Array<ITradingView>>>(`${this.PATH}chart/?symbol=${symbol}&type=${type}`, {}, this.getUserAccessToken())).data;
    }

    public async downloadBBO(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_bbo/`, data, {}, this.getUserAccessToken()));
    }

    public async downloadBBOBySymbol(symbol: string, data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_bbo/?symbol=${symbol}`, data, {}, this.getUserAccessToken()));
    }
}

const bboService = new BBOService();

export default bboService;

