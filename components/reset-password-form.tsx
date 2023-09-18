import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import Image from 'next/image'
import authService from "@/services/auth/auth-service";
import formValidator from "../services/form-validator/form-validator";
import AlertBlock from "@/components/alert-block";
import jwtService from "@/services/jwt/jwt-service";
import ExchangeAlertBlock from "@/components/exchange-alert-block";

const formSchema = Yup.object().shape({
    new_password: formValidator.passwordField,
    confirm_password: formValidator.confirmPasswordField('new_password')
});

const initialValues = {
    new_password: "",
    confirm_password: ""
};

interface ResetPasswordFormProps {
    token: string;
}

interface ResetPasswordFormState extends IState {
    showPasswordNew: boolean;
    showPasswordNewConfirm: boolean;
    token: string;
    isTokenExpired: boolean;
}

class ResetPasswordForm extends React.Component<ResetPasswordFormProps, ResetPasswordFormState> {

    state: ResetPasswordFormState;

    constructor(props: ResetPasswordFormProps) {
        super(props);
        this.state = {
            success: false,
            errorMessages: null,
            showPasswordNew: false,
            showPasswordNewConfirm: false,
            token: '',
            isTokenExpired: false
        };

        this.handleTogglePasswordNew = this.handleTogglePasswordNew.bind(this);
        this.handleTogglePasswordNewConfirm = this.handleTogglePasswordNewConfirm.bind(this);
    }

    componentDidMount() {
        const token = this.props.token;
        this.setState({token: token});

        this.validateToken(token);
    }

    componentDidUpdate(prevProps: ResetPasswordFormProps) {
        if (this.props.token !== prevProps.token) {
            this.setState({token: this.props.token});
        }
    }

    validateToken(token: string) {
        const decoded = jwtService.decode(token) as ITokenState;

        const resetPasswordState: ITokenState = {
            otp: decoded?.otp,
            expired_time: decoded?.expired_time,
            pk: decoded?.pk
        };

        this.setState({isTokenExpired: !jwtService.verify(resetPasswordState?.expired_time)});

    }

    handleTogglePasswordNew() {
        this.setState({showPasswordNew: !this.state.showPasswordNew});
    }

    handleTogglePasswordNewConfirm() {
        this.setState({showPasswordNewConfirm: !this.state.showPasswordNewConfirm});
    }

    handleSubmit = async (values: Record<string, string>,
                          {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        await authService.createPasswordReset(values, this.state.token)
            .then((res => {
                this.setState({success: true, token: ''});
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
                {({isSubmitting, isValid, dirty}) => {
                    return (
                        <>
                            {this.state.isTokenExpired ? (
                                <>
                                    <ExchangeAlertBlock success={false}
                                                        title={'Password Reset'}
                                                        messages={['Reset password link invalid or expired']}/>

                                    <div className="login__bottom">
                                        <p>
                                            <i className="icon-chevron-left"/>
                                            <Link className="login__link" href="/forgot-password">Back to Forgot
                                                Password</Link>
                                        </p>
                                    </div>

                                </>
                            ) : (
                                <>
                                    {this.state.success ? (
                                        <>
                                            <div className="login__ico">
                                                <Image src="/img/check-ex.svg" width={38} height={26} alt="Check"/>
                                            </div>
                                            <div className="login__title">Password changed</div>
                                            <div className="login__text">
                                                Your password has been changed successfully.<br/>
                                                Please log in with new password.
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="login__title">Password Reset</div>
                                            <Form>
                                                <div className="input">
                                                    <div className="input__title">New Password</div>
                                                    <div
                                                        className={`input__wrap ${this.state.showPasswordNew ? "active" : ""}`}>
                                                        <Field
                                                            name="new_password"
                                                            id="new_password"
                                                            type={this.state.showPasswordNew ? "text" : "password"}
                                                            className={`input__text input-password ${this.state.showPasswordNew ? "view" : ""}`}
                                                            placeholder="Enter your new password"
                                                            autoComplete="new-password"
                                                            disabled={isSubmitting}
                                                        />
                                                        <ErrorMessage name="new_password" component="div"
                                                                      className="error-message"/>
                                                        <button
                                                            onClick={this.handleTogglePasswordNew}
                                                            type="button" tabIndex={-1}
                                                            className="show-password icon-eye"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Confirm Password</div>
                                                    <div
                                                        className={`input__wrap ${this.state.showPasswordNewConfirm ? "active" : ""}`}>
                                                        <Field
                                                            name="confirm_password"
                                                            id="confirm_password"
                                                            type={this.state.showPasswordNewConfirm ? "text" : "password"}
                                                            className={`input__text input-password ${this.state.showPasswordNewConfirm ? "view" : ""}`}
                                                            placeholder="Confirm your new password"
                                                            autoComplete="new-password"
                                                            disabled={isSubmitting}
                                                        />
                                                        <button
                                                            onClick={this.handleTogglePasswordNewConfirm}
                                                            type="button" tabIndex={-1}
                                                            className="show-password icon-eye"
                                                        />
                                                        <ErrorMessage name="confirm_password" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <button
                                                    className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                    type="submit"
                                                    disabled={isSubmitting || !isValid || !dirty}
                                                >Change Password
                                                </button>

                                                {this.state.errorMessages && (
                                                    <AlertBlock type="error" messages={this.state.errorMessages}/>
                                                )}
                                            </Form>
                                        </>
                                    )}

                                    <div className="login__bottom">
                                        <p>
                                            <i className="icon-chevron-left"/>
                                            <Link className="login__link" href="/login">Back to Login</Link>
                                        </p>
                                    </div>
                                </>
                            )}

                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default ResetPasswordForm;
