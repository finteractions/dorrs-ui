import React, {SyntheticEvent, useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import PhoneInputField from "@/components/phone-input-field";
import Link from "next/link";
import FormValidator from "../services/form-validator/form-validator";
import authService from "@/services/auth/auth-service";
import AlertBlock from "@/components/alert-block";
import downloadFile from "@/services/download-file/download-file";
import {PRIVACY_POLICY, TERMS_OF_SERVICE} from "@/constants/settings";

const formSchema = Yup.object().shape({
    first_name: FormValidator.firstNameField,
    last_name: FormValidator.lastNameField,
    email:
        Yup.string()
            .email("Invalid email")
            .required("Required"),
    password1: FormValidator.passwordField,
    password2: FormValidator.confirmPasswordField('password1'),
    mobile_number: FormValidator.phoneNumberField,
    agreement: Yup.boolean()
        .oneOf([true],
            "Required")
});

let initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    password1: "",
    password2: "",
    mobile_number: "",
    agreement: false
};

interface RegistrationPersonalInformationFormState extends IState {
    showPassword: boolean;
    showPasswordConfirm: boolean;
    email: string | null;
}


class RegistrationPersonalInformationForm extends React.Component<{ onCallback: (values: any, nextStep: boolean) => void, initialValues?: any }, RegistrationPersonalInformationFormState> {

    state: RegistrationPersonalInformationFormState;
    accountType = '';

    constructor(props: ICallback) {
        super(props);

        this.state = {
            success: false,
            showPassword: false,
            showPasswordConfirm: false,
            email: null
        };

        if (this.props.initialValues) {
            initialValues = (this.props.initialValues?.[0] && Object.getOwnPropertyNames(this.props.initialValues?.[0]).length !== 0) ? this.props.initialValues[0] : initialValues;
            this.accountType = (this.props.initialValues?.[1] && Object.getOwnPropertyNames(this.props.initialValues?.[1]).length !== 0) ? this.props.initialValues[1].account_type : '';
        }

        this.handleTogglePassword = this.handleTogglePassword.bind(this);
        this.handleTogglePasswordConfirm = this.handleTogglePasswordConfirm.bind(this);

    }

    handleSubmit = async (values: Record<string, string | boolean>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null, email: String(values.email)})

        values = Object.assign(values, {account_type: this.accountType});
        await authService.registration(values)
            .then((res: any) => {
                this.setState({success: true});
                values = Object.assign(values, res)
                this.onCallback(values, true);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => setSubmitting(false))
    };

    handleTogglePassword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleTogglePasswordConfirm() {
        this.setState({showPasswordConfirm: !this.state.showPasswordConfirm});
    }

    handleBack(event: SyntheticEvent, values: Record<string, string | boolean>) {
        values = Object.assign(values, {account_type: this.accountType});
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
                            {!this.state.success && (
                                <>
                                    <div className="sign-up__title mb-48">Personal Information</div>
                                    <Form>
                                        <div className="form-wrap">
                                            <div className="input">
                                                <div className="input__wrap">
                                                    <Field
                                                        name="first_name"
                                                        id="first_name"
                                                        type="text"
                                                        className="input__text input-class-1"
                                                        placeholder="First name"
                                                        disabled={isSubmitting}
                                                    />
                                                    <ErrorMessage name="first_name" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                            <div className="input">
                                                <div className="input__wrap">
                                                    <Field
                                                        name="last_name"
                                                        id="last_name"
                                                        type="text"
                                                        className="input__text input-class-2"
                                                        placeholder="Last name"
                                                        disabled={isSubmitting}
                                                    />
                                                    <ErrorMessage name="last_name" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                            <div className="input">
                                                <div className="input__wrap">
                                                    <Field
                                                        name="email"
                                                        id="email"
                                                        type="email"
                                                        className="input__text input-class-3"
                                                        placeholder="Email"
                                                        autoComplete="username"
                                                        disabled={isSubmitting}
                                                    />
                                                    <ErrorMessage name="email" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                            <div className="input">
                                                <div className="input__wrap">
                                                    <Field
                                                        name="mobile_number"
                                                        id="mobile_number"
                                                        component={PhoneInputField}
                                                        country="us"
                                                    />
                                                </div>
                                            </div>
                                            <div className="input">
                                                <div
                                                    className={`input__wrap ${this.state.showPassword ? "active" : ""}`}>
                                                    <Field
                                                        name="password1"
                                                        id="password1"
                                                        type={this.state.showPassword ? "text" : "password"}
                                                        className={`input__text input-password ${this.state.showPassword ? "view" : ""}`}
                                                        placeholder="Enter your password"
                                                        autoComplete="new-password"
                                                        disabled={isSubmitting}
                                                    />
                                                    <button
                                                        onClick={this.handleTogglePassword}
                                                        type="button"
                                                        tabIndex={-1}
                                                        className="show-password icon-eye"
                                                    ></button>
                                                    <ErrorMessage name="password1" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                            <div className="input">
                                                <div
                                                    className={`input__wrap ${this.state.showPasswordConfirm ? "active" : ""}`}>
                                                    <Field
                                                        name="password2"
                                                        id="password2"
                                                        type={this.state.showPasswordConfirm ? "text" : "password"}
                                                        className={`input__text input-password ${this.state.showPasswordConfirm ? "view" : ""}`}
                                                        placeholder="Repeat your password"
                                                        autoComplete="new-password"
                                                        disabled={isSubmitting}
                                                    />
                                                    <button
                                                        onClick={this.handleTogglePasswordConfirm}
                                                        type="button"
                                                        tabIndex={-1}
                                                        className="show-password icon-eye"
                                                    ></button>
                                                    <ErrorMessage name="password2" component="div"
                                                                  className="error-message"/>

                                                </div>
                                            </div>
                                            <div className="b-checkbox b-checkbox">
                                                <Field
                                                    type="checkbox"
                                                    name="agreement"
                                                    id="agreement"
                                                />
                                                <label htmlFor="agreement">
                                                    <span></span><i> I have read and agree to the{" "}
                                                    <Link
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            downloadFile.PDF(TERMS_OF_SERVICE)
                                                        }}
                                                        download
                                                    >Terms of Service
                                                    </Link>
                                                    {" "}and{" "}
                                                    <Link
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            downloadFile.PDF(PRIVACY_POLICY)
                                                        }}
                                                        download
                                                    >
                                                        Privacy Policy
                                                    </Link>
                                                </i>
                                                </label>
                                                <ErrorMessage name="agreement" component="div"
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
                                        <div className="login__bottom">
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
                            )}

                            {this.state.success && (
                                <>
                                    <div className="sign-up__title mb-48">Confirmation link was sent</div>
                                    <div className="login__text">
                                        We have sent an email to <span
                                        className="link-text">{this.state.email}</span> with
                                        a link to confirm the email.
                                    </div>
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

    export default RegistrationPersonalInformationForm;
