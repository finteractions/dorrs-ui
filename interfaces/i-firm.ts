export interface IFirm {
    id: number;
    name: string;
    mpid: string;
    address: string;
    email: string;
    phone: string;
    updated_at: string;
    approved_by: string;
    created_at: string;
    is_approved: boolean;
    approved_date_time: string;
    status: string;
    is_member: boolean;
    is_member_text?: string;
    bank: Array<any>
    is_ats: boolean;
    is_ats_text?: string;
    created_by: string;
    created_date_time: string;
}
