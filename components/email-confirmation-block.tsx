import React from 'react';
import Image from 'next/image'
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import userService from "@/services/user/user-service";
import Link from "next/link";
import jwtService from "@/services/jwt/jwt-service";
import ExchangeAlertBlock from "@/components/exchange-alert-block";

interface EmailConfirmationBlockState extends IState {
    token: string;
    isTokenExpired: boolean;
    isLoading: boolean
}

interface EmailConfirmationBlockProps extends ICallback {
    token: string;
}

class EmailConfirmationBlock extends React.Component<EmailConfirmationBlockProps, EmailConfirmationBlockState> {
    state: EmailConfirmationBlockState;

    constructor(props: EmailConfirmationBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: false,
            errorMessages: null,
            token: '',
            isTokenExpired: false
        };
    }

    async componentDidMount() {
        const token = this.props.token;
        this.setState({token: token});

        const isTokenExpired = this.validateToken(token);

        if (!isTokenExpired) await this.checkEmailConfirmation(token); // : this.onCallback();
    }

    validateToken(token: string): boolean {
        const decoded = jwtService.decode(token) as ITokenState;

        const resetPasswordState: ITokenState = {
            otp: decoded?.otp,
            expired_time: decoded?.expired_time,
            pk: decoded?.pk
        };
        const isTokenExpired = !jwtService.verify(resetPasswordState?.expired_time);
        this.setState({isTokenExpired: isTokenExpired});

        return isTokenExpired

    }

    async checkEmailConfirmation(token: string) {
        this.setState({isLoading: true});


        await userService.createEmailConfirmation(token)
            .then((() => {
                this.setState({success: true});
            }))
            .catch((errors: IError) => {
                this.setState({success: false, errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isLoading: false})
                // this.onCallback();
            });
    }

    onCallback() {
        setTimeout(() => {
            this.props.onCallback(null);
        }, 2000);
    }

    render() {
        return (
            <>
                {this.state.isTokenExpired ? (
                    <>
                        <ExchangeAlertBlock success={false}
                                            title={'Email Confirmation'}
                                            messages={['Email Confirmation link invalid or expired']}/>
                        <div className="login__bottom">
                            <p>
                                <i className="icon-chevron-left"/>
                                <Link className="login__link" href="/login">Back to Login</Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                {this.state.success && (
                                    <>
                                        <div className="login__ico">
                                            <Image src="img/check-ex.svg" width={38} height={26} alt="Check"/>
                                        </div>
                                        <div className="login__title mb-24">Email confirmed</div>
                                        <div className="login__text">
                                            Your email has been confirmed successfully.<br/>
                                            Please log in.
                                        </div>
                                    </>
                                )}

                                {this.state.errorMessages && (
                                    <AlertBlock type="error" messages={this.state.errorMessages}/>
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
                )}

            </>
        );
    }
}

export default EmailConfirmationBlock;
