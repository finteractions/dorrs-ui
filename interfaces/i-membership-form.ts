interface IMembershipForm {
    id: number,
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
    user_id: string;
    status: string;
    comment: string;
    updated_at: string;
    approved_by: string;
    approved_date_time: string;
}
