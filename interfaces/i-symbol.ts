import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {IActivityStorage} from "@/interfaces/i-activity-storage";

export interface ISymbol {
    id: number;
    reason_for_entry: string;
    symbol: string;
    is_cusip: boolean;
    cusip: string;
    dsin: string;
    primary_ats: string;
    new_primary_ats: string;
    transfer_agent: string;
    custodian: string;
    market_sector: string;
    market_sector_category: string;
    lot_size: number;
    fractional_lot_size: number;
    mvp: number;
    security_name: string;
    fifth_character_identifier: string;
    digital_asset_category: string;
    instrument_type: string;
    alternative_asset_category: string;
    alternative_asset_subcategory: string;
    exempted_offerings: string;
    issuer_name: string;
    issuer_type: string;
    legal_claim_entity: string;
    underpinning_asset_value: string;
    reference_asset: string;
    fungibility_type: string;
    market_dynamics_description: string;
    rights_type: string;
    enforceability_type: string;
    redeemability_type: string;
    redemption_asset_type: string;
    nature_of_record: string;
    status: string;
    created_at: string;
    updated_at: string;
    is_approved: boolean;
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
    created_by: string;
    created_date_time: string;
    fill_out_percentage: number;
    edgar_cik: string;

    version: string;

    algorand_last_sale_application_id?: string;
    algorand_last_sale_application_id_link?: string;
    algorand_best_bid_and_best_offer_application_id?: string;
    algorand_best_bid_and_best_offer_application_id_link?: string;

    // Topology
    company_profile_id: number | null;
    symbol_id: number | null;
    master_symbol_name?: string | null;

    spv_name: string;
    fund_manager: string;
    investment_objective: string;
    sec_filing: string;
    sec_description: string[];
    sec_images: string[];
    sec_image_tmp?: string;
    sec_files: string[];
    sec_file_tmp?: string;

    linked_symbol_count?: number
    linked_data?: [],
    isAdmin?: boolean;
}
