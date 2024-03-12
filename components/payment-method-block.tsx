import React from 'react';
import PaymentMethodStripeCreditDebitCardBlock from "@/components/payment-method-stripe-credit-debit-card-block";
import PaymentMethodStripeACHBlock from "@/components/payment-method-stripe-ach-block";
import LoaderBlock from "@/components/loader-block";
import {IDataContext} from "@/interfaces/i-data-context";
import PaymentMethodWireBlock from "@/components/payment-method-wire-block";
import {PaymentSource} from "@/enums/payment-source";

interface PaymentMethodBlockState extends IState {
    isForm: boolean;
    isEdit: boolean;
    isCreditDebitCardForm: boolean;
    isACHForm: boolean;
    isProcessing: boolean;
    activeForm: string;

    isDashboard: boolean;
    amountStored: number | undefined;
    amount: number | undefined;
    isLoading: boolean;
    reInit: boolean;

    errorMessages: string[];
    formsLoadedCount: number;
}

interface PaymentMethodBlockProps extends ICallback {
    isDashboard?: boolean;
    amount?: number;
    errorMessages?: Array<string> | null;
}

class PaymentMethodBlock extends React.Component<PaymentMethodBlockProps, PaymentMethodBlockState> {

    state: PaymentMethodBlockState;
    creditDebitCardBlockRef: React.RefObject<PaymentMethodStripeCreditDebitCardBlock> = React.createRef();
    achBlockRef: React.RefObject<PaymentMethodStripeACHBlock> = React.createRef();

    constructor(props: PaymentMethodBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        this.state = {
            isDashboard: this.props?.isDashboard ?? false,
            amountStored: this.props?.amount,
            amount: this.props?.amount,
            isForm: false,
            isEdit: false,
            isCreditDebitCardForm: false,
            isACHForm: false,
            errorMessages: [],
            success: false,
            isProcessing: false,
            activeForm: 'wire',
            isLoading: this.props?.isDashboard ?? false,
            reInit: false,
            formsLoadedCount: 0,
        }
    }

    onCallback = async (values: any, setFormSubmit: (value: boolean) => void) => {

        if (values === null) {
            this.closeForm()
        } else {

            if (values?.processing === true || values?.processing === false) {
                this.setState({isProcessing: values?.processing}, () => {
                    if (values?.processing === false) this.processing();
                })
            }

            if (values?.type === PaymentSource.card) {
                this.setState({isForm: false, isCreditDebitCardForm: true})
            }

            if (values?.type === PaymentSource.us_bank_account) {
                this.setState({isForm: false, isACHForm: true})
            }


            if (values?.payment) {
                this.setState({isProcessing: true}, () => {
                    this.props.onCallback(values, setFormSubmit)
                })
            }

            if (values?.defaultType) {
                this.setState({activeForm: values.defaultType, isLoading: false})
            } else {
                this.setState({formsLoadedCount: this.state.formsLoadedCount + 1}, () => {
                    if (this.state.formsLoadedCount >= 2) this.setState({isLoading: false})
                })
            }

            if (values?.back) {
                this.props.onCallback(values)
            }

        }
    }

    processing = () => {
        const cardPromise = this.creditDebitCardBlockRef.current?.getCard();
        const achPromise = this.achBlockRef.current?.getACH();


        this.setState({isProcessing: false}, async () => {
            await Promise.all([cardPromise, achPromise])
                .finally(() => {
                    this.setState({isProcessing: false, reInit: false})
                })
        })
    }

    openForm = () => {
        this.setState({
            isForm: true,
            isEdit: true,
            activeForm: PaymentSource.us_bank_account,
            isCreditDebitCardForm: false,
            isACHForm: false,
            amount: undefined
        })
    }

    closeForm = () => {
        this.setState({
            isForm: false,
            isEdit: false,
            isCreditDebitCardForm: false,
            isACHForm: false,
            activeForm: PaymentSource.wire,
            amount: this.state.amountStored,
            reInit: this.state.isDashboard,
        }, () => {
            if (this.state.isDashboard) {
                this.setState({isLoading: true}, () => {
                    this.processing();
                })
            }
        })
    }

    setActiveForm = (form: string) => {
        this.setState({
            activeForm: form,
            errorMessages: []
        })
    }

    componentDidUpdate(prevProps: PaymentMethodBlockProps) {
        if (this.props?.errorMessages !== prevProps?.errorMessages) {
            this.setState({errorMessages: this.props?.errorMessages ?? []}, () => {
                this.setState({isProcessing: !(this.state.errorMessages.length > 0)})
            })
        }
    }

    render() {
        const shouldRenderCreditDebitCardBlock = this.state.isACHForm || (this.state.isDashboard && !this.state.isCreditDebitCardForm && !this.state.isACHForm && this.state.activeForm === PaymentSource.wire) || ![PaymentSource.wire, PaymentSource.card].includes(this.state.activeForm as PaymentSource);
        const shouldRenderACHBlock = this.state.isCreditDebitCardForm || (this.state.isDashboard && !this.state.isCreditDebitCardForm && !this.state.isACHForm && this.state.activeForm === PaymentSource.wire) || ![PaymentSource.wire, PaymentSource.us_bank_account].includes(this.state.activeForm as PaymentSource);

        return (
            <>
                {this.state.isLoading && (
                    <LoaderBlock/>
                )}

                {!this.state.reInit && (
                    <div className={this.state.isLoading ? 'd-none' : ''}>
                        <div
                            className={`profile__right-title justify-content-between align-items-center d-flex ${this.state.isDashboard ? 'mb-2' : ''}`}>

                            <div>{!this.state.isDashboard ? 'My ' : ''}Payment method</div>

                            <div
                                className={`content__title_btns content__filter download-buttons justify-content-end`}>

                                {this.state.isForm || this.state.isCreditDebitCardForm || this.state.isACHForm ? (
                                    <button
                                        className={`b-btn ripple width-unset ${this.state.isProcessing ? 'disable' : ''}`}
                                        onClick={this.closeForm}
                                        disabled={this.state.isProcessing}
                                    >
                                        Back
                                    </button>
                                ) : (

                                    <button
                                        className={`b-btn ripple width-unset ${this.state.isProcessing ? 'disable' : ''}`}
                                        onClick={this.openForm}
                                        disabled={this.state.isProcessing}
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={''}>
                            <ul className={`nav nav-tabs ${this.state.isForm || this.state.amount ? '' : 'd-none'}`}
                                id="tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeForm === PaymentSource.us_bank_account ? 'active' : ''}`}
                                       id="home-tab"
                                       data-bs-toggle="tab"
                                       href="#form"
                                       onClick={() => this.setActiveForm(PaymentSource.us_bank_account)}
                                    >
                                        Bank Account (ACH)
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeForm === PaymentSource.card ? 'active' : ''}`}
                                       id="profile-tab"
                                       data-bs-toggle="tab"
                                       href="#form"
                                       onClick={() => this.setActiveForm(PaymentSource.card)}>
                                        Credit or Debit Card
                                    </a>
                                </li>

                                {this.state.isDashboard && !this.state.isEdit && (
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeForm === PaymentSource.wire ? 'active' : ''}`}
                                           id="home-tab"
                                           data-bs-toggle="tab"
                                           href="#form"
                                           onClick={() => this.setActiveForm(PaymentSource.wire)}
                                        >
                                            WIRE
                                        </a>
                                    </li>
                                )}

                            </ul>

                            <div className="tab-content">
                                <div
                                    className={`tab-pane show fade mt-24 active`}
                                    id="form">
                                    <div
                                        className={this.state.isForm || this.state.amount ? 'payment-method-form' : ''}>
                                        <div
                                            className={shouldRenderCreditDebitCardBlock || (this.state.activeForm !== 'card' && this.state.isDashboard) ? 'd-none' : ''}>
                                            <PaymentMethodStripeCreditDebitCardBlock
                                                ref={this.creditDebitCardBlockRef}
                                                onCallback={this.onCallback}
                                                isForm={this.state.isForm || this.state.isCreditDebitCardForm}
                                                isEdit={this.state.isEdit}
                                                isProcessing={this.state.isProcessing}
                                                isDashboard={this.state.isDashboard}
                                                amount={this.state.amount}
                                                errorMessages={this.state.errorMessages}
                                            />

                                        </div>

                                        <div
                                            className={shouldRenderACHBlock || (this.state.activeForm !== 'us_bank_account' && this.state.isDashboard) ? 'd-none' : ''}>
                                            <PaymentMethodStripeACHBlock
                                                ref={this.achBlockRef}
                                                onCallback={this.onCallback}
                                                isForm={this.state.isForm || this.state.isACHForm}
                                                isEdit={this.state.isEdit}
                                                isProcessing={this.state.isProcessing}
                                                isDashboard={this.state.isDashboard}
                                                amount={this.state.amount}
                                                errorMessages={this.state.errorMessages}
                                            />
                                        </div>


                                        {this.state.isDashboard && this.state.activeForm === 'wire' && !this.state.isEdit && (
                                            <div
                                                className={this.state.activeForm === 'wire' ? '' : 'd-none'}>
                                                <PaymentMethodWireBlock
                                                    onCallback={this.onCallback}
                                                    amount={this.state.amount}
                                                    isDashboard={this.state.isDashboard}
                                                    errorMessages={this.state.errorMessages}
                                                />
                                            </div>
                                        )}

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}


            </>

        )
    }
}

export default PaymentMethodBlock
