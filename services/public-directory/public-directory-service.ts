import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";

class PublicDirectoryService extends BaseService {

    private PATH = 'directory/';

    constructor() {
        super();
    }

    public async getCompanyProfile(): Promise<Array<IDirectoryCompanyProfile>> {
        return (await apiWebBackendService.get<IResponse<Array<IDirectoryCompanyProfile>>>(`${this.PATH}profile/`, {})).data;
    }

    public createCompanyProfile(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}profile/`, data, {})
    }

    public updateCompanyProfile(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}profile/${id}/`, data, {});
    }


}

const publicDirectoryService = new PublicDirectoryService();

export default publicDirectoryService;

