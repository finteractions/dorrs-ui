export interface IActivityLog {
    id: number;
    user_id: string;
    firm_name: string;
    source: string;
    ip_user: string;
    georegion: string;
    log: { action: string, details: string };
    details: string;
    created_at: string;
    blockIpBtnDisabled?: boolean;
}
