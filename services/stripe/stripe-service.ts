import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import {IStripeACHInfo} from "@/interfaces/i-stripe-ach-info";

class StripeService extends BaseService {

    private PATH = 'payments/';

    constructor() {
        super();
    }

    // Card
    public async getCardList(): Promise<IStripeCardInfo[]> {
        return (await apiWebBackendService.get<IResponse<IStripeCardInfo[]>>(`${this.PATH}stripe/card/`, {}, this.getUserAccessToken())).data;
    }

    public async addCard(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}stripe/card/`, data, {}, this.getUserAccessToken())).data;
    }

    public async deleteCard(pm_id: string): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}stripe/card/${pm_id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    public async defaultCard(pm_id: string): Promise<any> {
        return (await apiWebBackendService.put<IResponse<any>>(`${this.PATH}stripe/card/${pm_id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    // **************************

    // ACH
    public async getACHList(): Promise<IStripeACHInfo[]> {
        return (await apiWebBackendService.get<IResponse<IStripeACHInfo[]>>(`${this.PATH}stripe/ach/`, {}, this.getUserAccessToken())).data;
    }

    public async addACH(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}stripe/ach/`, data, {}, this.getUserAccessToken())).data;
    }

    public async deleteACH(pm_id: string): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}stripe/ach/${pm_id}/`, {}, {}, this.getUserAccessToken())).data;
    }

    public async defaultACH(pm_id: string): Promise<any> {
        return (await apiWebBackendService.put<IResponse<any>>(`${this.PATH}stripe/ach/${pm_id}/`, {}, {}, this.getUserAccessToken())).data;
    }


    // **************************


    public async pay(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}stripe/pay/`, data, {}, this.getUserAccessToken())).data;
    }

}

const stripeService = new StripeService();

export default stripeService;
