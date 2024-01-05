import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IFees} from "@/interfaces/i-fees";
import {IInvoice} from "@/interfaces/i-invoice";


class FeesService extends BaseService {

    private PATH = 'fees/';

    constructor() {
        super();
    }

    public async getFees(): Promise<Array<IFees>> {
        return (await apiWebBackendService.get<IResponse<Array<IFees>>>(`${this.PATH}tariffs/`, {}, this.getUserAccessToken())).data;
    }

    public async getDates(): Promise<Array<string>> {
        return (await apiWebBackendService.get<IResponse<Array<string>>>(`${this.PATH}dates/`, {}, this.getUserAccessToken())).data;
    }

    public async getInvoices(params?: {}): Promise<Array<IInvoice>> {
        return (await apiWebBackendService.get<IResponse<Array<IInvoice>>>(`${this.PATH}invoices/`, params, this.getUserAccessToken())).data;
    }
}


const feesService = new FeesService();

export default feesService;
