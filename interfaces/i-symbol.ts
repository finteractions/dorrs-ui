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
    security_type_2: string;
    blockchain: string;
    smart_contract_type: string;
    status: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
}
