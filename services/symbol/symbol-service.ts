import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";

class SymbolService extends BaseService {

    private PATH = 'asset/';

    constructor() {
        super();
    }

    public async getSymbols(): Promise<Array<ISymbol>> {
        return (await apiWebBackendService.get<IResponse<Array<ISymbol>>>(`${this.PATH}user_assets/`, {}, this.getUserAccessToken())).data;
    }

    public createSymbol(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}user_assets/`, data, {}, this.getUserAccessToken())
    }

    public updateSymbol(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}user_assets/${id}/`, data, {}, this.getUserAccessToken());
    }

}

const symbolService = new SymbolService();

export default symbolService;

