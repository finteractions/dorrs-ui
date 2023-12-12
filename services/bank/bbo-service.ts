import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IBBO} from "@/interfaces/i-bbo";
import {IBank} from "@/interfaces/i-bank";

class BankService extends BaseService {

    private PATH = 'banks/';

    constructor() {
        super();
    }

    public async getBank(): Promise<Array<IBank>> {
        return (await apiWebBackendService.get<IResponse<Array<IBank>>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }

}

const bankService = new BankService();

export default bankService;

