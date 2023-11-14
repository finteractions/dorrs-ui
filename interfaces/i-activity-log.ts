export interface IActivityLog {
    id: number;
    user_id: string;
    action: string;
    ip_address: string;
    created_at: string;
    city: string | null;
    region: string | null,
    country: string | null;
    country_region_city?: string | null;
    blockIpBtnDisabled?: boolean;
}
