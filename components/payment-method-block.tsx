import React from 'react';

import StripeForm from "@/components/payment/stripe-form";
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import stripeService from "@/services/stripe/stripe-service";
import LoaderBlock from "@/components/loader-block";


interface PaymentMethodBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    errorMessages: string[];
    cardInfo: IStripeCardInfo | null;
}

interface PaymentMethodBlockProps {

}

class PaymentMethodBlock extends React.Component<PaymentMethodBlockProps, PaymentMethodBlockState> {

    state: PaymentMethodBlockState;
    errors: Array<string> = new Array<string>();
    errorMessages: Array<string> = new Array<string>();

    constructor(props: PaymentMethodBlockProps) {
        super(props);

        this.state = {
            isLoading: true,
            success: false,
            errors: [],
            errorMessages: [],
            cardInfo: null
        }
    }

    onCallback = async (values: any, setFormSubmit: (value: boolean) => void) => {
        this.setState({errorMessages: []})
        this.addCard(values)
            .then(() => {
                setFormSubmit(false);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
                setFormSubmit(false);
            })

    };

    addCard(body: any) {
        return new Promise(async (resolve, reject) => {
            await stripeService.addCard(body)
                .then((res: Array<IStripeCardInfo>) => {
                    resolve(this.setCard(res))
                })
                .catch(((errors: IError) => reject(errors)))
        })
    }

    getCard = () => {
        return new Promise(resolve => {
            stripeService.getCardInfo()
                .then((res: Array<IStripeCardInfo>) => {
                    resolve(this.setCard(res))
                })
        })

    }

    setCard(res: Array<IStripeCardInfo>) {
        return new Promise(resolve => {
            const card = res[0] || null;

            this.setState({cardInfo: card}, () => {
                this.setState({isLoading: false});
                resolve(true);
            });
        })
    }

    async componentDidMount() {
        this.setState({isLoading: true});
        await this.getCard()
    }


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <StripeForm
                        title={'My Payment method'}
                        card={this.state.cardInfo}
                        errorMessages={this.state.errorMessages}
                        onCallback={this.onCallback}
                    />
                )}

            </>

        )
    }
}

export default PaymentMethodBlock
