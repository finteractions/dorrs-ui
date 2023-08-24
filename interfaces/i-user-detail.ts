import {IUser} from "@/interfaces/i-user";

export interface IUserDetail {
    id: number;
    user_id: IUser;
    state: string;
    country: string;
    city: string | null;
    address: string | null;
    house_number: number;
    identity_verification: string | null;
    sign_dmcc_agreement: string | null;
    is_approved: boolean;
    approved_date_time: string;
    created_at: string;
    approved_by: number | null;
    status?: string;
    name?:string;
    active?: boolean;
    active_text?: string;
    email_verified_text?: string;
    comment: string;
    comment_status?: boolean;
    user_image: string;
}
