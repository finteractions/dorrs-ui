import {IFirm} from "@/interfaces/i-firm";

export interface IUserProfile {
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    user_image?: string;
    is_enabled?: boolean;
    otp_token?: string;
    city: string;
    country: string;
    address: string;
    state: string;
    house_number: string;
    firm?: IFirm
    customer_type?: string;
    data_feed_providers?: string[];
    reference_number?: string;
    account_type?: string;
    user_type?: string;
    environment?: string;
}
