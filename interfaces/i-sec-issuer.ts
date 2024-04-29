interface ISECIssuer {
    id: number;
    symbol: string
    type: string;
    accession_number: string;
    is_primary_issuer: string;
    cik: string;
    entity_name: string;
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip_code: string;
    phone_number: string;
    jurisdiction: string;
    entity_type: string;
    year_of_financial_value: string;
    edgar_link_to_filling: string;

    is_approved: boolean;
    status: string;
    approved_by: string;
    approved_date_time: string;
    created_at: string;
    updated_at: string;
}
