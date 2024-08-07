interface IDirectoryCompanyProfile {
    name: string;
    logo: string;
    description: string;
    asset_class: Array<string>;
    asset_region: Array<string>;
    website_link: string;
    network: Array<string>;
    status: string;
}

interface IDirectoryCompanyProfileData {
    id?: number | null,
    name: string;
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
    region: Array<string>;
    network: Array<string>;
    asset_listing: string;
    additional_information: string;

    logo_tmp?: string;
}
