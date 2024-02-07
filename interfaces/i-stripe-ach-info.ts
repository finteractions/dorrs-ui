import {IStripePaymentMethodInfo} from "@/interfaces/i-stripe-payment-method-info";

export interface IStripeACHInfo extends IStripePaymentMethodInfo {
    account_holder_type: string;
    account_type: string;
    bank_name: string;
    isLoading?: boolean;
}
