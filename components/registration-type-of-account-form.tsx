import React, {useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import Image from "next/image";
import {AccountType, getAccountTypeImage} from "@/enums/account-type";

const formSchema = Yup.object().shape({
    account_type: Yup.mixed<AccountType>().oneOf(
        Object.values(AccountType),
        'Invalid Type of Account'
    )
});

let initialValues = {
    account_type: ""
}

class RegistrationTypeOfAccountForm extends React.Component<{ onCallback: (values: any) => void, initialValues?: any }> {


    constructor(props: ICallback) {
        super(props);
        if (Object.getOwnPropertyNames(this.props.initialValues).length !== 0) {
            initialValues = this.props.initialValues;
        }
    }

    handleSubmit = async (values: Record<string, string>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        setSubmitting(false);
        this.props.onCallback(values);
    };

    render() {
        return (
            <Formik
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, submitForm, setFieldValue}) => {

                    useEffect(() => {
                        Object.entries(initialValues).forEach(([key, value]) => {
                            setFieldValue(key, value, true);
                        });
                    }, [setFieldValue]);

                    return (
                        <>
                            <Form>
                                <div className="sign-up__row">
                                    {Object.values(AccountType).map((type) => (
                                        <>
                                            <Field
                                                name="account_type"
                                                id={`account_type_${type}`}
                                                type="radio"
                                                value={type}
                                                className="hidden"
                                                disabled={isSubmitting}
                                                onClick={submitForm}
                                            />
                                            <label className="sign-up__item" htmlFor={`account_type_${type}`}>
                                                <div className="sign-up__item-img">
                                                    <Image src={getAccountTypeImage(type)} width={64} height={64}
                                                           alt={type}/>
                                                </div>
                                                <span>{type}</span>
                                            </label>
                                        </>
                                    ))}
                                </div>
                                <ErrorMessage name="account_type" component="div"
                                              className="error-message"/>
                            </Form>
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"></i> <Link className="login__link"
                                                                                href="/login">Back
                                </Link>
                                </p>
                            </div>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default RegistrationTypeOfAccountForm;
