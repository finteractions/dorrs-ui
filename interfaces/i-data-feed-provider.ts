interface IDataFeedProvider {
    id: number;
    name: string;
    logo: string;
    logo_tmp?: string;
    website_link: string;
    fees_link: string;
    social_media_link: string;
    custom_link: string;
    option: string;
    description: string[];
    images: string[];
    image_tmp: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    created_date_time: string;
    socials?: any;
    customs?: any;
    custom_link_name?: [];
    custom_link_link?: [];
}
