import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IFees} from "@/interfaces/i-fees";


class FeesService extends BaseService {

    private PATH = 'fees/';

    constructor() {
        super();
    }

    public async getFees(): Promise<Array<IFees>> {
        return (await apiWebBackendService.get<IResponse<Array<IFees>>>(`${this.PATH}tariffs/`, {}, this.getUserAccessToken())).data;
    }
}


const feesService = new FeesService();

export default feesService;
