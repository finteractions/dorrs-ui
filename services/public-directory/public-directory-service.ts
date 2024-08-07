import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";

class PublicDirectoryService extends BaseService {

    private PATH = 'directory/';

    constructor() {
        super();
    }

    public async getCompanyProfile(): Promise<Array<IDirectoryCompanyProfile>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDirectoryCompanyProfile>>>(`${this.PATH}company_profile/`, {})).data;

        return new Promise(resolve => {
            resolve(
                [
                    {
                        name: 'Atlas ATS Global',
                        logo: '/media/company_profile_logo/modern-atlas-logo-vector-46403983.jpg',
                        asset_class: ['Private Equity', 'Real Estate'],
                        asset_region: ['Asia Pacific', 'Europe'],
                        website_link: 'https://google.com',
                        network: ['Ethereum', 'Algorand'],
                        status: 'Unclaimed',
                        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    },
                    {
                        name: 'Test Firm ',
                        logo: '/media/company_profile_logo/modern-atlas-logo-vector-46403983.jpg',
                        asset_class: ['Private Equity', 'Real Estate'],
                        asset_region: ['Asia Pacific', 'Europe'],
                        website_link: 'https://google.com',
                        network: ['Ethereum', 'Algorand'],
                        status: 'Live',
                        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    }
                ] as any
            )
        })
    }

    public createCompanyProfile(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}company_profile/`, data, {})
    }

    public updateCompanyProfile(data: any, id: number): Promise<any> {
        return apiWebBackendService.put(`${this.PATH}company_profile/${id}/`, data, {});
    }


}

const publicDirectoryService = new PublicDirectoryService();

export default publicDirectoryService;

