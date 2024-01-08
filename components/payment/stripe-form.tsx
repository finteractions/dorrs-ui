import React, {useEffect, useState} from 'react';
import {useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement} from '@stripe/react-stripe-js';
import {useFormik} from 'formik';
import formatterService from "@/services/formatter/formatter-service";
import * as Yup from 'yup';
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import AlertBlock from "@/components/alert-block";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faEdit} from "@fortawesome/free-solid-svg-icons";

interface StripeFormProps extends ICallback {
    amount?: number;
    card?: IStripeCardInfo | null;
    errorMessages?: Array<string> | null;
    title?: string
}

const StripeForm = (props: StripeFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isFormSubmit, setFormSubmit] = useState(false);
    const [isFormEdit, setFormEdit] = useState(false);
    const [errorMessages, setErrorMessages] = useState(Array<string> || null);

    const formik = useFormik({
        initialValues: {
            cardNumber: '',
            cardExpiry: '',
            cardCvc: '',
        },
        validationSchema: Yup.object({
            cardNumber: Yup.string().required(),
            cardExpiry: Yup.string().required(),
            cardCvc: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            setErrorMessages([]);

            let callbackObj = {} as any;

            if (isFormEdit) {
                if (!stripe || !elements) {
                    return;
                }

                const cardElement = elements.getElement(CardNumberElement);

                if (!cardElement) {
                    return;
                }

                setFormSubmit(true);

                try {
                    const {token, error} = await stripe.createToken(cardElement);

                    if (error) {
                        throw new Error(error.message);
                    }

                    callbackObj.token = token

                    if (props.card?.card_id) {
                        callbackObj.card_id = props.card.card_id
                    }

                    props.onCallback(callbackObj, setFormSubmit);
                } catch (error: any) {
                    setErrorMessages([error.message]);
                    setFormSubmit(false);
                }
            } else {
                setFormSubmit(true);
                props.onCallback(callbackObj, setFormSubmit);
            }
        },
    });

    const handleCardChange = (event: any) => {
        formik.setFieldValue(event.elementType, event.complete ? 'valid' : '', true);
    };

    const cardChange = () => {
        setFormEdit(!isFormEdit);
    };

    useEffect(() => {
        setFormEdit(!props?.card);
    }, [props.card]);

    useEffect(() => {
        if (isFormEdit) {
            Object.keys(formik.values).forEach((fieldName) => {
                formik.setFieldValue(fieldName, '', true);
            });
        } else {
            Object.keys(formik.values).forEach((fieldName) => {
                formik.setFieldValue(fieldName, 'values', true);
            });
        }

        setTimeout(() => formik.validateForm());
        return () => {
            setErrorMessages([]);
        };
    }, [isFormEdit]);

    useEffect(() => {
        if (props.errorMessages) {
            setErrorMessages(props.errorMessages);
        }
    }, [props.errorMessages]);

    useEffect(() => {
        return () => {
            if (elements) {
                const cardElement = elements.getElement(CardNumberElement);
                if (cardElement) {
                    cardElement.clear();
                }
            }
        };
    }, [elements]);

    return (
        <>
            {props.title && (
                <div className={'profile__right-title'}>{props.title}</div>
            )}
            <div className={'profile__right-wrap-full'}>
                <form className={'mt-2'} onSubmit={formik.handleSubmit}>
                    {props.card && (
                        <>
                            <div className={'d-flex align-items-center gap-20'}>
                                <div>
                                    <Image src={`/img/${props.card.brand.toLowerCase()}.svg`} width={55} height={39}
                                           alt={props.card.brand}/>
                                </div>
                                <div>
                                    <div
                                        className={`input__title bold d-flex align-items-center ${isFormSubmit ? 'disable' : ''}`}>
                                        <span>{props.card.brand.toUpperCase()} *{props.card.last4}</span>
                                        <span>
                                        {!isFormEdit && (
                                            <button
                                                type="button"
                                                className='height-auto admin-table-btn ripple'
                                                onClick={cardChange}
                                                disabled={isFormSubmit}
                                            >
                                                <FontAwesomeIcon
                                                    className={`nav-icon ${isFormEdit ? 'cancel-action' : ''}`}
                                                    icon={isFormEdit ? faClose : faEdit}/>
                                            </button>
                                        )}

                                    </span>
                                    </div>
                                    <div
                                        className={'input__title'}>Expires: {props.card.exp_month}/{props.card.exp_year}</div>
                                </div>
                            </div>
                        </>
                    )}
                    {isFormEdit && (
                        <>
                            <div className="input__group mb-0 mt-4">
                                <div className="input">
                                    <div className="input__title">Card number <i>*</i></div>
                                    <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                        <CardNumberElement
                                            className={'input__text'}
                                            onChange={handleCardChange}
                                            options={{
                                                disabled: isFormSubmit,
                                                showIcon: true,
                                                iconStyle: 'default',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Expiration <i>*</i></div>
                                    <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                        <CardExpiryElement
                                            className={'input__text'}
                                            onChange={handleCardChange}
                                            options={{
                                                disabled: isFormSubmit,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">CVC <i>*</i></div>
                                    <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                        <CardCvcElement
                                            className={'input__text'}
                                            onChange={handleCardChange}
                                            options={{
                                                disabled: isFormSubmit,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className={'profile__panel'}>
                        <div className={'profile__info__panel'}>
                            <div className={'input__box buttons'}>
                                {props.amount ? (
                                    <button
                                        className={`mt-4 b-btn ripple  ${!formik.isValid || isFormSubmit ? 'disable' : ''}`}
                                        type="submit"
                                        disabled={!formik.isValid || isFormSubmit}
                                    >
                                        Pay {props.amount ? `$${formatterService.numberFormat(props.amount, 2)}` : ''}
                                    </button>
                                ) : (

                                    <>
                                        {isFormEdit && (
                                            <button
                                                className={`mt-4 b-btn ripple ${!formik.isValid || isFormSubmit ? 'disable' : ''}`}
                                                type="submit"
                                                disabled={!formik.isValid || isFormSubmit}
                                            >
                                                Save
                                            </button>
                                        )}
                                    </>
                                )}

                                {isFormEdit && props.card && (
                                    <button
                                        className={`mt-4 b-btn-border ripple ${isFormSubmit ? 'disable' : ''}`}
                                        type="button"
                                        onClick={cardChange}
                                        disabled={isFormSubmit}
                                    >
                                        Cancel
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>


                    {errorMessages.length > 0 && (
                        <AlertBlock type={"error"} messages={errorMessages}/>
                    )}
                </form>
            </div>
        </>
    );
};

export default StripeForm;
