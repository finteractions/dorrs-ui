import React from 'react';
import Link from "next/link";


let isRegistration = false;

class AccountApprovalBlock extends React.Component<{ isRegistration?: boolean }> {

    constructor(props: {}) {
        super(props);
        isRegistration = this.props?.isRegistration ?? false;
    }

    render() {
        return (

            <>
                {!isRegistration && (
                    <div className="login__title">Account Approval</div>
                )}

                <div className="login__text">
                    Your account has not been approved yet so you will not be able to
                    access {process.env.APP_TITLE} services.<br/>
                    {process.env.APP_TITLE} will notify you once we have completed your onboarding process and your
                    account is enabled.
                    {/*If you think there has been an issue please contact MidChains support.*/}
                </div>

                {!isRegistration && (
                    <div className="login__bottom">
                        <p>
                            <i className="icon-chevron-left"/>
                            <Link className="login__link" href="/login">Back to Login</Link>
                        </p>
                    </div>
                )}

            </>
        );
    }
}

export default AccountApprovalBlock;
