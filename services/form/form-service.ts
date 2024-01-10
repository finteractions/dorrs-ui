import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";

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


}

const formService = new FormService();

export default formService;

