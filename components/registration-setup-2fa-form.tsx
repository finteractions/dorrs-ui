import React, {SyntheticEvent} from 'react';
import authService from "@/services/auth/auth-service";
import LoaderBlock from "@/components/loader-block";
import dynamic from "next/dynamic";
import AlertBlock from "@/components/alert-block";
import {G_AUTH_ISSUER} from "../constants/settings";


interface RegistrationSetup2faFormState extends IState {
    secretKey: string;
    isContinue: boolean;
}

const QrCode = dynamic(() => import('@/components/qr-code'), {
    ssr: false,
    loading: () => <LoaderBlock/>
})

class RegistrationSetup2faForm extends React.Component<{ onCallback: (values: any, nextStep: boolean) => void, initialValues?: { email: string, otp_token: string } }, RegistrationSetup2faFormState> {

    state: RegistrationSetup2faFormState;
    email: string;
    otpToken: string;

    constructor(props: ICallback) {
        super(props);

        this.state = {
            success: false,
            isContinue: false,
            secretKey: ''
        };

        this.otpToken = this.props.initialValues?.otp_token || '';
        this.email = this.props.initialValues?.email || '';

        this.scanOTP();
    }

    async scanOTP() {
        await authService.setup2fa({otp_token: this.otpToken})
            .then((res: any) => {
                this.setState({secretKey: res.gauth_secret_key, isContinue: true})
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
    }


    handleSubmit = async (values: Record<string, string | boolean>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null})

        await authService.registration(values)
            .then((res: any) => {
                this.onCallback(res, true);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => setSubmitting(false))
    };

    handleContinue(event: SyntheticEvent) {
        event.preventDefault();
        this.onCallback({otp_token: this.otpToken}, true);
    }

    handleBack(event: SyntheticEvent) {
        event.preventDefault();
        this.onCallback({otp_token: this.otpToken}, false);
    }

    getQRCodeGoogleUrl(name: string, secret: string, issuer: string): string {
        return `otpauth://totp/${encodeURIComponent(name)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
    }

    onCallback(values: Record<string, string | boolean>, nextStep: boolean) {
        this.props.onCallback(values, nextStep);
    }

    render() {
        return (
            <>
                <div className="sign-up__title mb-48">Scan QR with Google Auth</div>

                {this.state.secretKey ? (
                    <>
                        <div className="sign-up__text">
                            <small>To enable Google 2FA, please scan the QR code below using your Google Authenticator
                                app or you can register the Timed OTP for your account by entering the</small>
                            <span>&quot;secret key&quot; : {this.state.secretKey}</span>
                            <small>You are experiencing any issues, please reach out to a member of the WI EXCHANGE team
                                and we will be happy to assist you.</small>
                        </div>

                        <div className="login__qr">
                            <QrCode data={this.getQRCodeGoogleUrl(this.email, this.state.secretKey, G_AUTH_ISSUER)}/>
                        </div>
                    </>
                ) : (
                    <LoaderBlock/>
                )}

                {this.state.errorMessages && (
                    <AlertBlock type="error" messages={this.state.errorMessages}/>
                )}

                <button
                    className={`b-btn ripple ${!this.state.isContinue ? 'disable' : ''}`}
                    type="button"
                    disabled={!this.state.isContinue}
                    onClick={(event) => this.handleContinue(event)}
                >
                    Continue
                </button>
            </>

        );
    }
}

export default RegistrationSetup2faForm;
