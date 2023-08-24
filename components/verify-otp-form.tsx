import React, {SyntheticEvent} from "react";
import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import authService from "@/services/auth/auth-service";
import OtpCodeInputField from "./otp-code-input-field";
import AlertBlock from "@/components/alert-block";
import Link from "next/link";


const formSchema = Yup.object().shape({
    otp:
        Yup.string()
            .required()
            .matches(/^[0-9]+$/, 'Must be only digits')
            .min(6, 'Must be exactly 6 digits')
            .max(6, 'Must be exactly 6 digits')
});

const initialValues = {
    otp: ""
};

interface VerifyOtpFormProps {
    onCallback: (values: any, nextStep: boolean) => void;
    initialValues?: { otp_token: string };
    isStep?: boolean;
    isWithdraw?: boolean;
    isPassword?: boolean;
    onBack?: boolean;
}

interface VerifyOtpFormState extends IState {
}

class VerifyOtpForm extends React.Component<VerifyOtpFormProps, VerifyOtpFormState> {

    state: VerifyOtpFormState;
    otpToken: string;
    isStep: boolean;
    isWithdraw: boolean;
    isPassword: boolean;

    constructor(props: ICallback, context: IAuthContext) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
        };

        this.otpToken = this.props.initialValues?.otp_token || '';
        this.isStep = this.props.isStep || false;
        this.isWithdraw = this.props.isWithdraw || false;
        this.isPassword = this.props.isPassword || false;
    }

    handleSubmit = async (values: Record<string, string>,
                          {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        values = Object.assign(values, {otp_token: this.otpToken});

        const request: Promise<any> = (!this.isWithdraw && !this.isPassword) ?
            authService.verifyOtp(values) : authService.createWithdrawVerifyTotp(values);

        await request
            .then((res: any) => {
                values = Object.assign(values, res)
                this.onCallback(values, true);
            })
            .catch((error: IError) => {
                this.setState({errorMessages: error.messages});
            })
            .finally(() => setSubmitting(false));
    };

    handleBack(event: SyntheticEvent, values: Record<string, string | boolean>) {
        event.preventDefault();
        values = Object.assign(values, {otp_token: this.otpToken});
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
                {({isSubmitting, isValid, dirty, values}) => {
                    return (
                        <>
                            {this.state.successMessage && (
                                <>
                                    {this.isStep && !this.isWithdraw ? (
                                        <div className="sign-up__title mb-48">Enter OTP</div>
                                    ) : (
                                        <div className="login__title mb-24">Enter OTP</div>
                                    )}
                                </>
                            )}

                            <div className="login__text mb-24">
                                Enter OTP code from your authenticator App
                            </div>
                            <Form>
                                <div className="login__code">
                                    <Field
                                        name="otp"
                                        id="otp"
                                        component={OtpCodeInputField}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <button
                                    className={`b-btn ripple code-verify ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                    type="submit" disabled={isSubmitting || !isValid || !dirty}
                                >Verify
                                </button>

                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                )}

                                {this.props?.onBack && (
                                    <div className="login__bottom">
                                        <p>
                                            <i className="icon-chevron-left"/>
                                            <Link className="login__link" href=""
                                                  onClick={(event) => this.handleBack(event, values)}
                                            >Back
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </Form>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default VerifyOtpForm;
