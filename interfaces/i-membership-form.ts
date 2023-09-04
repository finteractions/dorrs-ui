interface IMembershipForm {
    id: number | null,
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
}
