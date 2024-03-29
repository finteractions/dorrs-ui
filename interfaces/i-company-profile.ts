import {ISymbol} from "@/interfaces/i-symbol";

export interface ICompanyProfile {
    id: number;
    symbol: string;
    security_name: string;
    company_name: string;
    business_description: string;
    street_address_1: string;
    street_address_2: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
    web_address: string;
    sic_industry_classification: string;
    incorporation_information: string;
    number_of_employees: string;
    company_officers_and_contacts: string[];
    board_of_directors: string[];
    product_and_services: string;
    company_facilities: string;
    transfer_agent: string;
    accounting_auditing_firm: string;
    investor_relations_marketing_communications: string;
    securities_counsel: string;
    us_reporting: string;
    edgar_cik: string;
    status: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
    is_approved: boolean;
    logo: string;
    logo_tmp?: string;
    symbol_data?: ISymbol;
    company_profile_status?: string;
}
