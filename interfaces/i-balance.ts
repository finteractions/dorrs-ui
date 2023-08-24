export interface IBalance {
    id: number;
    user_id: string;
    asset: string;
    balance: number;
    wallet_address: string;
    editable?: boolean;
}