import React from 'react';

import StripeForm from "@/components/payment/stripe-form";
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import stripeService from "@/services/stripe/stripe-service";
import LoaderBlock from "@/components/loader-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Modal from "@/components/modal";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";

interface PaymentMethodBlockState extends IState, IModalState {
    isLoading: boolean;
    errors: string[];
    errorMessages: string[];
    cards: Array<IStripeCardInfo> | [];
    cardInfo: IStripeCardInfo | null;
    isForm: boolean;
    isDeleting: boolean;
    isSetDefault: boolean;
}

interface PaymentMethodBlockProps extends ICallback {
    isDashboard?: boolean;
    amount?: number;
    errorMessages?: Array<string> | null;
}

class PaymentMethodBlock extends React.Component<PaymentMethodBlockProps, PaymentMethodBlockState> {

    state: PaymentMethodBlockState;
    errors: Array<string> = new Array<string>();
    isDashboard: boolean;
    amount: number | undefined;

    constructor(props: PaymentMethodBlockProps) {
        super(props);


        this.isDashboard = this.props.isDashboard ?? false;
        this.amount = this.props.amount;


        this.state = {
            isLoading: true,
            success: false,
            errors: [],
            errorMessages: [],
            cards: [],
            cardInfo: null,
            isForm: false,
            isOpenModal: false,
            isDeleting: false,
            isSetDefault: false
        }
    }

    onCallback = async (values: any, setFormSubmit: (value: boolean) => void) => {
        this.amount = this.props.amount;

        this.setState({errorMessages: []})
        if (values !== null) {
            if (values?.payment) {
                this.props.onCallback(values, setFormSubmit);
            } else {
                this.setState({errorMessages: []})
                this.addCard(values)
                    .then(() => {
                        setFormSubmit(false);
                    })
                    .catch((errors: IError) => {
                        this.setState({errorMessages: errors.messages});
                        setFormSubmit(false);
                    })
            }

        } else {
            this.setState({isForm: !this.state.isForm, cardInfo: null})
        }
    };

    addCard(body: any) {
        return new Promise(async (resolve, reject) => {
            await stripeService.addCard(body)
                .then((res: Array<IStripeCardInfo>) => {

                    this.setState({isForm: !this.state.isForm});
                    resolve(this.setCard(res))
                })
                .catch(((errors: IError) => reject(errors)))
        })
    }

    async deleteCard() {
        this.setState({isDeleting: true, errorMessages: []})

        await stripeService.deleteCard(this.state.cardInfo?.card_id || '')
            .then(async (res: Array<IStripeCardInfo>) => {
                await this.setCard(res)
            })
            .catch(((errors: IError) => {
                this.setState({errorMessages: errors.messages, isDeleting: false});
            }))
    }

    async setDefaultCard(card: IStripeCardInfo) {
        card.isLoading = true;
        this.setState({isSetDefault: true, errorMessages: []})

        await stripeService.defaultCard(this.state.cardInfo?.card_id || '')
            .then(async (res: Array<IStripeCardInfo>) => {
                await this.setCard(res)
            })
            .catch(((errors: IError) => {
                this.setState({errorMessages: errors.messages, isDeleting: false});
            }))
            .finally(() => {
                card.isLoading = false;
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
            const cards = res || null;
            const defaultCard = res.find((s: IStripeCardInfo) => s.is_default)
            this.setState({cards: cards}, () => {
                this.setState({
                    isLoading: false,
                    isDeleting: false,
                    isSetDefault: false,
                    isOpenModal: false
                }, () => {
                    if (this.isDashboard && defaultCard) {
                        this.setState({isForm: true, cardInfo: defaultCard})
                    }
                    this.props.onCallback(null)
                });
                resolve(true);
            });
        })
    }

    async componentDidMount() {
        this.setState({isLoading: true});
        await this.getCard()
    }

    cardChange = (card: IStripeCardInfo | null) => {
        this.setState({isForm: !this.state.isForm, cardInfo: card})
        this.amount = undefined;
    };

    cardDelete = (card: IStripeCardInfo | null) => {
        this.setState({isOpenModal: true, cardInfo: card})
    };

    cardDefault = (card: IStripeCardInfo) => {
        this.setState({cardInfo: card}, async () => {
            await this.setDefaultCard(card);
        })
    };

    back = () => {
        this.setState({isForm: !this.state.isForm})
    }

    closeModal = () => {
        this.setState({isOpenModal: false, cardInfo: null, errorMessages: []})
    }


    render() {
        return (
            <>

                {/*{!this.amount && (*/}
                <div
                    className={`profile__right-title justify-content-between align-items-center d-flex ${!this.state.isForm || (!this.amount || !this.isDashboard) ? 'mt-3' : ''}`}>
                    {!this.isDashboard && (
                        <div>My Payment method</div>
                    )}

                    <div className="content__title_btns content__filter download-buttons justify-content-end">

                        {!this.state.isForm ? (
                            <button className="b-btn ripple width-unset"
                                    onClick={() => this.cardChange(null)}
                            >
                                Add
                            </button>
                        ) : (
                            <>

                                {(!this.amount || !this.isDashboard) && (
                                    <button className="b-btn ripple width-unset"
                                            onClick={() => this.back()}
                                    >
                                        Back
                                    </button>
                                )}
                            </>

                        )}
                    </div>
                </div>
                {/*)}*/}

                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        {!this.state.isForm ? (
                            <>
                                <div
                                    className={`${this.state.cards.length > 0 ? 'tile indicators' : ''} content__bottom mb-3`}>

                                    {this.state.cards.length > 0 ? (
                                        <>
                                            {this.state.cards.map((card: IStripeCardInfo) => (
                                                <div key={card.card_id}
                                                     className={`d-flex align-items-center gap-20 border p-3 payment-form card-block w-100 ${card.is_default ? 'default' : ''}`}>
                                                    {card.isLoading ? (
                                                        <LoaderBlock width={68} height={68}/>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <Image src={`/img/${card.brand.toLowerCase()}.svg`}
                                                                       width={55}
                                                                       height={39}
                                                                       alt={card.brand}/>
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className={`input__title bold d-flex align-items-center`}>
                                                                    <div>{card.brand.toUpperCase()} *{card.last4}</div>
                                                                    <div>
                                                                        <div className={'d-flex'}>
                                                                            <button
                                                                                type="button"
                                                                                className='height-auto admin-table-btn ripple'
                                                                                onClick={() => this.cardChange(card)}
                                                                                disabled={this.state.isDeleting || this.state.isSetDefault}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className={`nav-icon `}
                                                                                    icon={faEdit}/>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className='height-auto admin-table-btn ripple'
                                                                                onClick={() => this.cardDelete(card)}
                                                                                disabled={this.state.isDeleting || this.state.isSetDefault}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className={`nav-icon `}
                                                                                    icon={faTrash}/>
                                                                            </button>
                                                                            <input type={'radio'}
                                                                                   className={'height-auto admin-table-btn ripple'}
                                                                                   checked={card.is_default}
                                                                                   onChange={() => this.cardDefault(card)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={'input__title d-flex align-items-center'}>
                                                                    <span>Expires: {card.exp_month}/{card.exp_year}</span>
                                                                    {card.is_default && (
                                                                        <span
                                                                            className={'default bg-default'}>Default</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <NoDataBlock primaryText={'No cards available yet'}/>
                                    )}

                                </div>
                            </>
                        ) : (
                            <>
                                <StripeForm
                                    card={this.state.cardInfo}
                                    amount={this.amount}
                                    errorMessages={this.state.errorMessages}
                                    onCallback={this.onCallback}
                                />
                            </>
                        )}
                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={'Do you want to delete this card?'}
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
                                                onClick={() => this.deleteCard()}>Submit
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

export default PaymentMethodBlock
