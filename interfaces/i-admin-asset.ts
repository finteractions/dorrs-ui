interface IAdminAsset {
    id: number;
    name: string;
    code: string;
    label: string;
    network: string;
    image: string;
    qr_wallet_name: string
    protocol: string;
    active: boolean;
    active_text?: string;
    currency_type: string;
    transaction_fee: number;
    transaction_fee_updated: string;
    dollar_pegged: boolean;
    dollar_pegged_text?: string;
    dollar_pegged_rate: number;
    inverted_rate: boolean;
    inverted_rate_text?: string;
    last_price: number;
    last_price_updated: string;
    sequence: number;
    image_tmp?: any;
    name_label?: string;
}
