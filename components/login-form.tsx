import React from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import authService from "@/services/auth/auth-service";
import formValidator from "@/services/form-validator/form-validator";
import AlertBlock from "@/components/alert-block";
import ordersService from "@/services/orders/orders-service";
import adminService from "@/services/admin/admin-service";

const formSchema = Yup.object().shape({
    email:
        Yup.string()
            .email("Invalid email")
            .required("Required"),
    password: formValidator.passwordField
});

const initialValues = {
    email: "",
    password: ""
};

interface LoginFormProps extends ICallback {
    isAdmin: boolean;
}

interface LoginFormState extends IState {
    showPassword: boolean;
}

class LoginForm extends React.Component<LoginFormProps, LoginFormState> {

    state: LoginFormState;

    constructor(props: LoginFormProps) {
        super(props);
        this.state = {
            success: false,
            showPassword: false,
        };
        this.handleTogglePassword = this.handleTogglePassword.bind(this);
    }

    handleTogglePassword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleSubmit = async (values: Record<string, string>,
                          {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const request: Promise<any> = this.props.isAdmin ?
            adminService.login(values) :
            authService.login(values)

        await request
            .then((res: any) => {
                values = Object.assign(values, res);
                this.onCallback(values);
            })
            .catch((errors: IError) => {
                // if (errors.messages.some(item => item.toLowerCase().includes('approve'))) {
                //     this.props.onCallback(errors.values);
                // } else {
                    this.setState({errorMessages: errors.messages});
                // }

            })
            .finally(() => setSubmitting(false));
    };

    onCallback(values: Record<string, string | boolean>) {
        this.props.onCallback(values);
    }

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
                            {
                                this.state.success ? (
                                    <div className="login__title mb-24">You have successfully logged in!</div>
                                ) : (
                                    <>
                                        <div className="login__title">Login</div>
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
                                            <div className="input">
                                                <div className="input__title">Password</div>
                                                <div
                                                    className={`input__wrap ${this.state.showPassword ? "active" : ""}`}>
                                                    <Field
                                                        name="password"
                                                        id="password"
                                                        type={this.state.showPassword ? "text" : "password"}
                                                        className={`input__text input-password ${this.state.showPassword ? "view" : ""}`}
                                                        placeholder="Enter your password"
                                                        autoComplete="current-password"
                                                        disabled={isSubmitting}
                                                    />
                                                    <ErrorMessage name="password" component="div"
                                                                  className="error-message"/>
                                                    <button
                                                        onClick={this.handleTogglePassword}
                                                        type="button"
                                                        tabIndex={-1}
                                                        className="show-password icon-eye"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                type="submit"
                                                disabled={isSubmitting || !isValid || !dirty}
                                            >Login
                                            </button>

                                            {this.state.errorMessages && (
                                                <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                            )}

                                            <Link
                                                href="/forgot-password"
                                                className="forgot-password login__link"
                                            >Forgot password?
                                            </Link>
                                        </Form>

                                        <div className="login__bottom">
                                            <p>Not registered? <Link
                                                href="/registration"
                                                className="login__link"
                                            >Sign Up
                                            </Link>
                                            </p>
                                        </div>
                                    </>
                                )
                            }
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default LoginForm;
