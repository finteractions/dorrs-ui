import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IUserAssetData} from "@/interfaces/i-user-asset-data";

class CryptoService extends BaseService {

    private PATH = 'crypto/';

    constructor() {
        super();
    }

    public async addUserAssets(data: any): Promise<boolean> {
        const request = await apiWebBackendService.post<IResponseApi>(`${this.PATH}user_assets/`, data, {}, this.getUserAccessToken());
        return request.message.toLowerCase() == 'success';
    }

    public async getUserAssets(): Promise<IUserAssetData> {
        return (await apiWebBackendService.get<IResponse<IUserAssetData>>(`${this.PATH}user_assets/`, {}, this.getUserAccessToken())).data;
    }

}

const cryptoService = new CryptoService();

export default cryptoService;
