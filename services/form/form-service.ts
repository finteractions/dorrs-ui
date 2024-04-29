import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";

class FormService extends BaseService {

    private PATH = 'form/';

    constructor() {
        super();
    }

    public async getMembershipForm(): Promise<Array<IMembership>> {
        return (await apiWebBackendService.get<IResponse<Array<IMembership>>>(`${this.PATH}membership/`, {}, this.getUserAccessToken())).data;
    }

    public createMembershipForm(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}membership/`, data, {}, this.getUserAccessToken())
    }

    public updateMembershipForm(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}membership/${id}/`, data, {}, this.getUserAccessToken());
    }

    public createUserPortalForm(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}portal/`, data, {}, this.getUserAccessToken())
    }

    public async searchCompany(company_name: string): Promise<Array<ICompanySearch>> {
        const params = {
            name: company_name
        }
        return (await apiWebBackendService.get<IResponse<Array<ICompanySearch>>>(`/search/firm/`, params, this.getUserAccessToken())).data;
    }

    public async searchMPID(mpid: string): Promise<Array<IMPIDSearch>> {
        const params = {
            mpid: mpid
        }
        return (await apiWebBackendService.get<IResponse<Array<IMPIDSearch>>>(`/search/mpid/`, params, this.getUserAccessToken())).data;
    }

    // **** Edgar CIK Forms *****
    public async getFINRARegA(symbol?: string | null): Promise<IFINRACatRegA[]> {
        let queryString = "";
        if (symbol) {
            queryString += `?symbol=${symbol}`;
        }

        return (await apiWebBackendService.get<IResponse<IFINRACatRegA[]>>(`${this.PATH}finra_reg_a/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async createFINRARegA(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}finra_reg_a/`, data, {}, this.getUserAccessToken())).data
    }

    public async updateFINRARegA(data: any, id: number): Promise<any> {
        return (await apiWebBackendService.put<IResponse<any>>(`${this.PATH}finra_reg_a/${id}/`, data, {}, this.getUserAccessToken())).data
    }

    public async deleteFINRARegA(id: number): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}finra_reg_a/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    public async getSECIssuer(symbol?: string | null): Promise<ISECIssuer[]> {
        let queryString = "";
        if (symbol) {
            queryString += `?symbol=${symbol}`;
        }

        return (await apiWebBackendService.get<IResponse<ISECIssuer[]>>(`${this.PATH}issuer/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async createSECIssuer(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}issuer/`, data, {}, this.getUserAccessToken())).data
    }

    public async updateSECIssuer(data: any, id: number): Promise<any> {
        return (await apiWebBackendService.put<IResponse<any>>(`${this.PATH}issuer/${id}/`, data, {}, this.getUserAccessToken())).data
    }

    public async deleteSECIssuer(id: number): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}issuer/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    // ***************************


}

const formService = new FormService();

export default formService;

