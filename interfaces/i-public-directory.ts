interface IDirectoryCompanyProfile {
    id?: number | null,
    first_last_name: string;
    email: string;
    mobile_number: string;
    company_name: string;
    company_type: string;
    company_type_name: string;
    company_title: string;
    protocol_name: string;
    description: string;
    website_link: string;
    founding_date: string;
    logo: string;
    asset_class: Array<string>;
    asset_region: Array<string>;
    network: Array<string>;
    asset_listing: string;
    additional_information: string;

    logo_tmp?: string;
    approved_by: string;
    created_at: string;
    created_by: string;
    created_date_time: string;
    status: string;
}
