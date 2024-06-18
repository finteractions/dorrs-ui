import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IIndicator} from "@/interfaces/i-indicator";
import {IMarketStatistics} from "@/interfaces/i-market-statistics";
import {ILastSale} from "@/interfaces/i-last-sale";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";

class AlgorandService extends BaseService {

    private PATH = 'algorand/';

    constructor() {
        super();
    }

    public async getMarketData(symbol?: string | null,): Promise<Array<IMarketStatistics>> {
        let queryString = "";
        if (symbol) {
            queryString += `?symbol=${symbol}`;
        }
        // return (await apiWebBackendService.get<IResponse<Array<IMarketStatistics>>>(`${this.PATH}market/${queryString}`, {}, this.getUserAccessToken())).data;

        return new Promise<Array<any>>(resolve => {
            resolve(
                [
                    {
                        "id": 1,
                        "company_profile": {
                            "id": 6,
                            "symbol": '1',
                            "asset_type": 'null',
                            "total_shares_outstanding": 'null',
                            "initial_offering_date": 'null',
                            "price_per_share": 'null',
                            "asset_type_option": 'null',
                            "security_name": "TEST",
                            "company_name": "FIMR",
                            "business_description": "",
                            "street_address_1": "1",
                            "street_address_2": "",
                            "city": "",
                            "state": "",
                            "zip_code": "",
                            "country": "",
                            "phone": "",
                            "web_address": "",
                            "sic_industry_classification": "",
                            "incorporation_information": "",
                            "number_of_employees": 'null',
                            "product_and_services": "",
                            "company_facilities": "",
                            "transfer_agent": "",
                            "accounting_auditing_firm": "",
                            "investor_relations_marketing_communications": "",
                            "securities_counsel": "",
                            "us_reporting": "",
                            "edgar_cik": "",
                            "logo": "/media/company_profile_logo/logo.jpg",
                            "is_approved": true,
                            "approved_by": '5',
                            "approved_date_time": "2024-03-07T18:04:53.601350Z",
                            "status": "approved",
                        },
                        "fractional_lot_size": '0.1',
                        "last_price": '7.64',
                        "last_quantity": '19',
                        "tick_indication": "D",
                        "vwap": '9.722837304318219',
                        "symbol_name": "TEST-USD",
                        "price_changed": '0.37',
                        "percentage_changed": '5.09',
                        "latest_update": "2024-06-17T15:25:28.353430Z",
                    },
                ]
            )
        })
    }

    public async getChartBySymbol(symbol: string): Promise<Array<ITradingView>> {
        let queryString = `symbol=${symbol}`;

        const url = `${this.PATH}chart/?${queryString}`;
        // return (await apiWebBackendService.get<IResponse<Array<ITradingView>>>(url, {}, this.getUserAccessToken())).data;

        return new Promise<Array<any>>(resolve => {
            resolve(
                [
                    {
                        "time": '1718706720',
                        "volume": '1363',
                        "price": '7.34'
                    },
                    {
                        "time": '1718706780',
                        "volume": '1368',
                        "price": '6.46'
                    },
                    {
                        "time": '1718706840',
                        "volume": '1376',
                        "price": '10.53'
                    }
                ]
            )
        })
    }

    public async getTransactionBySymbol(symbol: string): Promise<Array<ILastSale>> {
        let queryString = `symbol=${symbol}`;

        const url = `${this.PATH}transaction/?${queryString}`;
        // return (await apiWebBackendService.get<IResponse<Array<ILastSale>>>(url, {}, this.getUserAccessToken())).data;

        return new Promise<Array<any>>(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "id": 1911,
                            "firm_name": "DORRS Inc.",
                            "origin": "ORIG",
                            "symbol_name": "TEST-USD",
                            "symbol_suffix": 'null',
                            "condition": "sell",
                            "mpid": "DORRS",
                            "tick_indication": "D",
                            "quantity": "1386.0000000000000000",
                            "price": "6.7600000000000000",
                            "price_formatted": '-6.76',
                            "time": "11:22",
                            "date": "2024-06-18",
                            "uti": "061820241122-0000-A1911",
                            "fractional_lot_size": '0.1',
                            "data_feed_provider_logo": "/media/data_feed_provider_logo/images.jpg",
                            "created_at": "2024-06-18T11:22:25.081995Z",
                            "updated_at": "2024-06-18T11:22:25.081999Z",
                            "algorand_tx_hash": "JQ7TIXIMDLVXHGMB37YQY3E6LX3NQ4AFVEQAU4RSHZHSQIS4HMQA",
                            "algorand_tx_hash_link": "https://testnet.explorer.perawallet.app/tx/JQ7TIXIMDLVXHGMB37YQY3E6LX3NQ4AFVEQAU4RSHZHSQIS4HMQA"
                        },

                        {
                            "id": 1909,
                            "firm_name": "DORRS Inc.",
                            "origin": "ORIG",
                            "symbol_name": "TEST-USD",
                            "symbol_suffix": 'null',
                            "condition": "buy",
                            "mpid": "DEVIO",
                            "tick_indication": "N",
                            "quantity": "1377.0000000000000000",
                            "price": "6.0900000000000000",
                            "price_formatted": '6.09',
                            "time": "11:21",
                            "date": "2024-06-18",
                            "uti": "061820241121-0000-A1909",
                            "fractional_lot_size": '0.1',
                            "data_feed_provider_logo": "/media/data_feed_provider_logo/images.jpg",
                            "created_at": "2024-06-18T11:21:55.073935Z",
                            "updated_at": "2024-06-18T11:21:55.073941Z",
                            "algorand_tx_hash": "B2RVGYJLGNQEUJURKAAPUY77W7ULPYOBON4QFG7SHLKCGRC7LMYQ",
                            "algorand_tx_hash_link": "https://testnet.explorer.perawallet.app/tx/B2RVGYJLGNQEUJURKAAPUY77W7ULPYOBON4QFG7SHLKCGRC7LMYQ"
                        }
                    ]
                )
            }, 1000)
        })
    }

}

const algorandService = new AlgorandService();

export default algorandService;

