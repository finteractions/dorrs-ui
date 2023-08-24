import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";

class KYCService extends BaseService {

    private PATH = 'kyc/';

    constructor() {
        super();
    }

    public addResidenceAddress(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}residence_address/`, data, {}, this.getUserAccessToken());
    }

    public createBankAccount(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}bank_account_details/`, data, {}, this.getUserAccessToken());
    }

    public updateBankAccount(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}bank_account_details/${id}/`, data, {}, this.getUserAccessToken());
    }

    public deleteBankAccount(id: number): Promise<IResponseApi> {
        return apiWebBackendService.delete<IResponseApi>(`${this.PATH}bank_account_details/${id}/`, {}, {}, this.getUserAccessToken());
    }

    public async getBankAccounts(): Promise<IBankAccount[]> {
        return (await apiWebBackendService.get<IResponse<IBankAccount[]>>(`${this.PATH}bank_account_details/`, {}, this.getUserAccessToken())).data;
    }

    public addSignDMCCAgreement(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}sign_dmcc_agreement/`, data, {}, this.getUserAccessToken());
    }

}

const kycService = new KYCService();

export default kycService;
