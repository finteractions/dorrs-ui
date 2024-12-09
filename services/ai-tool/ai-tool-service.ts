import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

class AIToolService extends BaseService {

    private PATH = 'ai/';

    constructor() {
        super();
    }

    public async aiGenerateCompanyProfile(id: number): Promise<Array<ICompanyProfile>> {
        // return (await apiWebBackendService.put<IResponse<Array<ICompanyProfile>>>(`${this.PATH}company_profile/${id}/`, {}, {}, this.getUserAccessToken())).data;
        return new Promise(resolve => {
            resolve([
                {
                    "total_shares_outstanding": "53830000",
                    "initial_offering_date": "2014-07-01",
                    "company_name": "Roadrunner Recycling",
                    "business_description": "Roadrunner Recycling provides innovative waste and recycling solutions for businesses aiming to reduce landfill waste and promote recycling practices.",
                    "last_market_valuation": "300000000",
                    "last_sale_price": "15.30",
                    "street_address_1": "301 Grant Street, Suite 4300",
                    "city": "Pittsburgh",
                    "state": "Pennsylvania",
                    "zip_code": "15219",
                    "country": "United States",
                    "email": "info@roadrunnerwm.com",
                    "phone": "+14125389200",
                    "web_address": "https://www.roadrunnerwm.com",
                    "sic_industry_classification": "4953",
                    "incorporation_information": "Delaware",
                    "number_of_employees": "150",
                    "company_officers_and_contacts": [
                        "Graham Rihn - CEO",
                        "Shane Thompson - CFO"
                    ],
                    "board_of_directors": [
                        "Eric Krasnoff - Chairman",
                        "David Sutherland - Director"
                    ],
                    "product_and_services": "Waste management and recycling services including digital solutions for waste stream optimization.",
                    "company_facilities": "Main office in Pittsburgh with several recycling facilities across the United States.",
                    "transfer_agent": "Computershare",
                    "accounting_auditing_firm": "Deloitte LLP",
                    "investor_relations_marketing_communications": "IR Contact Group",
                    "securities_counsel": "Jones Day",
                    "us_reporting": "Private",
                    "edgar_cik": "",
                    "price_per_share_date": [
                        "2022-09-15"
                    ],
                    "price_per_share_value": [
                        "38.00"
                    ],
                    "logo": "https://logo.clearbit.com/roadrunnerwm.com?size=500&format=png"
                }
            ] as any)
        })
    }

}

const symbolService = new AIToolService();

export default symbolService;

