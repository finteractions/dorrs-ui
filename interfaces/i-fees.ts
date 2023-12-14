export interface IFees {
    id: number;
    description: string | null;
    value: string;
    fee_price: IFeesPrice;
    fee_tariff: IFeesTariff;
    created_at: string;
    updated_at: string;

}

export interface IFeesPrice {
    id: number;
    name: string;
    key: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface IFeesTariff {
    id: number;
    name: string;
    key: string;
    description: string | null;
    period_type: string;
    created_at: string;
    updated_at: string;
}
