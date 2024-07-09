import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";
import {MarketSector} from "@/enums/market-sector";
import React from "react";

class PublicDashboardService extends BaseService {

    private PATH = 'dashboard/';

    constructor() {
        super();
    }

    public async getTickerData(): Promise<Array<IMarketLastSaleStatistics>> {
        // return (await apiWebBackendService.get<IResponse<Array<IMarketLastSaleStatistics>>>(`${this.PATH}ticker/`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "id": 4,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722579",
                            "company_profile": {
                                "id": 1,
                                "symbol": 4,
                                "user": null,
                                "asset_type": "Collectibles",
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": "text",
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": "",
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "TESTC",
                                "company_name": "Test Company 1",
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
                                "company_officers_and_contacts": "[\"\"]",
                                "board_of_directors": "[\"\"]",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": null,
                                "symbol_name": "AAV",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-06-17T14:11:41.621628Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "AAV",
                                    "security_name": "TESTC"
                                },
                                "fill_out_percentage": "15.62"
                            },
                            "fractional_lot_size": 0.1,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "AAV",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722579"
                        },
                        {
                            "id": 29,
                            "digital_asset_category": "Cryptoassets",
                            "algorand_last_sale_application_id": "689721511",
                            "company_profile": null,
                            "fractional_lot_size": 0.000001,
                            "last_price": 12.22,
                            "tick_indication": "D",
                            "vwap": 12.621758940653393,
                            "symbol_name": "ADA",
                            "latest_update": "2024-07-04T00:18:18.050144Z",
                            "price_changed": -3.73,
                            "percentage_changed": -23.39,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721511"
                        },
                        {
                            "id": 21,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689721839",
                            "company_profile": {
                                "id": 15,
                                "symbol": 21,
                                "user": 33,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "Atlas ATS Company",
                                "company_name": "Atlas ATS Global",
                                "business_description": "Medical Testing Company for devices across tge United States.  Medical Devices can be hearing aids, heart rate monitors, and canes used for walking up ramps.",
                                "street_address_1": "1 Penny Lane Drive",
                                "street_address_2": "",
                                "city": "New York",
                                "state": "NY",
                                "zip_code": "",
                                "country": "US",
                                "phone": "+12125551212",
                                "web_address": "www,atlas.com",
                                "sic_industry_classification": "3420 Office of Manufacturing CUTLERY, HANDTOOLS & GENERAL HARDWARE",
                                "incorporation_information": "NY",
                                "number_of_employees": 500,
                                "company_officers_and_contacts": "[\"\"]",
                                "board_of_directors": "[\"\"]",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/modern-atlas-logo-vector-46403983.jpg",
                                "symbol_name": "ATLS",
                                "is_approved": true,
                                "approved_by": 14,
                                "approved_date_time": "2024-03-07T18:04:53.595188Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "ATLS",
                                    "security_name": "Atlas ATS Company"
                                },
                                "fill_out_percentage": "61.54"
                            },
                            "fractional_lot_size": null,
                            "last_price": 252.14,
                            "tick_indication": "U",
                            "vwap": 341.59472765785256,
                            "symbol_name": "ATLS",
                            "latest_update": "2024-07-04T00:18:06.031901Z",
                            "price_changed": -159.61,
                            "percentage_changed": -100.00,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721839"
                        },
                        {
                            "id": 31,
                            "digital_asset_category": "",
                            "algorand_last_sale_application_id": "689721212",
                            "company_profile": null,
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "D0101",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721212"
                        },
                        {
                            "id": 22,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689721695",
                            "company_profile": {
                                "id": 23,
                                "symbol": 22,
                                "user": 5,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "Ideanomics, Inc",
                                "company_name": "Company 022224+2",
                                "business_description": "",
                                "street_address_1": "",
                                "street_address_2": "",
                                "city": "",
                                "state": "",
                                "zip_code": "",
                                "country": "US",
                                "phone": "+12125551212",
                                "web_address": "",
                                "sic_industry_classification": "",
                                "incorporation_information": "",
                                "number_of_employees": null,
                                "company_officers_and_contacts": "[\"\"]",
                                "board_of_directors": "[\"\"]",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/IdexFinal.png",
                                "symbol_name": "IDEX",
                                "is_approved": true,
                                "approved_by": 13,
                                "approved_date_time": "2024-03-07T18:04:53.606629Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "IDEX",
                                    "security_name": "Ideanomics, Inc"
                                },
                                "fill_out_percentage": "34.62"
                            },
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "IDEX",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721695"
                        },
                        {
                            "id": 15,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722073",
                            "company_profile": {
                                "id": 12,
                                "symbol": 15,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "Mann Utitiles",
                                "company_name": "Mann",
                                "business_description": "Utilies",
                                "street_address_1": "1115 West 5th street",
                                "street_address_2": "",
                                "city": "New York",
                                "state": "NY",
                                "zip_code": "10001",
                                "country": "US",
                                "phone": "+12017222728",
                                "web_address": "www.mann.com",
                                "sic_industry_classification": "",
                                "incorporation_information": "Delaware Inc.",
                                "number_of_employees": 100,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "Power",
                                "company_facilities": "Newark, Delaware",
                                "transfer_agent": "Brassica",
                                "accounting_auditing_firm": "Dowecheathimandhow",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "GAAP",
                                "edgar_cik": "",
                                "logo": null,
                                "symbol_name": "MANN",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.598345Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "MANN",
                                    "security_name": "Mann Utitiles"
                                },
                                "fill_out_percentage": "65.38"
                            },
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "MANN",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722073"
                        },
                        {
                            "id": 20,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689721936",
                            "company_profile": {
                                "id": 14,
                                "symbol": 20,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "OTC Markets",
                                "company_name": "OTC Markets Group Inc",
                                "business_description": "Reference data",
                                "street_address_1": "Vesey Street",
                                "street_address_2": "",
                                "city": "New York",
                                "state": "NY",
                                "zip_code": "10001",
                                "country": "US",
                                "phone": "",
                                "web_address": "www.otcmarkets.com",
                                "sic_industry_classification": "8900 Office of Trade & Services SERVICES-SERVICES, NEC",
                                "incorporation_information": "",
                                "number_of_employees": 100,
                                "company_officers_and_contacts": "[\"\"]",
                                "board_of_directors": "[\"\"]",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "GAAP",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/Screenshot_1.png",
                                "symbol_name": "OTCMX",
                                "is_approved": true,
                                "approved_by": 13,
                                "approved_date_time": "2024-03-07T18:04:53.605214Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "OTCMX",
                                    "security_name": "OTC Markets Group new"
                                },
                                "fill_out_percentage": "57.69"
                            },
                            "fractional_lot_size": null,
                            "last_price": 15.76,
                            "tick_indication": "D",
                            "vwap": 14.684715770471001,
                            "symbol_name": "OTCMX",
                            "latest_update": "2024-07-04T00:18:12.041290Z",
                            "price_changed": 3.32,
                            "percentage_changed": 26.69,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721936"
                        },
                        {
                            "id": 25,
                            "digital_asset_category": "",
                            "algorand_last_sale_application_id": "689721546",
                            "company_profile": null,
                            "fractional_lot_size": 0.001,
                            "last_price": 1.1,
                            "tick_indication": "D",
                            "vwap": 1.1888110261275688,
                            "symbol_name": "PYTH",
                            "latest_update": "2024-07-04T00:18:24.059292Z",
                            "price_changed": -0.28,
                            "percentage_changed": -20.29,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721546"
                        },
                        {
                            "id": 24,
                            "digital_asset_category": "",
                            "algorand_last_sale_application_id": "689721590",
                            "company_profile": null,
                            "fractional_lot_size": 0.001,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TES02",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721590"
                        },
                        {
                            "id": 1,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722811",
                            "company_profile": {
                                "id": 6,
                                "symbol": 1,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
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
                                "number_of_employees": null,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/logo.jpg",
                                "symbol_name": "TEST",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.601350Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TEST",
                                    "security_name": "TEST"
                                },
                                "fill_out_percentage": "19.23"
                            },
                            "fractional_lot_size": 0.1,
                            "last_price": 14,
                            "tick_indication": "D",
                            "vwap": 14.166,
                            "symbol_name": "TEST",
                            "latest_update": "2024-06-25T16:29:06.027085Z",
                            "price_changed": 1.45,
                            "percentage_changed": 11.55,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722811"
                        },
                        {
                            "id": 32,
                            "digital_asset_category": "",
                            "algorand_last_sale_application_id": "689721144",
                            "company_profile": null,
                            "fractional_lot_size": null,
                            "last_price": 16.93,
                            "tick_indication": "U",
                            "vwap": 14.742303480641377,
                            "symbol_name": "TEST0",
                            "latest_update": "2024-06-25T16:01:03.393700Z",
                            "price_changed": 5.41,
                            "percentage_changed": 46.96,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721144"
                        },
                        {
                            "id": 14,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722373",
                            "company_profile": null,
                            "fractional_lot_size": 0.1,
                            "last_price": 11.52,
                            "tick_indication": "U",
                            "vwap": 11.52,
                            "symbol_name": "TEST9",
                            "latest_update": "2024-06-25T15:22:06.025722Z",
                            "price_changed": 11.52,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722373"
                        },
                        {
                            "id": 2,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722719",
                            "company_profile": {
                                "id": 9,
                                "symbol": 2,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "TESTA",
                                "company_name": "Company 1+1",
                                "business_description": "",
                                "street_address_1": "",
                                "street_address_2": "",
                                "city": "",
                                "state": "",
                                "zip_code": "",
                                "country": "",
                                "phone": "",
                                "web_address": "",
                                "sic_industry_classification": "",
                                "incorporation_information": "",
                                "number_of_employees": null,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/Screenshot_6_klMaKVW.png",
                                "symbol_name": "TESTA",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.600366Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TESTA",
                                    "security_name": "TESTA"
                                },
                                "fill_out_percentage": "15.38"
                            },
                            "fractional_lot_size": 0.1,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TESTA",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722719"
                        },
                        {
                            "id": 3,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722681",
                            "company_profile": {
                                "id": 2,
                                "symbol": 3,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "TESTB",
                                "company_name": "Test Company 2",
                                "business_description": "Test Description",
                                "street_address_1": "Test Street",
                                "street_address_2": "",
                                "city": "Test City1",
                                "state": "",
                                "zip_code": "63330",
                                "country": "US",
                                "phone": "+17025555555",
                                "web_address": "www.test.com",
                                "sic_industry_classification": "SIC Industry Classification",
                                "incorporation_information": "Incorporation Information",
                                "number_of_employees": 123,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "Product & Services",
                                "company_facilities": "Company Facilities",
                                "transfer_agent": "Transfer Agent",
                                "accounting_auditing_firm": "Accounting",
                                "investor_relations_marketing_communications": "Communications",
                                "securities_counsel": "Securities Counsel",
                                "us_reporting": "US Reporting",
                                "edgar_cik": "cik",
                                "logo": "/media/company_profile_logo/signature_3.png",
                                "symbol_name": "TESTB",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.603247Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TESTB",
                                    "security_name": "TESTB"
                                },
                                "fill_out_percentage": "84.62"
                            },
                            "fractional_lot_size": 0.1,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TESTB",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722681"
                        },
                        {
                            "id": 30,
                            "digital_asset_category": "Money or Money-Like Digital Assets",
                            "algorand_last_sale_application_id": "689721464",
                            "company_profile": {
                                "id": 27,
                                "symbol": 30,
                                "user": null,
                                "asset_type": "Private Funds",
                                "total_shares_outstanding": 100,
                                "initial_offering_date": "2024-04-10",
                                "price_per_share": "100.0000000000000000",
                                "asset_type_option": "image",
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": "file",
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "TESTD",
                                "company_name": "TESTD",
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
                                "company_officers_and_contacts": "[\"\"]",
                                "board_of_directors": "[\"\"]",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/logo.png",
                                "symbol_name": "TESTD",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-04-17T15:54:07.052957Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TESTD",
                                    "security_name": "TESTD"
                                },
                                "fill_out_percentage": "37.84"
                            },
                            "fractional_lot_size": 0.000001,
                            "last_price": 11.52,
                            "tick_indication": "U",
                            "vwap": 11.52,
                            "symbol_name": "TESTD",
                            "latest_update": "2024-06-25T15:21:54.007955Z",
                            "price_changed": 11.52,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721464"
                        },
                        {
                            "id": 18,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722019",
                            "company_profile": null,
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TESTJ",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722019"
                        },
                        {
                            "id": 12,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722479",
                            "company_profile": {
                                "id": 10,
                                "symbol": 12,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "TEST W",
                                "company_name": "TEST W CORP",
                                "business_description": "",
                                "street_address_1": "",
                                "street_address_2": "",
                                "city": "",
                                "state": "",
                                "zip_code": "",
                                "country": "",
                                "phone": "",
                                "web_address": "",
                                "sic_industry_classification": "",
                                "incorporation_information": "",
                                "number_of_employees": null,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "",
                                "company_facilities": "",
                                "transfer_agent": "",
                                "accounting_auditing_firm": "",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "",
                                "edgar_cik": "",
                                "logo": null,
                                "symbol_name": "TESTW",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.586539Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TESTW",
                                    "security_name": "TEST W"
                                },
                                "fill_out_percentage": "11.54"
                            },
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TESTW",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722479"
                        },
                        {
                            "id": 13,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722418",
                            "company_profile": {
                                "id": 11,
                                "symbol": 13,
                                "user": null,
                                "asset_type": null,
                                "total_shares_outstanding": null,
                                "initial_offering_date": null,
                                "price_per_share": null,
                                "asset_type_option": null,
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": null,
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "Thomas Jodan",
                                "company_name": "Tom Jodan",
                                "business_description": "Latex Industries",
                                "street_address_1": "",
                                "street_address_2": "",
                                "city": "",
                                "state": "",
                                "zip_code": "",
                                "country": "",
                                "phone": "",
                                "web_address": "",
                                "sic_industry_classification": "",
                                "incorporation_information": "Delaware",
                                "number_of_employees": 100,
                                "company_officers_and_contacts": "",
                                "board_of_directors": "",
                                "product_and_services": "Latex",
                                "company_facilities": "Newark, Delaware",
                                "transfer_agent": "VERTLO",
                                "accounting_auditing_firm": "Dowecheathimandhow",
                                "investor_relations_marketing_communications": "",
                                "securities_counsel": "",
                                "us_reporting": "GAAP",
                                "edgar_cik": "",
                                "logo": "/media/company_profile_logo/dorrs7.png",
                                "symbol_name": "TOMJ",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-03-07T18:04:53.599313Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "TOMJ",
                                    "security_name": "Thomas Jodan"
                                },
                                "fill_out_percentage": "46.15"
                            },
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "TOMJ",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722418"
                        },
                        {
                            "id": 7,
                            "digital_asset_category": null,
                            "algorand_last_sale_application_id": "689722574",
                            "company_profile": {
                                "id": 5,
                                "symbol": 7,
                                "user": null,
                                "asset_type": "Company",
                                "total_shares_outstanding": 101,
                                "initial_offering_date": "2024-04-02",
                                "price_per_share": "10.0000000000000000",
                                "asset_type_option": "text",
                                "asset_type_description": null,
                                "asset_type_images": null,
                                "issuer_profile_option": "text",
                                "issuer_profile_description": null,
                                "issuer_profile_images": null,
                                "issuer_profile_files": null,
                                "security_name": "23452",
                                "company_name": "WRWER",
                                "business_description": "Business",
                                "street_address_1": "WRWER",
                                "street_address_2": "WRWER",
                                "city": "New York",
                                "state": "KS",
                                "zip_code": "16100",
                                "country": "US",
                                "phone": "+19375236332",
                                "web_address": "www.google.ua",
                                "sic_industry_classification": "200 Industrial Applications and Services AGRICULTURAL PROD-LIVESTOCK & ANIMAL SPECIALTIES",
                                "incorporation_information": "AK",
                                "number_of_employees": 10,
                                "company_officers_and_contacts": "[\"WRWER\"]",
                                "board_of_directors": "[\"WRWER\"]",
                                "product_and_services": "WRWER",
                                "company_facilities": "WRWER",
                                "transfer_agent": "WRWER",
                                "accounting_auditing_firm": "WRWER",
                                "investor_relations_marketing_communications": "WRWER",
                                "securities_counsel": "WRWER",
                                "us_reporting": "WRWER",
                                "edgar_cik": "WRWER",
                                "logo": "/media/company_profile_logo/rainstart01.png",
                                "symbol_name": "WRWER",
                                "is_approved": true,
                                "approved_by": 5,
                                "approved_date_time": "2024-05-01T10:44:07.587165Z",
                                "status": "approved",
                                "symbol_data": {
                                    "symbol": "WRWER",
                                    "security_name": "23452"
                                },
                                "fill_out_percentage": "100.00"
                            },
                            "fractional_lot_size": null,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "WRWER",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689722574"
                        },
                        {
                            "id": 23,
                            "digital_asset_category": "Financial Digital Assets",
                            "algorand_last_sale_application_id": "689721629",
                            "company_profile": null,
                            "fractional_lot_size": 0.001,
                            "last_price": 0,
                            "tick_indication": "N",
                            "vwap": 0,
                            "symbol_name": "XRP",
                            "latest_update": null,
                            "price_changed": 0,
                            "percentage_changed": 0,
                            "algorand_last_sale_application_id_link": "https://testnet.explorer.perawallet.app/application/689721629"
                        }
                    ] as any
                )
            }, 1000)
        })
    }

    public async getSymbolRegistry(): Promise<Array<IDashboardSymbolRegistry>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardSymbolRegistry>>>(`${this.PATH}symbol_registry/`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "total_symbols": "50",
                            "total_companies": "47",
                            "unique_industries": "9"
                        },
                    ] as any
                )
            }, 1000)
        })
    }

    public async getCompanyProfile(): Promise<Array<IDashboardCompanyProfile>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardCompanyProfile>>>(`${this.PATH}company_profile/`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "average_market_cap": "550000",
                            "total_market_cap": "10000",
                            "number_of_companies": "27"
                        },
                    ] as any
                )
            }, 1000)
        })
    }

    public async getMarketData(): Promise<Array<IDashboardMarketDataSummary>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardMarketDataSummary>>>(`${this.PATH}market_data/`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "total_volume": "550000",
                            "avg_sale_price": "100.63",
                            "best_bid_price": "204.05",
                            "best_offer_price": "98.21",
                            "total_bid_volume": "120000",
                            "total_offer_volume": "185000",
                            "spread_price": "0.1",
                        },
                    ] as any
                )
            }, 1000)
        })
    }

    public async getBlockchainData(): Promise<Array<IDashboardBlockchainDataLastSale>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardBlockchainData>>>(`${this.PATH}blockchain_data/`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "total_volume": "550000",
                            "avg_amount": "12500",
                        },
                        {
                            "total_volume": "47000",
                            "avg_amount": "7500",
                            "best_bid_price": "100.05",
                            "best_offer_price": "104.21",
                        },
                    ] as any
                )
            }, 1000)
        })
    }

    public async getTOP5ActiveSymbols(type?: string): Promise<Array<IDashboardTOP5ActiveSymbols>> {
        let queryString = "";
        if (type) {
            queryString += `?type=${type}`;
        }
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardTOP5ActiveSymbols>>>(`${this.PATH}market_data_top/${queryString}`, {})).data;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    [
                        {
                            "symbol_name": "TEST",
                            "logo": "/media/company_profile_logo/logo.jpg",
                            "company_name": "DORRS",
                            "total_volume": "5000",
                            "avg_sale_price": "140.33",
                            "best_bid_price": "200.00",
                            "best_offer_price": "204.05",
                            "total_bid_volume": "1256.33",
                            "total_offer_volume": "3562.88",
                            "spread_price": "0.3"
                        },
                        {
                            "symbol_name": "TESTA",
                            "logo": "/media/company_profile_logo/Screenshot_6_klMaKVW.png",
                            "company_name": "DORRS",
                            "total_volume": "500",
                            "avg_sale_price": "18.87",
                            "best_bid_price": "19.09",
                            "best_offer_price": "52.05",
                            "total_bid_volume": "745.85",
                            "total_offer_volume": "256.3",
                            "spread_price": "0.1"
                        },
                        {
                            "symbol_name": "TESTB",
                            "logo": "/media/company_profile_logo/signature_3.png",
                            "company_name": "DORRS",
                            "total_volume": "5000",
                            "avg_sale_price": "140.33",
                            "best_bid_price": "200.00",
                            "best_offer_price": "204.05",
                            "total_bid_volume": "1256.33",
                            "total_offer_volume": "3562.88",
                            "spread_price": "0.3"
                        },
                        {
                            "symbol_name": "TESTD",
                            "logo": "/media/company_profile_logo/logo.png",
                            "company_name": "DORRS",
                            "total_volume": "5000",
                            "avg_sale_price": "140.33",
                            "best_bid_price": "200.00",
                            "best_offer_price": "204.05",
                            "total_bid_volume": "1256.33",
                            "total_offer_volume": "3562.88",
                            "spread_price": "0.3"
                        },
                        {
                            "symbol_name": "WRWER",
                            "logo": "/media/company_profile_logo/rainstart01.png",
                            "company_name": "DORRS",
                            "total_volume": "5000",
                            "avg_sale_price": "140.33",
                            "best_bid_price": "200.00",
                            "best_offer_price": "204.05",
                            "total_bid_volume": "1256.33",
                            "total_offer_volume": "3562.88",
                            "spread_price": "0.3"
                        }


                    ] as any
                )
            }, 1000)
        })
    }

    public async getTOP5Percentage(type?: string): Promise<Array<IDashboardTOP5PercentageChange>> {
        let queryString = "";
        if (type) {
            queryString += `?type=${type}`;
        }
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardTOP5ActiveSymbols>>>(`${this.PATH}market_data_top/${queryString}`, {})).data;

        if (type && type === 'percentage_gains') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(
                        [
                            {
                                "symbol_name": "TEST",
                                "logo": "/media/company_profile_logo/logo.jpg",
                                "company_name": "DORRS",
                                "percentage_changed": "+0.6",
                                "volume": "450000",
                                "last_trade_price": "195.66",
                            },
                            {
                                "symbol_name": "TESTA",
                                "logo": "/media/company_profile_logo/Screenshot_6_klMaKVW.png",
                                "company_name": "DORRS",
                                "percentage_changed": "+1.98",
                                "volume": "12952",
                                "last_trade_price": "145.21",
                            },
                            {
                                "symbol_name": "TESTB",
                                "logo": "/media/company_profile_logo/signature_3.png",
                                "company_name": "DORRS",
                                "percentage_changed": "+25.63",
                                "volume": "785000",
                                "last_trade_price": "10000",
                            },
                            {
                                "symbol_name": "TESTD",
                                "logo": "/media/company_profile_logo/logo.png",
                                "company_name": "DORRS",
                                "percentage_changed": "+14.78",
                                "volume": "8563.21",
                                "last_trade_price": "145.61",
                            },
                            {
                                "symbol_name": "WRWER",
                                "logo": "/media/company_profile_logo/rainstart01.png",
                                "company_name": "DORRS",
                                "percentage_changed": "+3",
                                "volume": "741.36",
                                "last_trade_price": "11.24",
                            }


                        ] as any
                    )
                }, 1000)
            })
        } else if (type && type === 'percentage_losses') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(
                        [
                            {
                                "symbol_name": "TEST",
                                "logo": "/media/company_profile_logo/logo.jpg",
                                "company_name": "DORRS",
                                "percentage_changed": "-0.6",
                                "volume": "1246",
                                "last_trade_price": "85.36",
                            },
                            {
                                "symbol_name": "TESTA",
                                "logo": "/media/company_profile_logo/Screenshot_6_klMaKVW.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-15",
                                "volume": "12596",
                                "last_trade_price": "745.36",
                            },
                            {
                                "symbol_name": "TESTB",
                                "logo": "/media/company_profile_logo/signature_3.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-1.5",
                                "volume": "1452",
                                "last_trade_price": "11.25",
                            },
                            {
                                "symbol_name": "TESTD",
                                "logo": "/media/company_profile_logo/logo.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-41.22",
                                "volume": "741.69",
                                "last_trade_price": "92.42",
                            },
                            {
                                "symbol_name": "WRWER",
                                "logo": "/media/company_profile_logo/rainstart01.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-9",
                                "volume": "21000",
                                "last_trade_price": "145.36",
                            }


                        ] as any
                    )
                }, 1000)
            })
        } else if (type && type === 'trade_volumes') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(
                        [
                            {
                                "symbol_name": "TEST",
                                "logo": "/media/company_profile_logo/logo.jpg",
                                "company_name": "DORRS",
                                "percentage_changed": "0.6",
                                "volume": "1246",
                                "last_trade_price": "85.36",
                            },
                            {
                                "symbol_name": "TESTA",
                                "logo": "/media/company_profile_logo/Screenshot_6_klMaKVW.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-15",
                                "volume": "12596",
                                "last_trade_price": "745.36",
                            },
                            {
                                "symbol_name": "TESTB",
                                "logo": "/media/company_profile_logo/signature_3.png",
                                "company_name": "DORRS",
                                "percentage_changed": "3.5",
                                "volume": "1452",
                                "last_trade_price": "11.25",
                            },
                            {
                                "symbol_name": "TESTD",
                                "logo": "/media/company_profile_logo/logo.png",
                                "company_name": "DORRS",
                                "percentage_changed": "-41.22",
                                "volume": "741.69",
                                "last_trade_price": "92.42",
                            },
                            {
                                "symbol_name": "WRWER",
                                "logo": "/media/company_profile_logo/rainstart01.png",
                                "company_name": "DORRS",
                                "percentage_changed": "48",
                                "volume": "21000",
                                "last_trade_price": "145.36",
                            }


                        ] as any
                    )
                }, 1000)
            })
        } else {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([])
                }, 1000)
            })
        }

    }


    public async getHeatMap(): Promise<Array<IDashboardHeatMapAndPerformance>> {
        // return (await apiWebBackendService.get<IResponse<Array<IDashboardHeatMapAndPerformance>>>(`${this.PATH}heat_map/`, {})).data;

        const data: any = []

        {
            Object.values(MarketSector).map((type) => {
                const randomPercentageChanged = (Math.random() * (0.7 - (-0.5)) + (-0.5)).toFixed(2);
                const randomTotalMarketCap = Math.floor(Math.random() * (50000 - 25000 + 1)) + 25000;
                const randomNumberOfCompanies = Math.floor(Math.random() * (10 - 5 + 1)) + 5;

                data.push({
                    "sector_name": type,
                    "percentage_changed": randomPercentageChanged,
                    "total_market_cap": randomTotalMarketCap,
                    "number_of_companies": randomNumberOfCompanies
                })
            })
        }
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(
                    data as any
                )
            }, 1000)
        })
    }
}

const publicDashboardService = new PublicDashboardService();

export default publicDashboardService;

