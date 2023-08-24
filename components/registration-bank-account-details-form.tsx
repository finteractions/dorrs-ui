import React, {SyntheticEvent, useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";

import kycService from "@/services/kyc/kyc-service";
import {CURRENCIES} from "@/constants/currencies";
import AlertBlock from "@/components/alert-block";

const formSchema = Yup.object().shape({
    currency: Yup.string().uppercase().length(3).required('Required'),
    beneficiary_name: Yup.string().min(3).max(99).required('Required').label('Account Name'),
    account_number: Yup.string().min(3).max(99).required('Required').label('Account Number'),
    iban: Yup.string().min(3).max(99).required('Required').label('IBAN/ABA'),
    swift: Yup.string().min(3).max(99).required('Required').label('SWIFT Code'),
    bank_name: Yup.string().min(3).max(99).required('Required').label('Bank Name'),
    bank_address: Yup.string().min(3).max(255).required('Required').label('Bank Address')
});

let initialValues = {
    currency: "",
    beneficiary_name: "",
    account_number: "",
    iban: "",
    swift: "",
    bank_name: "",
    bank_address: "",
};

interface RegistrationBankAccountDetailsFormState extends IState {
    id?: number;
}

class RegistrationBankAccountDetailsForm extends React.Component<{ onCallback: (values: any, nextStep: boolean) => void, initialValues?: any }, RegistrationBankAccountDetailsFormState> {

    state: RegistrationBankAccountDetailsFormState;

    constructor(props: ICallback) {
        super(props);

        this.state = {
            success: false
        };

        if (Object.getOwnPropertyNames(this.props.initialValues).length !== 0) {
            initialValues = this.props.initialValues;

            kycService.getBankAccounts()
                .then((res: Array<IBankAccount>) => {
                    this.setState({id: res[0].id})
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages})
                }).finally(() => {
            });
        }
    }


    handleSubmit = async (values: Record<string, string | boolean>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const request: Promise<any> = kycService.createBankAccount(values);

        await request
            .then((res: any) => {
                this.onCallback(values, true);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => setSubmitting(false))
    };

    handleBack(event: SyntheticEvent, values: Record<string, string | boolean>) {
        event.preventDefault();
        this.onCallback(values, false);
    }

    onCallback(values: Record<string, string | boolean>, nextStep: boolean) {
        this.props.onCallback(values, nextStep);
    }

    render() {
        return (
            <Formik
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, isValid, values, setFieldValue}) => {
                    useEffect(() => {
                        Object.entries(initialValues).forEach(([key, value]) => {
                            setFieldValue(key, value, true);
                        });
                    }, [setFieldValue]);

                    return (
                        <>
                            <div className="sign-up__title mb-48">Bank account details</div>
                            <Form>
                                <div className="input">
                                    <div className="input__title">Currency <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="currency"
                                            id="currency"
                                            as="select"
                                            className="b-select"
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Select currency</option>
                                            {CURRENCIES.map(currency => (
                                                <option value={currency.code}
                                                        key={currency.code}>{currency.name}</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="currency" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Bank Account Holder Name or Company <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="beneficiary_name"
                                            id="beneficiary_name"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type name"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="beneficiary_name" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Account Number <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="account_number"
                                            id="account_number"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type account number"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="account_number" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">IBAN/ABA <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="iban"
                                            id="iban"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type IBAN/ABA"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="iban" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">SWIFT Code <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="swift"
                                            id="swift"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type SWIFT code"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="swift" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Name of Bank <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="bank_name"
                                            id="bank_name"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type bank name"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="bank_name" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Bank Address <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="bank_address"
                                            id="bank_address"
                                            as="textarea"
                                            rows="5"
                                            className="input__textarea"
                                            placeholder="Type bank address"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="bank_address" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                )}
                                <button
                                    className={`b-btn ripple ${(isSubmitting || !isValid) ? 'disable' : ''}`}
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                >Continue
                                </button>
                                <div className="login__bottom d-none">
                                    <p>
                                        <i className="icon-chevron-left"></i> <Link className="login__link"
                                                                                    href=""
                                                                                    onClick={(event) => this.handleBack(event, values)}
                                    >Back
                                    </Link>
                                    </p>
                                </div>
                            </Form>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default RegistrationBankAccountDetailsForm;
