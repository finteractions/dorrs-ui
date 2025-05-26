import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ForgeGlobalCompany} from "@/interfaces/i-forge-global-company";

class ForgeGlobalService extends BaseService {

    private PATH = 'forge-global/';

    constructor() {
        super();
    }

    public async getSymbol(id: number): Promise<Array<ForgeGlobalCompany>> {
        return (await apiWebBackendService.put<IResponse<Array<ForgeGlobalCompany>>>(`${this.PATH}symbol/${id}/`, {}, {}, this.getUserAccessToken())).data;
    }
}

const forgeGlobalService = new ForgeGlobalService();

export default forgeGlobalService;

