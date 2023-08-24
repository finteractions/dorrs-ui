import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {ITransaction} from "@/interfaces/i-transaction";
import {IExchangePair} from "@/interfaces/i-exchange-pair";
import {IExchangePrice} from "@/interfaces/i-exchange-price";

class OrdersService extends BaseService {

    private PATH = 'orders/';

    constructor() {
        super();
    }

    public async getTransactions(): Promise<ITransaction[]> {
        return (await apiWebBackendService.get<IResponse<ITransaction[]>>(`${this.PATH}transaction_history/`, {}, this.getUserAccessToken())).data;
    }

    public async getWithdrawAddresses(): Promise<Array<IWithdrawAddress>> {
        return (await apiWebBackendService.get<IResponse<Array<IWithdrawAddress>>>(`${this.PATH}withdraw_address/`, {}, this.getUserAccessToken())).data;
    }

    public async createWithdrawAddress(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}withdraw_address/`, data, {}, this.getUserAccessToken())).data;
    }

    public async createWithdrawRequest(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}withdraw_request/`, data, {}, this.getUserAccessToken())).data;
    }

    public async createFiatWithdrawRequest(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}fiat_withdraw_request/`, data, {}, this.getUserAccessToken())).data;
    }

    public async getExchangePairs(): Promise<IExchangePair[]> {
        return (await apiWebBackendService.get<IResponse<IExchangePair[]>>(`${this.PATH}exchange_supporting_pairs/`, {}, this.getUserAccessToken())).data;
    }

    public async createExchange(data: any): Promise<boolean> {
        const request = await apiWebBackendService.post<IResponseApi>(`${this.PATH}exchange/`, data, {}, this.getUserAccessToken());
        return request.message.toLowerCase() == 'success';
    }

    public async getExchangePrice(data: any): Promise<IExchangePrice> {
        return (await apiWebBackendService.post<IResponse<IExchangePrice>>(`${this.PATH}exchange_price/`, data, {}, this.getUserAccessToken())).data;
    }

    public async downloadTransactions(data: any): Promise<string> {
        return (await apiWebBackendService.post<string>(`${this.PATH}download_transaction_history/`, data, {}, this.getUserAccessToken()));
    }

}

const ordersService = new OrdersService();

export default ordersService;
