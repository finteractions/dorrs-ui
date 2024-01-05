import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";

class StripeService extends BaseService {

    private PATH = 'payments/';

    constructor() {
        super();
    }

    public async getCardInfo(): Promise<IStripeCardInfo[]> {
        return (await apiWebBackendService.get<IResponse<IStripeCardInfo[]>>(`${this.PATH}stripe/card/`, {}, this.getUserAccessToken())).data;
    }

    public async addCard(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}stripe/card/`, data, {}, this.getUserAccessToken())).data;
    }

    public async pay(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}stripe/pay/`, data, {}, this.getUserAccessToken())).data;
    }

}

const stripeService = new StripeService();

export default stripeService;
