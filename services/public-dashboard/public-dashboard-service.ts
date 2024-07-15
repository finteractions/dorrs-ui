import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";

class PublicDashboardService extends BaseService {

    private PATH = 'dashboard/';

    constructor() {
        super();
    }

    public async getTickerData(): Promise<Array<IMarketLastSaleStatistics>> {
        return (await apiWebBackendService.get<IResponse<Array<IMarketLastSaleStatistics>>>(`${this.PATH}ticker/`, {})).data;
    }

    public async getSymbolRegistry(): Promise<Array<IDashboardSymbolRegistry>> {
        return (await apiWebBackendService.get<IResponse<Array<IDashboardSymbolRegistry>>>(`${this.PATH}symbol_registry/`, {})).data;
    }

    public async getCompanyProfile(): Promise<Array<IDashboardCompanyProfile>> {
        return (await apiWebBackendService.get<IResponse<Array<IDashboardCompanyProfile>>>(`${this.PATH}company_profile/`, {})).data;
    }

    public async getMarketData(): Promise<Array<IDashboardMarketDataSummary>> {
        return (await apiWebBackendService.get<IResponse<Array<IDashboardMarketDataSummary>>>(`${this.PATH}market_data_summary/`, {})).data;
    }

    public async getBlockchainData<T>(type?: string): Promise<Array<T>> {
        let queryString = "";
        if (type) {
            queryString += `?type=${type}`;
        }
        return (await apiWebBackendService.get<IResponse<Array<T>>>(`${this.PATH}blockchain_data/${queryString}`, {})).data;
    }

    public async getTOP5<T>(type?: string): Promise<Array<T>> {
        let queryString = "";
        if (type) {
            queryString += `?type=${type}`;
        }
        return (await apiWebBackendService.get<IResponse<Array<any>>>(`${this.PATH}market_data_top/${queryString}`, {})).data;
    }


    public async getHeatMap(): Promise<Array<IDashboardHeatMapAndPerformance>> {
        return (await apiWebBackendService.get<IResponse<Array<IDashboardHeatMapAndPerformance>>>(`${this.PATH}heat_map/`, {})).data;
    }

    public async getHeatMapChart(): Promise<Array<IDashboardHeatMapAndPerformanceChart>> {
        return (await apiWebBackendService.get<IResponse<Array<IDashboardHeatMapAndPerformanceChart>>>(`${this.PATH}heat_map_chart/`, {})).data;
    }
}

const publicDashboardService = new PublicDashboardService();

export default publicDashboardService;

