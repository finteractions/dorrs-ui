import {IStripePaymentMethodInfo} from "@/interfaces/i-stripe-payment-method-info";

export interface IStripeCardInfo extends IStripePaymentMethodInfo{
    brand: string;
    exp_month: number;
    exp_year: number;
    isLoading?: boolean;
}
