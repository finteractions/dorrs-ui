import {ICompanyProfile} from "@/interfaces/i-company-profile";

export interface ISymbol {
    id: number;
    reason_for_entry: string;
    symbol: string;
    cusip: string;
    dsin: string;
    primary_ats: string;
    transfer_agent: string;
    custodian: string;
    market_sector: string;
    lot_size: number;
    fractional_lot_size: number;
    mvp: number;
    security_name: string;
    security_type: string;
    fifth_character_identifier: string;
    security_type_2: string;
    blockchain: string;
    smart_contract_type: string;
    status: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
    company_profile: ICompanyProfile | null;
    company_profile_status: string;
    new_symbol?: string;
    new_security_name?: string;
    is_new_symbol?: boolean;
    date_entered?: string;
    time_entered?: string;
    date_effective?: string;
    time_effective?: string;
    change_reason?: string;
    change_reason_status?: boolean;
}
