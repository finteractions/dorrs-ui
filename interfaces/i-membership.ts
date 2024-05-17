interface IMembership {
    id: number,
    firm: string | null
    region: string;
    state: string;
    is_finra: boolean;
    mpid: string | null;
    crd: string;
    company_name: string;
    email: string;
    mobile_number: string;
    address1: string;
    address2: string;
    city: string;
    zip_code: string;
    country: string;
    annual_fees: string;
    customer_type: string;
    data_feed_providers: string[];
    user_id: string;
    status: string;
    comment: string;
    created_at: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
    created_by: string;
    created_date_time: string;
}
