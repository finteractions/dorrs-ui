import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";

class PublicDirectoryService extends BaseService {

    private PATH = 'directory/';

    constructor() {
        super();
    }

    public async getCompanyProfile(): Promise<Array<IDirectoryCompanyProfile>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDirectoryCompanyProfile>>>(`${this.PATH}profile/`, {})).data;

        return new Promise(resolve => {
            resolve(
                [
                    {
                        id: 5,
                        first_last_name: 'Dev Dev',
                        email: 'dev@dorrs.io',
                        mobile_number: '+19299992733',
                        company_name: 'Atlas ATS Global',
                        company_type_name: 'Private Company',
                        company_title: 'Test',
                        protocol_name: 'Test 1',
                        founding_date: '2020-08-15',
                        logo: '/media/company_profile_logo/modern-atlas-logo-vector-46403983.jpg',
                        asset_class: ['Real Estate'],
                        asset_region: ['Asia Pacific', 'Europe'],
                        website_link: 'https://google.com',
                        network: ['Ethereum'],
                        status: 'Unclaimed',
                        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    },
                    {
                        id: 6,
                        first_last_name: 'Dev Dev',
                        email: 'dev@dorrs.io',
                        mobile_number: '+19299992733',
                        company_name: 'Test Company',
                        company_type_name: 'Private Company',
                        company_title: 'Test',
                        protocol_name: 'Test 1',
                        founding_date: '2020-08-15',
                        logo: '',
                        asset_class: ['Private Equity'],
                        asset_region: ['Europe'],
                        website_link: 'https://google.com',
                        network: ['Algorand', 'Algorand', 'Polygon'],
                        status: 'Claimed',
                        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
                    },

                ] as any
            )
        })
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

