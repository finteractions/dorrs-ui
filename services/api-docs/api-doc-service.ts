import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IDoc} from "@/interfaces/i-doc";


class FeeApiDocService extends BaseService {

    private PATH = 'api_docs/';

    constructor() {
        super();
    }

    public async getDocs(): Promise<Array<IDoc>> {
        return (await apiWebBackendService.get<IResponse<Array<IDoc>>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }

}


const apiDocService = new FeeApiDocService();

export default apiDocService;
