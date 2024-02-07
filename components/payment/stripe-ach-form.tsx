import React, {useEffect, useState} from 'react';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import AlertBlock from '@/components/alert-block';
import formatterService from "@/services/formatter/formatter-service";
import {getStripeAccountHolderTypeName, StripeAccountHolderType} from "@/enums/stripe-account-holder-type";
import Image from "next/image";
import {IStripeACHInfo} from "@/interfaces/i-stripe-ach-info";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";

interface StripeACHFormProps extends ICallback {
    amount?: number;
    card?: IStripeACHInfo | null;
    errorMessages?: Array<string> | null;
}

const validationSchema = Yup.object({
    accountHolderName: Yup.string().required('Required'),
    routingNumber: Yup.string().required('Required'),
    accountNumber: Yup.string().required('Required'),
    accountHolderType: Yup.mixed<StripeAccountHolderType>()
        .oneOf(
            Object.values(StripeAccountHolderType),
            'Invalid Account Holder'
        )
        .required('Required'),
});

const StripeACHForm = (props: StripeACHFormProps) => {
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
                accountHolderName: '',
                routingNumber: '',
                accountNumber: '',
                accountHolderType: '',
            }}
            validationSchema={isFormEdit ? validationSchema : null}
            onSubmit={async (values) => {
                setErrorMessages([]);

                let callbackObj = {} as any;

                if (isFormEdit) {
                    if (!stripe || !elements) {
                        return;
                    }

                    setFormSubmit(true);

                    try {
                        const data = {
                            country: 'US',
                            currency: 'usd',
                            routing_number: values.routingNumber,
                            account_number: values.accountNumber,
                            account_holder_name: values.accountHolderName,
                            account_holder_type: values.accountHolderType,
                        }

                        const {token, error} = await stripe.createToken('bank_account', data);

                        if (error) {
                            throw new Error(error.message);
                        }

                        callbackObj.token = token;
                        
                        if (props.card?.pm_id) {
                            callbackObj.pm_id = props.card.pm_id
                        }

                        props.onCallback(callbackObj, setFormSubmit);
                    } catch (error: any) {
                        setErrorMessages([error.message]);
                        setFormSubmit(false);
                    }
                } else {
                    callbackObj.amount = props.amount;
                    callbackObj.pm_id = props.card?.pm_id;
                    callbackObj.payment = true;

                    setFormSubmit(true);
                    props.onCallback(callbackObj, setFormSubmit);
                }
            }}
        >{({
               isSubmitting,
               isValid,
               dirty,
               errors
           }) => {
            const formIsValid = isValid && dirty;

            return (
                <Form className={'payment-form'}>
                    <div className={'profile__right-wrap-full'}>
                        {isCardShow && props.card && (
                            <>
                                <div className={'tile indicators content__bottom mt-3 mb-2'}>
                                    <div
                                        className={'d-flex align-items-center gap-20 border p-3 payment-form card-block w-100'}>

                                        <div>
                                            <Image src={`/img/ach.svg`}
                                                   width={55}
                                                   height={39}
                                                   alt='ACH'/>
                                        </div>
                                        <div>
                                            <div
                                                className={`input__title bold d-flex align-items-center ${isFormSubmit ? 'disable' : ''}`}>
                                                <div>{props.card.bank_name} *{props.card.last4}</div>
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
                                                className={'input__title d-flex align-items-center'}>
                                                <span>{props.card.account_holder_type.toUpperCase()}</span>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </>
                        )}

                        {(isFormEdit) && (
                            <>
                                <div className="input mb-0 mt-2">
                                    <label className="input__title">Account Holder Name</label>
                                    <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                        <Field
                                            type="text"
                                            name="accountHolderName"
                                            className="input__text"
                                            placeholder="Full name on account"
                                            disabled={isFormSubmit}
                                        />
                                        <ErrorMessage name="accountHolderName" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                <div className="input mb-0 mt-4">
                                    <label className="input__title">Account Number</label>
                                    <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                        <Field
                                            type="text"
                                            name="accountNumber"
                                            className="input__text"
                                            placeholder="Account number"
                                            disabled={isFormSubmit}
                                        />
                                        <ErrorMessage name="accountNumber" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                <div className="input mb-0 mt-4">
                                    <label className="input__title">Routing Number</label>
                                    <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                        <Field
                                            type="text"
                                            name="routingNumber"
                                            className="input__text"
                                            placeholder="Routing number"
                                            disabled={isFormSubmit}
                                        />
                                        <ErrorMessage name="routingNumber" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                <div className="input mb-0 mt-4">
                                    <label className="input__title">Account Holder Type</label>
                                    <div className={'input__group mb-0'}>
                                        {Object.values(StripeAccountHolderType).map((type) => (
                                            <React.Fragment key={type}>
                                                <div className={`input ${isFormSubmit ? 'disable' : ''}`}>
                                                    <div className={'b-radio'}>
                                                        <Field
                                                            type="radio"
                                                            name="accountHolderType"
                                                            id={`accountHolderType${type}`}
                                                            value={type}
                                                            disabled={isFormSubmit}
                                                        />
                                                        <label className="" htmlFor={`accountHolderType${type}`}>
                                                            <span></span>
                                                            <i>{getStripeAccountHolderTypeName(type)}</i>
                                                        </label>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <ErrorMessage name="accountHolderType" component="div"
                                                  className="error-message"/>
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
                            <AlertBlock type={'error'} messages={errorMessages}/>
                        )}

                    </div>

                </Form>
            );
        }}
        </Formik>
    );
};

export default StripeACHForm;
