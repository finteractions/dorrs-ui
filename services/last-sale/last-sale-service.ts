import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";

class LastSaleService extends BaseService {

    private PATH = 'last_sale/';

    constructor() {
        super();
    }

    public async getLastSaleReporting(): Promise<Array<ILastSale>> {
        return (await apiWebBackendService.get<IResponse<Array<ILastSale>>>(`${this.PATH}reporting/`, {}, this.getUserAccessToken())).data;
    }

    public async getLastSaleReportingHistory(symbol?: string | null, limit?: number | null): Promise<ILastSale[]> {
        let queryString = "";
        if (symbol) {
            queryString += `?symbol=${symbol}`;
        }

        if (limit) {
            queryString += `${queryString ? '&' : '?'}limit=${limit}`;
        }
        return (await apiWebBackendService.get<IResponse<ILastSale[]>>(`${this.PATH}history/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async createLastSaleReporting(data: any): Promise<Array<ILastSale>> {
        return (await apiWebBackendService.post<IResponse<Array<ILastSale>>>(`${this.PATH}reporting/`, data, {}, this.getUserAccessToken())).data
    }

    public updateLastSaleReporting(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}reporting/${id}/`, data, {}, this.getUserAccessToken());
    }

    public async getLastSaleReportingBySymbol(symbol: string, symbolSuffix: string | undefined): Promise<Array<ILastSale>> {
        let queryString = `symbol=${symbol}`;

        if (symbolSuffix !== null && symbolSuffix !== undefined) {
            queryString += `&symbol_suffix=${symbolSuffix}`;
        }

        const url = `${this.PATH}reporting/?${queryString}`;
        return (await apiWebBackendService.get<IResponse<Array<ILastSale>>>(url, {}, this.getUserAccessToken())).data;
    }

    public async getLastSaleReportingChartBySymbol(symbol: string, symbolSuffix: string | undefined, period: string | undefined): Promise<Array<ITradingView>> {
        let queryString = `symbol=${symbol}`;

        if (symbolSuffix !== null && symbolSuffix !== undefined && symbolSuffix !== '') {
            queryString += `&symbol_suffix=${symbolSuffix}`;
        }

        // if (period !== null && period !== undefined && period !== '') {
        //     queryString += `&period=${period}`;
        // }

        const url = `${this.PATH}chart/?${queryString}`;
        return (await apiWebBackendService.get<IResponse<Array<ITradingView>>>(url, {}, this.getUserAccessToken())).data;
    }

    public async downloadLastSales(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_last_sales/`, data, {}, this.getUserAccessToken()));
    }

    public async downloadLastSalesBySymbol(symbol: string, data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_last_sales/?symbol=${symbol}`, data, {}, this.getUserAccessToken()));
    }
}

const lastSaleService = new LastSaleService();

export default lastSaleService;

