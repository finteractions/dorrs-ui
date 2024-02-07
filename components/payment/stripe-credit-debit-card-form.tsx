import React, {useEffect, useState} from 'react';
import {useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement} from '@stripe/react-stripe-js';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import formatterService from "@/services/formatter/formatter-service";
import {countries} from "countries-list";
import {IStripeCardInfo} from "@/interfaces/i-stripe-card-info";
import AlertBlock from "@/components/alert-block";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";

interface StripeCreditDebitFormProps extends ICallback {
    amount?: number;
    card?: IStripeCardInfo | null;
    errorMessages?: Array<string> | null;
}

const validationSchema = Yup.object({
    cardNumber: Yup.string().required(),
    cardExpiry: Yup.string().required(),
    cardCvc: Yup.string().required(),
    cardholderName: Yup.string().required(),
    address1: Yup.string().required(),
    address2: Yup.string(),
    city: Yup.string().required(),
    zip_code: Yup.string().required(),
    country: Yup.string().required()
});

const StripeCreditDebitCardForm = (props: StripeCreditDebitFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isFormSubmit, setFormSubmit] = useState(false);
    const [isFormEdit, setFormEdit] = useState(false);
    const [isCardShow, setCardShow] = useState(false);
    const [errorMessages, setErrorMessages] = useState<Array<string> | null>(null);

    useEffect(() => {
        setErrorMessages(null)

        if (props?.amount) {
            if (props?.card) {
                setFormEdit(false);
                setCardShow(true);
            } else {
                setFormEdit(true);
            }
        } else {
            setCardShow(true);
            setFormEdit(true);
        }
    }, [props.amount, props.card]);

    useEffect(() => {
        if (props.errorMessages) {
            setErrorMessages(props.errorMessages);
        }
    }, [props.errorMessages]);

    const cardChange = () => {
        props.onCallback(null);
    };

    const cardList = () => {
        props.onCallback({list: true});
    };
    return (
        <Formik
            initialValues={{
                cardNumber: '',
                cardExpiry: '',
                cardCvc: '',
                cardholderName: '',
                address1: '',
                address2: '',
                city: '',
                zip_code: '',
                country: ''
            }}
            validationSchema={isFormEdit ? validationSchema : null}
            onSubmit={async (values) => {
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

                        if (props.card?.pm_id) {
                            callbackObj.pm_id = props.card.pm_id
                        }

                        props.onCallback(callbackObj, setFormSubmit);
                    } catch (error: any) {
                        setErrorMessages([error.message]);
                        setFormSubmit(false);
                    }
                } else {
                    callbackObj.amount = props.amount
                    callbackObj.pm_id = props.card?.pm_id
                    callbackObj.payment = true;

                    setFormSubmit(true);
                    props.onCallback(callbackObj, setFormSubmit);
                }

            }}
        >
            {({
                  isSubmitting,
                  isValid,
                  dirty,
                  setFieldValue,
                  errors
              }) => {
                const formIsValid = isValid && dirty;

                const handleCardChange = (event: any) => {
                    let fieldName;
                    switch (event.elementType) {
                        case 'cardNumber':
                            fieldName = 'cardNumber';
                            break;
                        case 'cardExpiry':
                            fieldName = 'cardExpiry';
                            break;
                        case 'cardCvc':
                            fieldName = 'cardCvc';
                            break;
                        default:
                            fieldName = '';
                    }

                    if (fieldName) {
                        setFieldValue(fieldName, event.complete ? 'valid' : '', true);
                    }
                };

                return (
                    <Form className={'payment-form'}>
                        <div className={'profile__right-wrap-full'}>
                            {isCardShow && props.card && (
                                <>
                                    <div className={'tile indicators content__bottom mt-3 mb-2'}>
                                        <div
                                            className={'d-flex align-items-center gap-20 border p-3 payment-form card-block w-100'}>
                                            <div>
                                                <Image src={`/img/${props.card.brand.toLowerCase()}.svg`} width={55}
                                                       height={39}
                                                       alt={props.card.brand}/>
                                            </div>
                                            <div>
                                                <div
                                                    className={`input__title bold d-flex align-items-center`}>
                                                    <div>{props.card.brand.toUpperCase()} *{props.card.last4}</div>
                                                    <div>
                                                        <div className={'d-flex'}>
                                                            <button
                                                                type="button"
                                                                className={`height-auto admin-table-btn ripple`}
                                                                onClick={cardList}
                                                            >
                                                                <FontAwesomeIcon
                                                                    className={`nav-icon `}
                                                                    icon={faEdit}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className={'input__title d-flex align-items-center'}>Expires: {props.card.exp_month}/{props.card.exp_year}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isFormEdit && (
                                <>
                                    <div className="input mb-0 mt-2">
                                        <div className="input__title">Card Information</div>
                                        <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                            <CardNumberElement
                                                className={'input__text'}
                                                onChange={handleCardChange}
                                                options={{
                                                    // disabled: isFormSubmit,
                                                    showIcon: true,
                                                    iconStyle: 'default',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input__group mb-0 mt-2">
                                        <div className="input">
                                            <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                                <CardExpiryElement
                                                    className={'input__text'}
                                                    onChange={handleCardChange}
                                                    options={{
                                                        // disabled: isFormSubmit,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className={` ${isFormSubmit ? 'disable' : ''}`}>
                                                <CardCvcElement
                                                    className={'input__text'}
                                                    onChange={handleCardChange}
                                                    options={{
                                                        // disabled: isFormSubmit,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input mb-0 mt-4">
                                        <label className="input__title">Cardholder Name</label>
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                type="text"
                                                className="input__text"
                                                placeholder={'Full name on card'}
                                                name="cardholderName"
                                                disabled={isFormSubmit}
                                            />
                                        </div>
                                    </div>

                                    <div className="input mb-0 mt-4">
                                        <label className="input__title">Billing Address</label>
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                type="text"
                                                className="input__text"
                                                placeholder={'Address 1'}
                                                name="address1"
                                                disabled={isFormSubmit}
                                            />
                                        </div>
                                    </div>
                                    <div className="input mb-0 mt-2">
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                type="text"
                                                className="input__text"
                                                placeholder={'Address 2 (optional)'}
                                                name="address2"
                                                disabled={isFormSubmit}
                                            />
                                        </div>
                                    </div>
                                    <div className="input__group mb-0 mt-2">
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                type="text"
                                                className="input__text"
                                                placeholder={'City'}
                                                name="city"
                                                disabled={isFormSubmit}
                                            />
                                        </div>
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                type="text"
                                                className="input__text"
                                                placeholder={'ZIP Code'}
                                                name="zip_code"
                                                disabled={isFormSubmit}
                                            />
                                        </div>
                                    </div>
                                    <div className="input mb-0 mt-4">
                                        <label className="input__title">Country</label>
                                        <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                            <Field
                                                as="select"
                                                name="country"
                                                className="b-select bg-transparent"
                                                disabled={isFormSubmit}
                                            >
                                                <option value="">Select a Country</option>
                                                {Object.keys(countries).map((countryCode: string) => (
                                                    <option key={countryCode} value={countryCode}>
                                                        {countries[countryCode as keyof typeof countries]?.name}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className={'profile__panel'}>
                                <div className={'profile__info__panel'}>
                                    <div className={'input__box buttons'}>
                                        {!isFormEdit ? (
                                            <button
                                                className={`mt-2 b-btn ripple  ${isFormSubmit ? 'disable' : ''}`}
                                                type="submit"
                                                disabled={isFormSubmit}
                                            >
                                                Pay {props.amount ? `$${formatterService.numberFormat(props.amount, 2)}` : ''}
                                            </button>
                                        ) : (

                                            <>
                                                <button
                                                    className={`mt-4 b-btn ripple ${!formIsValid || isFormSubmit ? 'disable' : ''}`}
                                                    type="submit"
                                                    disabled={!formIsValid || isFormSubmit}
                                                >
                                                    Save
                                                </button>
                                            </>
                                        )}

                                        {isFormEdit && (
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


                            {errorMessages && errorMessages.length > 0 && (
                                <AlertBlock type={"error"} messages={errorMessages}/>
                            )}

                        </div>
                    </Form>
                )

            }}
        </Formik>
    );
};

export default StripeCreditDebitCardForm;
