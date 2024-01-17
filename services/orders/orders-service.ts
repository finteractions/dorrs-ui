import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IOrder} from "@/interfaces/i-order";
import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IDepthByPrice} from "@/interfaces/i-depth-by-price";


class OrdersService extends BaseService {

    private PATH = 'orders/';

    constructor() {
        super();
    }

    public async getOrders(): Promise<IOrder[]> {
        return (await apiWebBackendService.get<IResponse<IOrder[]>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }

    public async downloadOrders(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_orders/`, data, {}, this.getUserAccessToken()));
    }

    public async placeOrder(data: any): Promise<IOrder[]> {
        return (await apiWebBackendService.post<IResponse<IOrder[]>>(`${this.PATH}place/`, data, {}, this.getUserAccessToken())).data;
    }

    public async getDepthByOrder(symbol: string): Promise<Array<IDepthByOrder>> {
        return (await apiWebBackendService.get<IResponse<Array<IDepthByOrder>>>(`${this.PATH}depth_by_order/?symbol=${symbol}`, {}, this.getUserAccessToken())).data;
    }

    public async getDepthByPrice(symbol: string): Promise<Array<IDepthByPrice>> {
        return (await apiWebBackendService.get<IResponse<Array<IDepthByPrice>>>(`${this.PATH}depth_by_price/?symbol=${symbol}`, {}, this.getUserAccessToken())).data;
    }


}

const ordersService = new OrdersService();

export default ordersService;
