import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";

class ClientService extends BaseService {

    private PATH = 'client/';

    constructor() {
        super();
    }

    public getUserForms(): Promise<any> {
        // return apiWebBackendService.get(`${this.PATH}forms/`)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(new Array<IForm<any>>({
                    name: "Membership",
                    data: {
                        "region": "US",
                        "state": "CA",
                        "is_finra": true,
                        "crd": "123412341234",
                        "company_name": "country",
                        "email": "dannmixon@gmail.com",
                        "mobile_number": "+380500000000",
                        "address1": "addr1",
                        "address2": "addr2",
                        "city": "New York",
                        "zip_code": "12343",
                        "country": "AM",
                        "mpid": "1111111",
                        "annual_fees": "Level B"
                    },
                    status: 'Rejected'
                }))
            }, 1000)
        })
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

