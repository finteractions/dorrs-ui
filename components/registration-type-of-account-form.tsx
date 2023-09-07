import React, {useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import Image from "next/image";

const formSchema = Yup.object().shape({
    account_type: Yup.mixed<"User Portal" | `DORRS Member` | "DORRS Admin">().oneOf(
        ["User Portal", "DORRS Member", "DORRS Admin"],
        "Invalid Type of Account"
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
                            <div className="sign-up__title mb-24">Type of Account</div>
                            <div className="login__text">
                                Choose the type of account you want to register
                            </div>
                            <Form>
                                <div className="sign-up__row">
                                    <Field
                                        name="account_type"
                                        id="account_type_user_portal"
                                        type="radio"
                                        value="User Portal"
                                        className="hidden"
                                        disabled={isSubmitting}
                                        onClick={() => submitForm()}
                                    />
                                    <label className="sign-up__item"
                                           htmlFor="account_type_user_portal">
                                        <div className="sign-up__item-img">
                                            <Image src="/img/accountType.svg" width={64} height={64} alt="Hotel Guest"/>
                                        </div>
                                        <span>User Portal</span>
                                    </label>
                                    <Field
                                        name="account_type"
                                        id="account_dorrs_member"
                                        type="radio"
                                        value="DORRS Member"
                                        className="hidden"
                                        disabled={isSubmitting}
                                        onClick={() => submitForm()}
                                    />
                                    <label className="sign-up__item"
                                           htmlFor="account_dorrs_member">
                                        <div className="sign-up__item-img">
                                            <Image src="/img/accountType2.svg" width={64} height={64} alt="Employee"/>
                                        </div>
                                        <span>DORRS Member</span>
                                    </label>
                                    <Field
                                        name="account_type"
                                        id="account_dorrs_admin"
                                        type="radio"
                                        value="DORRS Admin"
                                        className="hidden"
                                        disabled={isSubmitting}
                                        onClick={() => submitForm()}
                                    />
                                    <label className="sign-up__item"
                                           htmlFor="account_dorrs_admin">
                                        <div className="sign-up__item-img">
                                            <Image src="/img/accountType3.svg" width={64} height={64} alt="Vendor"/>
                                        </div>
                                        <span>DORRS Admin</span>
                                    </label>
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
