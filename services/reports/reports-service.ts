import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IReportDate} from "@/interfaces/i-report-date";

import {IReportLastSaleTotalForEachSymbol} from "@/interfaces/i-report-last-sale-total-for-each-symbol";
import {ReportType} from "@/enums/report-type";
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
        // return (await apiWebBackendService.get<IResponse<IReportDate>>(`${this.PATH}dates/`, {}, this.getUserAccessToken())).data;


        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    monthly: [
                        '2023-10-31',
                        '2023-09-30'
                    ],
                    weekly: [
                        '2023-11-17',
                        '2023-11-10'
                    ]
                });
            }, 500);
        });
    }

    public async getSummary(data: any): Promise<Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions>> {
        // return (await apiWebBackendService.post<IResponse<Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions>>>(`${this.PATH}summary/`, data, {}, this.getUserAccessToken())).data;

        const d1 = [
            {
                ats: 'TEST',
                total_number_of_transactions: '50',
                total_number_of_quantity: '100',
                total_number_of_dollar_value: '2000',
                last_updated: '2023-17-11'
            }
        ];

        const d2 = [
            {
                symbol: 'TEST',
                total_number_of_transactions: '50',
                total_number_of_quantity: '100',
                total_number_of_dollar_value: '2000',
                last_updated: '2023-17-11'
            }
        ]

        const d3 = [
            {
                symbol: 'TEST1',
                status: 'approved',
                date: '2023-11-01'
            },
            {
                symbol: 'TEST2',
                status: 'deleted',
                date: '2023-11-02'
            },
            {
                symbol: 'TEST3',
                status: 'deleted',
                date: '2023-11-03'
            },
        ]
        let res: Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions> = [];
        if (data.report === ReportType.LAST_SALE_TOTALS_BY_ATS) {
            res = d1;
        } else if (data.report === ReportType.LAST_SALE_TOTALS_FOR_EACH_SYMBOL) {
            res = d2;
        } else if (data.report === ReportType.NUMBER_OF_SYMBOLS_ADDITIONS_AND_DELETIONS)
            res = d3;
        else {
            res = []
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(res);
            }, 500);

        });
    }

    public async getDetails(data: any): Promise<Array<ILastSale>> {
        // return (await apiWebBackendService.post<IResponse<Array<ILastSale>>>(`${this.PATH}details/`, data, {}, this.getUserAccessToken())).data;

           const d1 = [
               {
                   "id": 65,
                   "firm_name": "DORRS",
                   "origin": "WSAX",
                   "symbol_name": "TEST7",
                   "symbol_suffix": "",
                   "condition": "buy",
                   "tick_indication": "D",
                   "quantity": "11.0000000000000000",
                   "price": "21.0000000000000000",
                   "time": "13:18",
                   "date": "2023-11-08",
                   "uti": "110820231318-0000-A0065",
                   "company_profile": {
                       "id": 24,
                       "logo": "/media/company_profile_logo/logo.jpg",
                       "security_name": "TEST Scurity",
                       "company_name": "Test Company",
                       "business_description": "Business Description12",
                       "street_address_1": "Street Address 1",
                       "street_address_2": "Street Address 2",
                       "city": "City",
                       "state": "",
                       "zip_code": "Zip Code",
                       "country": "AR",
                       "phone": "+380502222222",
                       "web_address": "Web Address",
                       "sic_industry_classification": "SIC Industry Classification",
                       "incorporation_information": "Incorporation Information",
                       "number_of_employees": 41,
                       "company_officers_and_contacts": "Company Officers & Contacts",
                       "board_of_directors": "Board of Directors",
                       "product_and_services": "Product & Services",
                       "company_facilities": "Company Facilities",
                       "transfer_agent": "Transfer Agent",
                       "accounting_auditing_firm": "Accounting / Auditing Firm",
                       "investor_relations_marketing_communications": "Communications",
                       "securities_counsel": "Securities Counsel",
                       "us_reporting": "US Reporting",
                       "edgar_cik": "Edgar CIK",
                       "is_approved": true,
                       "status": "approved",
                       "created_at": "2023-10-05T11:35:37.731843Z",
                       "updated_at": "2023-10-30T10:46:23.812054Z",
                       "symbol": 4
                   },
                   "created_at": "2023-11-16T11:19:00.179513Z",
                   "updated_at": "2023-11-16T11:54:04.772217Z"
               },
               {
                   "id": 61,
                   "firm_name": "DORRS",
                   "origin": "WSD",
                   "symbol_name": "EDEDE",
                   "symbol_suffix": "",
                   "condition": "buy",
                   "tick_indication": "D",
                   "quantity": "32.0000000000000000",
                   "price": "32.0000000000000000",
                   "time": "21:12",
                   "date": "2023-11-09",
                   "uti": "110920232112-0000-A0061",
                   "company_profile": {
                       "id": 33,
                       "logo": "/media/company_profile_logo/%D0%91%D0%B5%D0%B7_%D0%B8%D0%BC%D0%B5%D0%BD%D0%B8_cHFTAGQ.png",
                       "security_name": "TESTDDDDD",
                       "company_name": "NY COM",
                       "business_description": "",
                       "street_address_1": "",
                       "street_address_2": "",
                       "city": "",
                       "state": "",
                       "zip_code": "",
                       "country": "US",
                       "phone": "",
                       "web_address": "",
                       "sic_industry_classification": "",
                       "incorporation_information": "",
                       "number_of_employees": null,
                       "company_officers_and_contacts": "[\"1\",\"2\"]",
                       "board_of_directors": "[\"3\",\"4\"]",
                       "product_and_services": "",
                       "company_facilities": "",
                       "transfer_agent": "",
                       "accounting_auditing_firm": "",
                       "investor_relations_marketing_communications": "",
                       "securities_counsel": "",
                       "us_reporting": "",
                       "edgar_cik": "",
                       "is_approved": false,
                       "status": "submitted",
                       "created_at": "2023-10-27T16:47:19.233267Z",
                       "updated_at": "2023-10-27T16:47:19.233271Z",
                       "symbol": 11
                   },
                   "created_at": "2023-11-09T19:12:56.639325Z",
                   "updated_at": "2023-11-16T11:15:38.946922Z"
               }
           ];


           return new Promise((resolve, reject) => {
               setTimeout(() => {
                   resolve(d1 as any);
               }, 500);

           });
    }

}


const ordersService = new ReportsService();

export default ordersService;
