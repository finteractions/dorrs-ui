export interface IStripeCardInfo {
    card_id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
    isLoading?: boolean;
}
