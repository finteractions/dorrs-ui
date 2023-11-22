import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IReportDate} from "@/interfaces/i-report-date";

import {IReportLastSaleTotalForEachSymbol} from "@/interfaces/i-report-last-sale-total-for-each-symbol";
import {
    IReportNumberOfSymbolAdditionsAndDeletions
} from "@/interfaces/i-report-number-of-symbol-additions-and-deletions";
import {
    IReportLastSaleTotalByAlternativeTradingSystem
} from "@/interfaces/i-report-last-sale-total-by-alternative-trading-system";
import {ILastSale} from "@/interfaces/i-last-sale";

class ReportsService extends BaseService {

    private PATH = 'report/';

    constructor() {
        super();
    }

    public async getDates(): Promise<IReportDate> {
        return (await apiWebBackendService.get<IResponse<IReportDate>>(`${this.PATH}dates/`, {}, this.getUserAccessToken())).data;
    }

    public async getSummary(data: any): Promise<Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions>> {
        return (await apiWebBackendService.post<IResponse<Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions>>>(`${this.PATH}summary/`, data, {}, this.getUserAccessToken())).data;
    }

    public async getDetails(data: any): Promise<Array<ILastSale>> {
        return (await apiWebBackendService.post<IResponse<Array<ILastSale>>>(`${this.PATH}details/`, data, {}, this.getUserAccessToken())).data;

    }

    public async downloadSummaryReport(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_summary_report/`, data, {}, this.getUserAccessToken()));
    }

    public async downloadDetailsReport(data: any): Promise<string> {
        data = Object.keys(data).length ? data : null;
        return (await apiWebBackendService.post<string>(`${this.PATH}download_details_report/`, data, {}, this.getUserAccessToken()));
    }

}


const ordersService = new ReportsService();

export default ordersService;
