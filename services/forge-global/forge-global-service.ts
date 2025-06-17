import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IForgeGlobalCompany} from "@/interfaces/i-forge-global-company";
import {IForgeGlobalLastSale} from "@/interfaces/i-forge-global-last-sale";

class ForgeGlobalService extends BaseService {

    private PATH = 'forge-global/';

    constructor() {
        super();
    }

    public async getSymbol(id: number): Promise<Array<IForgeGlobalCompany>> {
        return (await apiWebBackendService.put<IResponse<Array<IForgeGlobalCompany>>>(`${this.PATH}symbol/${id}/`, {}, {}, this.getAdminToken())).data;
    }

    public async getLastSale(id?: number): Promise<Array<IForgeGlobalLastSale>> {
        let params = {limit: 1000} as any
        if (id) {
            params.id = id
        }
        return (await apiWebBackendService.get<IResponse<Array<IForgeGlobalLastSale>>>(`${this.PATH}last_sale/`, params, this.getAdminToken())).results;
    }

    public async approveLastSales(id: number, is_approved: boolean): Promise<IResponseApi> {
        const data = {
            status: is_approved ? 'approved' : 'rejected',
            is_approval: true
        }

        return (await apiWebBackendService.put<IResponseApi>(`${this.PATH}last_sale/${id}/`, data, {}, this.getAdminToken()));
    }

}

const forgeGlobalService = new ForgeGlobalService();

export default forgeGlobalService;

