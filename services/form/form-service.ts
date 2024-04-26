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

        return (await apiWebBackendService.get<IResponse<IFINRACatRegA[]>>(`${this.PATH}form_d_submission/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async createFINRARegA(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}form_d_submission/`, data, {}, this.getUserAccessToken())).data
    }

    public async updateFINRARegA(data: any, id: number): Promise<any> {
        return (await apiWebBackendService.put<IResponse<any>>(`${this.PATH}form_d_submission/${id}/`, data, {}, this.getUserAccessToken())).data
    }

    public async deleteFINRARegA(id: number): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}form_d_submission/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    // ***************************


}

const formService = new FormService();

export default formService;

