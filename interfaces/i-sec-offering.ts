interface ISECOffering {
    id: number;
    symbol: string
    type: string;
    accession_number: string;
    investment_fund_type: string;
    is_1940_act: string;
    federal_exemptions: string[] | string;
    sale_date: string;
    is_pool_investment: string;
    minimum_investment_accepted: string;
    total_offering_amount: string;
    total_amount_sold: string;
    total_remaining: string;
    is_accredited: string;
    total_number_already_invested: string;
    edgar_link_to_filling: string;

    is_approved: boolean;
    status: string;
    approved_by: string;
    approved_date_time: string;
    created_at: string;
    updated_at: string;
}
