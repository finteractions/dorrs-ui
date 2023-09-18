import React from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import Image from "next/image"
import authService from "@/services/auth/auth-service";
import AlertBlock from "@/components/alert-block";

const formSchema = Yup.object().shape({
    email:
        Yup.string()
            .email("Invalid email")
            .required("Required")
});

const initialValues = {
    email: ""
};

interface ForgotPasswordFormProps {
}

interface ForgotPasswordFormState extends IState {
}

class ForgotPasswordForm extends React.Component<ForgotPasswordFormProps, ForgotPasswordFormState> {

    state: ForgotPasswordFormState;

    constructor(props: ICallback) {
        super(props);
        this.state = {
            success: false,
            errorMessages: null
        };
    }

    handleSubmit = async (values: Record<string, string>,
                          {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        await authService.createPasswordForgot(values)
            .then((res => {
                this.setState({success: true});
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    render() {
        return (
            <Formik
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, isValid, dirty, values}) => {
                    return (
                        <>
                            {
                                this.state.success ? (
                                    <>
                                        <div className="login__ico">
                                            <Image src="/img/mail.svg" width={32} height={24} alt="Email"/>
                                        </div>
                                        <div className="login__title">Recovery link was sent</div>
                                        <div className="login__text">
                                            We have sent an email to <span className="link-text">{values.email}</span> with a password reset link.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="login__title">Password Reset</div>
                                        <Form>
                                            <div className="input">
                                                <div className="input__title">Email</div>
                                                <div className="input__wrap">
                                                    <Field
                                                        name="email"
                                                        id="email"
                                                        type="email"
                                                        className="input__text"
                                                        placeholder="Enter your email"
                                                        autoComplete="username"
                                                        disabled={isSubmitting}
                                                    />
                                                    <ErrorMessage name="email" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                            <button
                                                className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                type="submit"
                                                disabled={isSubmitting || !isValid || !dirty}
                                            >Submit
                                            </button>

                                            {this.state.errorMessages && (
                                                <AlertBlock type="error" messages={this.state.errorMessages}/>
                                            )}
                                        </Form>
                                    </>
                                )
                            }

                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/>
                                    <Link className="login__link" href="/login">Back to Login</Link>
                                </p>
                            </div>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default ForgotPasswordForm;
