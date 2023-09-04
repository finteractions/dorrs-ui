import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";

class ClientService extends BaseService {

    private PATH = 'client/';

    constructor() {
        super();
    }

    public getUserForms(): Promise<any> {
        return apiWebBackendService.get(`${this.PATH}forms/`)
    }

    public createUserForm(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}forms/`, data, {}, this.getUserAccessToken())
    }

    public updateUserForm(data: any, id: number): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}forms/${id}/`, data, {}, this.getUserAccessToken());
    }

}

const clientService = new ClientService();

export default clientService;

