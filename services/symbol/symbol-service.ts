import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

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

    public async getCompanyProfile(): Promise<Array<ICompanyProfile>> {
        return (await apiWebBackendService.get<IResponse<Array<ICompanyProfile>>>(`${this.PATH}company_profile/`, {}, this.getUserAccessToken())).data;
    }

    public createCompanyProfile(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}company_profile/`, data, {}, this.getUserAccessToken())
    }

    public updateCompanyProfile(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}company_profile/${id}/`, data, {}, this.getUserAccessToken());
    }

    public async downloadSymbols(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_symbols/`, data, {}, this.getUserAccessToken()));
    }

}

const symbolService = new SymbolService();

export default symbolService;

