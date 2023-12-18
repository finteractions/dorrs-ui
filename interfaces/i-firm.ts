export interface IFirm {
    id: number;
    name: string;
    updated_at: string;
    approved_by: string;
    created_at: string;
    is_approved: boolean;
    approved_date_time: string;
    status: string;
    is_member: boolean;
    is_member_text?: string;
    bank: Array<any>
}
