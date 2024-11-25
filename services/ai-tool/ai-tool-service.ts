import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

class AIToolService extends BaseService {

    private PATH = 'ai/';

    constructor() {
        super();
    }

    public aiGenerateCompanyProfile(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}company_profile/`, data, {}, this.getUserAccessToken())
    }

}

const symbolService = new AIToolService();

export default symbolService;

