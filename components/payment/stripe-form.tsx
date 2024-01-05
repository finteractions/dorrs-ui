import React, {useEffect, useState} from 'react';
import {useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement} from '@stripe/react-stripe-js';
import {useFormik} from 'formik';
import formatterService from "@/services/formatter/formatter-service";
import * as Yup from 'yup';
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import AlertBlock from "@/components/alert-block";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";

interface StripeFormProps extends ICallback {
    amount?: number;
    card?: IStripeCardInfo | null;
    errorMessages?: Array<string> | null;
}

const StripeForm = (props: StripeFormProps) => {

    const stripe = useStripe();
    const elements = useElements();
    const [isFormSubmit, setFormSubmit] = useState(false);
    const [errorMessages, setErrorMessages] = useState(Array<string> || null)


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
            setErrorMessages([])
            if (!props.card) {
                if (!stripe || !elements) {
                    return;
                }

                const cardElement = elements.getElement(CardNumberElement);

                if (!cardElement) {
                    return;
                }

                setFormSubmit(true);

                const {token, error} = await stripe.createToken(cardElement);

                if (error) {
                    setFormSubmit(false)
                    return;
                }

                props.onCallback(token, setFormSubmit)
            } else {
                setFormSubmit(true);

                props.onCallback({}, setFormSubmit)
            }
        },
    });


    const handleCardChange = (event: any) => {
        formik.setFieldValue(event.elementType, event.complete ? 'valid' : '', true);
    };

    useEffect(() => {

        if (props.card) {
            Object.keys(formik.values).forEach((fieldName) => {
                formik.setFieldValue(fieldName, 'valid', true);
            });
        }
        setTimeout(() => formik.validateForm());

        return () => {
            setErrorMessages([]);
        };
    }, [props.card]);

    useEffect(() => {
        if (props.errorMessages) {
            setErrorMessages(props.errorMessages)
        }
    }, [props.errorMessages]);


    return (
        <>

            <>
                <form className={'mt-2'} onSubmit={formik.handleSubmit}>
                    <>
                        {props.card ? (
                            <>
                                <div className={'mb-4 d-flex align-items-center gap-20'} >
                                    <div>
                                        <Image src={`/img/${props.card.brand.toLowerCase()}.svg`}
                                               width={55} height={39} alt={props.card.brand}/>
                                    </div>
                                    <div>
                                        <div className={'input__title bold d-flex align-items-center'}>
                                            <span>{props.card.brand.toUpperCase()} *{props.card.last4}</span>
                                           <span>
                                               <button
                                                   type="button"
                                                   className='height-auto admin-table-btn ripple disable'
                                                   onClick={() => {

                                                   }}
                                                   disabled={true}
                                               >
                                                <FontAwesomeIcon className="nav-icon"
                                                                 icon={faEdit}/>
                                            </button>
                                           </span>
                                        </div>
                                        <div
                                            className={'input__title'}>Expires: {props.card.exp_month}/{props.card.exp_year}</div>
                                    </div>

                                </div>

                            </>
                        ) : (
                            <>
                                <div className="input__group">
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
                    </>


                    <button
                        className={`b-btn ripple ${!formik.isValid || isFormSubmit ? 'disable' : ''}`}
                        type="submit"
                        disabled={!formik.isValid || isFormSubmit}
                    >
                        Pay {props.amount ? `$${formatterService.numberFormat(props.amount, 2)}` : ''}
                    </button>

                    {errorMessages.length > 0 && (
                        <AlertBlock type={"error"} messages={errorMessages}/>
                    )}
                </form>
            </>

        </>

    );
};

export default StripeForm;
