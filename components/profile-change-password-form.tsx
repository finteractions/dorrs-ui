import React from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import userService from "@/services/user/user-service";
import formValidator from "@/services/form-validator/form-validator";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import VerifyOtpForm from "@/components/verify-otp-form";

const formSchema = Yup.object().shape({
    old_password: formValidator.passwordField,
    new_password: formValidator.passwordField,
    confirm_password: formValidator.confirmPasswordField('new_password')
});

let initialValues = {
    old_password: "",
    new_password: "",
    confirm_password: ""
};

type ProfileChangePasswordFormFields = {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

interface ProfileChangePasswordFormState extends IState {
    showPassword: boolean;
    showPasswordNew: boolean;
    step: number;
    isProcessing: boolean;
    formValues: Record<string, string>;
    isFormDirty: boolean;
}

class ProfileChangePasswordForm extends React.Component<{}, ProfileChangePasswordFormState> {

    state: ProfileChangePasswordFormState;

    initialValues: ProfileChangePasswordFormFields;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            errorMessages: null,
            showPassword: false,
            showPasswordNew: false,
            step: 0,
            isProcessing: false,
            formValues: initialValues,
            isFormDirty: false,
        };

        this.initialValues = initialValues;

        this.handleTogglePassword = this.handleTogglePassword.bind(this);
        this.handleTogglePasswordNew = this.handleTogglePasswordNew.bind(this);
    }

    handleTogglePassword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleTogglePasswordNew() {
        this.setState({showPasswordNew: !this.state.showPasswordNew});
    }

    handleNext = (): void => {
        this.setState({step: this.state.step + 1});
    }

    handleBack = () => {
        this.setState({step: this.state.step - 1});
        Object.assign(this.initialValues, this.state.formValues);
        this.setState({isFormDirty: true})
    }

    handleSubmit = async (values: Record<string, string>) => {
        this.setState({success: false, errorMessages: null, formValues: values, isFormDirty: false});
        this.handleNext();
    };

    onCallbackOTP = async (values: any, step: boolean) => {
        this.setState({isProcessing: true});
        this.handleNext();

        const {withdraw_token} = values;
        const data = Object.assign(this.state.formValues, {otp_token: withdraw_token});

        await this.changePassword(data);
    };

    changePassword = async (values: Record<string, string>) => {
        userService.createChangePassword(values)
            .then((res => {
                this.setState({success: true});
                this.initialValues = initialValues;
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isProcessing: false, step: 0, isFormDirty: false});

                setTimeout(() => {
                    this.setState({success: false});
                }, 3000);
        });
    };

    render() {
        return (
            <>
                <div className="profile__right-title">Change Password</div>
                <div className="profile__right-wrap">
                    {this.state.step === 0 && (
                        <Formik
                            initialValues={this.initialValues}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, isValid, dirty, errors,touched}) => {
                                return (
                                    <Form>
                                        <div className="input">
                                            <div className="input__title">Current password <i>*</i></div>
                                            <div className={`input__wrap ${this.state.showPassword ? "active" : ""}`}>
                                                <Field
                                                    name="old_password"
                                                    id="old_password"
                                                    type={this.state.showPassword ? "text" : "password"}
                                                    className={`input__text input-password ${this.state.showPassword ? "view" : ""}`}
                                                    placeholder="Enter your current password"
                                                    autoComplete="current-password"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="old_password" component="div"
                                                              className="error-message"/>
                                                <button
                                                    onClick={this.handleTogglePassword}
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="show-password icon-eye"
                                                />
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">New password <i>*</i></div>
                                            <div className={`input__wrap ${this.state.showPasswordNew ? "active" : ""}`}>
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
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="show-password icon-eye"
                                                />
                                            </div>
                                        </div>
                                        {/*{errors.new_password && touched.new_password &&*/}
                                        {/*    <div className="profile__allert">*/}
                                        {/*        <div className="profile__allert-title">Your password must have:</div>*/}
                                        {/*        <div className="profile__allert-item"><i className="icon-x"/> 8-50 characters </div>*/}
                                        {/*        <div className="profile__allert-item"><i className="icon-x"/> 1 uppercase &amp; 1 lowercase character</div>*/}
                                        {/*        <div className="profile__allert-item"><i className="icon-x"/> 1 number</div>*/}
                                        {/*    </div>*/}
                                        {/*}*/}
                                        <div className="input">
                                            <div className={`input__wrap ${this.state.showPasswordNew ? "active" : ""}`}>
                                                <Field
                                                    name="confirm_password"
                                                    id="confirm_password"
                                                    type={this.state.showPasswordNew ? "text" : "password"}
                                                    className={`input__text input-password ${this.state.showPasswordNew ? "view" : ""}`}
                                                    placeholder="Confirm your new password"
                                                    autoComplete="new-password"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="confirm_password" component="div"
                                                              className="error-message"/>
                                                <button
                                                    onClick={this.handleTogglePasswordNew}
                                                    type="button"
                                                    tabIndex={-1}
                                                    className="show-password icon-eye"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className={`b-btn ripple ${(isSubmitting || !isValid || (!dirty && !this.state.isFormDirty)) ? 'disable' : ''}`}
                                            type="submit" disabled={isSubmitting || !isValid || (!dirty && !this.state.isFormDirty)}
                                        >Save Password
                                        </button>
                                    </Form>
                                );
                            }}
                        </Formik>
                    )}

                    {this.state.step === 1 && (
                        <div className="login__wrapper">
                            <VerifyOtpForm
                                initialValues={{otp_token: ''}}
                                isStep={false}
                                isPassword={true}
                                onCallback={this.onCallbackOTP}
                                onBack={false}
                            />
                        </div>
                    )}

                    {this.state.isProcessing && (
                        <LoaderBlock/>
                    )}

                    {this.state.errorMessages && (
                        <AlertBlock type="error"
                                    messages={this.state.errorMessages}/>
                    )}

                    {this.state.success && (
                        <AlertBlock type="success"
                                    messages={['Your password successfully changed']}/>
                    )}

                    {this.state.step > 0 && !this.state.isProcessing && (
                        <div className="login__wrapper">
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/>
                                    <button className="login__link"
                                            onClick={this.handleBack}>
                                        Back
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default ProfileChangePasswordForm;
