import {IFirm} from "@/interfaces/i-firm";

export interface IUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    mobile_number: string;
    email_verified: boolean;
    account_type: string;
    user_type: string;
    customer_type: string;
    data_feed_providers: string[];
    is_blocked: boolean;
    firm?: IFirm | null;
}
