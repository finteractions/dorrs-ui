import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {IActivityStorage} from "@/interfaces/i-activity-storage";

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
    is_change?: boolean;
    new_symbol?: string;
    new_security_name?: string;
    date_entered_change?: string;
    time_entered_change?: string;
    date_effective_change?: string;
    time_effective_change?: string;
    reason_change?: string;
    reason_change_status?: boolean;
    changed_by: string;
    changed_date_time: string;
    is_delete?: boolean;
    date_entered_delete?: string;
    time_entered_delete?: string;
    date_effective_delete?: string;
    time_effective_delete?: string;
    reason_delete?: string;
    reason_delete_status?: boolean;
    deleted_by: string;
    deleted_date_time: string;
    history: Array<IActivityStorage>;
    symbol_suffix: string;
}
