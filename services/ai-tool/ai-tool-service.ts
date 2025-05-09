import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

class AIToolService extends BaseService {

    private PATH = 'ai/';

    constructor() {
        super();
    }

    public async aiGenerateCompanyProfile(id: number): Promise<Array<ICompanyProfile>> {
        return (await apiWebBackendService.put<IResponse<Array<ICompanyProfile>>>(`${this.PATH}company_profile/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    public async aiGenerateSymbol(id: number): Promise<Array<ISymbol>> {
        return (await apiWebBackendService.put<IResponse<Array<ISymbol>>>(`${this.PATH}symbol/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }
}

const symbolService = new AIToolService();

export default symbolService;

