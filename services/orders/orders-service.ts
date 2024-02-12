import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IOrder} from "@/interfaces/i-order";
import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IDepthByPrice} from "@/interfaces/i-depth-by-price";
import {IDepthOrder} from "@/interfaces/i-depth-order";


class OrdersService extends BaseService {

    private PATH = 'orders/';

    constructor() {
        super();
    }

    public async getOrders(): Promise<IDepthOrder[]> {
        return (await apiWebBackendService.get<IResponse<IDepthOrder[]>>(`${this.PATH}reporting/`, {}, this.getUserAccessToken())).data;
    }

    public async getOrderHistory(symbol?: string | null, status?: string | null, limit?: number | null): Promise<IOrder[]> {
        let queryString = "";
        if (symbol) {
            queryString += `?symbol=${symbol}`;
        }
        if (status) {
            queryString += `${queryString ? '&' : '?'}status=${status}`;
        }
        if (limit) {
            queryString += `${queryString ? '&' : '?'}limit=${limit}`;
        }
        return (await apiWebBackendService.get<IResponse<IOrder[]>>(`${this.PATH}history/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async downloadOrders(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_orders/`, data, {}, this.getUserAccessToken()));
    }

    public async placeOrder(data: any): Promise<IOrder[]> {
        return (await apiWebBackendService.post<IResponse<IOrder[]>>(`${this.PATH}place/`, data, {}, this.getUserAccessToken())).data;
    }

    public async deleteOrder(ref_id: string): Promise<any> {
        return (await apiWebBackendService.delete<IResponse<any>>(`${this.PATH}place/${ref_id}/`, {}, {}, this.getUserAccessToken())).data;
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
