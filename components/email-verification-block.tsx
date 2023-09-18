import React from 'react';
import Image from 'next/image'
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import userService from "@/services/user/user-service";
import Link from "next/link";
import {AuthUserContext} from "@/contextes/auth-user-context";

interface EmailVerificationBlockState extends IState {
    isLoading: boolean;
    email: string | null
    clearUserAuthInfo: () => void
}

class EmailVerificationBlock extends React.Component<{}, EmailVerificationBlockState> {

    static contextType = AuthUserContext;
    declare context: React.ContextType<typeof AuthUserContext>
    state: EmailVerificationBlockState;

    constructor(props: {}, context: IAuthContext) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            email: null,
            isLoading: false,
            clearUserAuthInfo: () => {
            }
        };
    }

    async componentDidMount() {
        const {user_id} = this.context?.authState;
        const {clearUserAuthInfo} = this.context;

        this.setState({email: user_id, clearUserAuthInfo: clearUserAuthInfo})
        await this.sendEmailVerification(user_id);
    }

    async sendEmailVerification(email: string) {
        this.setState({isLoading: true});

        const data = {email: email}
        await userService.createEmailVerification(data)
            .then((res => {
                this.setState({success: true});
            }))
            .catch((errors: IError) => {
                this.setState({success: false, errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isLoading: false})
                this.state.clearUserAuthInfo();
            });
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {this.state.success && (
                            <>
                                <div className="login__ico">
                                    <Image src="img/mail.svg" width={32} height={24} alt="Email"/>
                                </div>
                                <div className="login__title">Confirmation link was sent</div>
                                <div className="login__text">
                                    We have sent an email to <span className="link-text">{this.state.email}</span> with
                                    a link to confirm the email.
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
        );
    }
}

export default EmailVerificationBlock;
