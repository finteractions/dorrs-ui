import React from 'react';

import stripeService from "@/services/stripe/stripe-service";
import LoaderBlock from "@/components/loader-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Modal from "@/components/modal";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import StripeACHForm from "@/components/payment/stripe-ach-form";
import {IStripeACHInfo} from "@/interfaces/i-stripe-ach-info";

interface PaymentMethodStripeACHBlockState extends IState, IModalState {
    isLoading: boolean;
    errors: string[];
    errorMessages: string[];
    cards: Array<IStripeACHInfo> | [];
    cardInfoStored: IStripeACHInfo | null;
    cardInfo: IStripeACHInfo | null;
    isForm: boolean;
    isEdit: boolean;
    isDeleting: boolean;
    isProcessing: boolean;
}

interface PaymentMethodStripeACHBlockProps extends ICallback {
    isDashboard?: boolean;
    isForm?: boolean;
    isEdit: boolean;
    amount?: number;
    isProcessing: boolean;
    errorMessages?: Array<string> | null;
}

class PaymentMethodStripeACHBlock extends React.Component<PaymentMethodStripeACHBlockProps, PaymentMethodStripeACHBlockState> {

    state: PaymentMethodStripeACHBlockState;
    errors: Array<string> = new Array<string>();
    isDashboard: boolean;
    amount: number | undefined;

    constructor(props: PaymentMethodStripeACHBlockProps) {
        super(props);

        this.isDashboard = this.props.isDashboard ?? false;
        this.amount = this.props.amount;

        this.state = {
            isLoading: true,
            success: false,
            errors: [],
            errorMessages: [],
            cards: [],
            cardInfoStored: null,
            cardInfo: null,
            isForm: false,
            isEdit: false,
            isOpenModal: false,
            isDeleting: false,
            isProcessing: false
        }
    }

    onCallback = async (values: any, setFormSubmit: (value: boolean) => void) => {
        this.amount = this.props.amount;

        this.setState({errorMessages: []})
        if (values !== null) {
            if (values?.payment) {
                this.props.onCallback(values, setFormSubmit);
            } else if (values?.list) {
                this.setState({isForm: false, cardInfo: null})
            } else {
                this.setState({errorMessages: []})
                this.addACH(values)
                    .then(() => {
                        // setFormSubmit(false);
                        this.props.onCallback(null)
                    })
                    .catch((errors: IError) => {
                        this.setState({errorMessages: errors.messages});
                        setFormSubmit(false);
                    })
            }

        } else {
            this.setState({isForm: !this.state.isForm, cardInfo: null}, () => {
                this.props.onCallback(null)
            })

        }
    };

    addACH(body: any) {
        return new Promise(async (resolve, reject) => {
            await stripeService.addACH(body)
                .then((res: Array<IStripeACHInfo>) => {
                    this.setState({isForm: !this.state.isForm});
                    resolve(this.setACH(res))
                })
                .catch(((errors: IError) => reject(errors)))
        })
    }

    async deleteACH() {
        this.setState({isDeleting: true, errorMessages: []})

        await stripeService.deleteACH(this.state.cardInfo?.pm_id || '')
            .then(async (res: Array<IStripeACHInfo>) => {
                await this.setACH(res)
            })
            .catch(((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }))
            .finally(() => {
                this.setState({isDeleting: false}, () => {
                });
            })
    }

    async setDefaultACH(card: IStripeACHInfo) {
        card.isLoading = true;
        this.props.onCallback({processing: true})
        this.setState({
            errorMessages: [],
            cards: this.state.cards.map(item => ({...item, is_default: false}))
        }, async () => {
            await stripeService.defaultACH(this.state.cardInfo?.pm_id || '')
                .then(async (res: Array<IStripeACHInfo>) => {
                    await this.setACH(res)
                })
                .catch(((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                }))
                .finally(() => {
                    card.isLoading = false;
                    this.props.onCallback({processing: false})
                })
        })

    }

    getACH = () => {
        return new Promise(resolve => {
            stripeService.getACHList()
                .then((res: Array<IStripeACHInfo>) => {
                    resolve(this.setACH(res))
                })
        })
    }


    setACH(res: Array<IStripeACHInfo>) {
        return new Promise(resolve => {
            const cards = res || null;
            const defaultCard = res.find((s: IStripeACHInfo) => s.is_default)
            this.setState({
                cards: cards,
                isLoading: false,
                isDeleting: false,
                isOpenModal: false,
                isProcessing: false
            }, () => {
                if (this.isDashboard) {
                    this.setState({
                        isForm: !!defaultCard,
                        cardInfo: defaultCard ?? null,
                        cardInfoStored: defaultCard ?? null
                    }, () => {
                        this.props.onCallback({defaultType: this.state.isForm ? 'us_bank_account' : ''})
                        resolve(true);
                    })
                } else {
                    resolve(true);
                }
            });
        })
    }

    async componentDidMount() {
        this.setState({isLoading: true});
        await this.getACH()
    }

    componentDidUpdate(prevProps: PaymentMethodStripeACHBlockProps) {
        if (prevProps.isForm !== this.props.isForm) {
            this.setState({
                isForm: this.props.isForm || false,
                cardInfo: this.state.cardInfo ?? null
            });
        }

        if (!prevProps.isProcessing && this.props.isProcessing !== prevProps.isProcessing) {
            if (!this.state.isProcessing) {
                this.setState({
                    isProcessing: true,
                    cards: this.state.cards.map(item => ({...item, is_default: false}))
                });
            } else {
                this.setState({
                    isProcessing: false
                });
            }
        }

        if (prevProps.amount !== this.props.amount && prevProps.amount !== undefined) {
            this.setState({cardInfo: null, isForm: true})
        }


        if (this.props?.errorMessages !== prevProps?.errorMessages) {
            this.setState({errorMessages: this.props?.errorMessages ?? []})
        }

        if (prevProps?.isEdit !== this.props?.isEdit) {
            this.setState({isEdit: this.props?.isEdit ?? false}, () => {
                this.setState({cardInfo: this.props?.isEdit === true ? null : this.state.cardInfoStored})
            })
        }
    }

    ACHChange = (card: IStripeACHInfo | null) => {
        this.setState({isForm: !this.state.isForm, cardInfo: card}, () => {
            this.amount = undefined;
            this.props.onCallback({type: 'us_bank_account'});
        })

    };

    cardDelete = (card: IStripeACHInfo | null) => {
        this.setState({isOpenModal: true, cardInfo: card})
    };

    cardDefault = (card: IStripeACHInfo) => {
        this.setState({cardInfo: card}, async () => {
            await this.setDefaultACH(card);
        })
    };

    back = () => {
        this.setState({isForm: !this.state.isForm})
    }

    closeModal = () => {
        this.setState({isOpenModal: false, cardInfo: null, errorMessages: []})
    }

    cancel = () => {
        this.setState({isForm: true, cardInfo: this.state.cardInfoStored})
    }


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        {((this.isDashboard && !this.state.isEdit && !this.state.isForm && !this.state.isEdit) ||
                                (this.isDashboard && !this.state.isEdit && this.state.isForm && !this.state.isEdit && this.amount !== undefined) ||
                                !this.isDashboard && !this.state.isForm)
                            && (
                                <>
                                    {!this.isDashboard && (
                                        <div
                                            className="profile__right-title justify-content-between align-items-center d-flex">
                                            <div>Bank Account (ACH) List</div>
                                        </div>
                                    )}

                                    {this.state.cards.length > 0 ? (
                                        <>
                                            <div
                                                className={`${this.state.cards.length > 0 ? 'tile indicators' : ''} content__bottom mt-3 mb-${this.isDashboard ? '2' : '4'}`}>
                                                <>
                                                    {this.state.cards.map((card: IStripeACHInfo) => (
                                                        <div key={card.pm_id}
                                                             className={`d-flex align-items-center gap-20 border p-3 payment-form card-block w-100 ${card.is_default ? 'default' : ''}`}>
                                                            {card.isLoading ? (
                                                                <LoaderBlock width={68} height={68}/>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <Image
                                                                            className={'ach'}
                                                                            src={`/img/ach.svg`}
                                                                            width={55}
                                                                            height={39}
                                                                            alt='ACH'/>
                                                                    </div>
                                                                    <div>
                                                                        <div
                                                                            className={`input__title bold d-flex align-items-center`}>
                                                                            <div>{card.bank_name} *{card.last4}</div>
                                                                            <div>
                                                                                <div className={'d-flex'}>
                                                                                    <button
                                                                                        type="button"
                                                                                        className={`height-auto admin-table-btn ripple ${this.state.isDeleting || this.state.isProcessing ? 'disable' : ''}`}
                                                                                        onClick={() => this.ACHChange(card)}
                                                                                        disabled={this.state.isDeleting || this.state.isProcessing}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className={`nav-icon `}
                                                                                            icon={faEdit}/>
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        className={`height-auto admin-table-btn ripple ${this.state.isDeleting || this.state.isProcessing ? 'disable' : ''}`}
                                                                                        onClick={() => this.cardDelete(card)}
                                                                                        disabled={this.state.isDeleting || this.state.isProcessing}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className={`nav-icon `}
                                                                                            icon={faTrash}/>
                                                                                    </button>
                                                                                    <input type={'radio'}
                                                                                           className={`height-auto admin-table-btn ripple ${this.state.isDeleting || this.state.isProcessing ? 'disable' : ''}`}
                                                                                           checked={card.is_default}
                                                                                           disabled={this.state.isDeleting || this.state.isProcessing}
                                                                                           onChange={() => this.cardDefault(card)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className={'input__title d-flex align-items-center'}>
                                                                            <span>{card.account_holder_type.toUpperCase()}</span>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </>
                                            </div>

                                            {(this.state.cardInfoStored && this.isDashboard) && (
                                                <button
                                                    className={`b-btn-border ripple d-none`}
                                                    onClick={this.cancel}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </>

                                    ) : (
                                        <>
                                            <NoDataBlock primaryText={'No Bank Accounts (ACH) available yet'}/>
                                        </>
                                    )}
                                </>

                            )}

                        {this.state.isForm && (
                            <>
                                <StripeACHForm
                                    card={this.state.cardInfo}
                                    amount={this.amount}
                                    processing={this.state.isProcessing}
                                    errorMessages={this.state.errorMessages}
                                    onCallback={this.onCallback}
                                />
                            </>
                        )}

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={'Do you want to delete this ACH?'}
                               className={'default-modal'}
                        >
                            <div className={'profile__right-wrap-full'}>
                                <div className={'profile__panel row-gap-0'}>
                                    <div className={'profile__info__panel'}>
                                        <div className={'input__box buttons'}>
                                            <button
                                                className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                                type="button"
                                                disabled={this.state.isDeleting}
                                                onClick={() => this.deleteACH()}>Submit
                                            </button>
                                            <button
                                                className={`border-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                                type="button"
                                                disabled={this.state.isDeleting}
                                                onClick={() => this.closeModal()}>Cancel
                                            </button>
                                        </div>
                                    </div>
                                    {this.state.errorMessages.length > 0 && (
                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                    )}
                                </div>
                            </div>
                        </Modal>

                    </>
                )}

            </>

        )
    }
}

export default PaymentMethodStripeACHBlock
