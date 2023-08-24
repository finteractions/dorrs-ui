import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
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

interface BankAccountFormState extends IState {
    isDeleting: boolean;
}

interface BankAccountFormProps extends ICallback {
    action: string;
    data: IBankAccount | null;
    onCancel?: () => void;
}

class BankAccountForm extends React.Component<BankAccountFormProps, BankAccountFormState> {

    state: BankAccountFormState;

    constructor(props: BankAccountFormProps) {
        super(props);

        this.state = {
            success: false,
            isDeleting: false
        };
    }

    handleSubmit = async (values: Record<string, string | boolean | null>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        if (this.props.action == 'edit') {
            values.is_approved = false;
            values.approved_by = null;
        }

        const request: Promise<any> = this.props.action == 'edit' ?
            kycService.updateBankAccount(values, this.props.data?.id || 0) :
            kycService.createBankAccount(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await kycService.deleteBankAccount(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    };

    render() {
        return (
            <>
                {this.props.action !== 'delete' ? (
                    <Formik
                        initialValues={this.props?.data || initialValues}
                        validationSchema={formSchema}
                        onSubmit={this.handleSubmit}
                    >
                        {({isSubmitting, isValid, dirty}) => {
                            return (
                                <Form id="bank-form">
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
                                    <button id="add-bank-acc"
                                            className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                        {`${this.props.action === 'edit' ? 'Save' : 'Add'} bank account`}
                                    </button>

                                    {this.state.errorMessages && (
                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                    )}
                                </Form>
                            );
                        }}
                    </Formik>
                ) : (
                    <div className="bank-delete">
                        {this.props?.onCancel && (
                            <button className="border-btn ripple"
                                    onClick={() => this.props.onCancel?.()}>Cancel</button>
                        )}
                        <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                type="button" disabled={this.state.isDeleting}
                                onClick={() => this.handleDelete(this.props.data)}>Confirm
                        </button>
                    </div>
                )}
            </>
        );
    }
}

export default BankAccountForm;
