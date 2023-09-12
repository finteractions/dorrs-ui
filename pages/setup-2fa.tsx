import React, { ReactElement, useState } from "react"
import type { NextPageWithLayout} from "./_app";
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import HomeLayout from "../components/layouts/home/home-layout";
import AuthService from "@/services/auth/auth-service";
import {G_AUTH_ISSUER} from "@/constants/settings";

const QrCode = dynamic(() => import('../components/qr-code'), {
    ssr: false
})

interface Setup2faState extends IState{
    secretKey: string;
}

const Setup2fa: NextPageWithLayout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Setup2faState>();

    const router = useRouter();

    async function setup2fa () {
        setIsLoading(true);
        await AuthService.setup2fa({})
            .then((res => {
                setData({success: true, secretKey: 'W2L6DPB32TKGVF4JYKM3LIOSEVVSXNA7If'});
            }))
            .catch(error => {
            }).finally(() => {
                setIsLoading(false);
            });
    }

    function complete2fa () {
        router.push('/dashboard');
    }

    function getQRCodeGoogleUrl(name: string, secret: string, issuer: string): string {
        return `otpauth://totp/${encodeURIComponent(name)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
    }

    return (
        <>
            {!data ? (
                <>
                    <div className="login__ico">
                        <Image src="/img/shield.svg" width={33} height={42} alt="Shield"/>
                    </div>
                    <div className="login__title mb-24">Setup 2FA</div>
                    <div className="login__text mb-48">
                        You have not enable Two Factor authentication on your account.
                        Please setup 2FA now to continue using WI EXCHANGE OTC using the button below.
                    </div>
                    <button className={`b-btn ripple ${isLoading ? 'disable' : ''}`}
                            disabled={isLoading} onClick={setup2fa}
                    >Setup 2FA
                    </button>
                </>
            ) : (
                <>
                    <div className="login__title mb-24">Scan QR with Google Auth</div>
                    <div className="login__text mb-32">
                        <small>To enable Google 2FA , please scan the QR code below using your Google Authenticator app or you can register the Timed OTP for your account by entering the</small>
                        <span>&quot;secret key&quot; : {data.secretKey}</span>
                        <small> You are experiencing any issues, please reach out to a member of the WI EXCHANGE team and we will be happy to assist you.</small>
                    </div>
                    <div className="login__qr">
                        <QrCode data={getQRCodeGoogleUrl('User', data.secretKey, G_AUTH_ISSUER)} />
                    </div>
                    <button className="b-btn ripple" onClick={complete2fa}>Complete Setup</button>
                </>
            )}
        </>
    )
}

Setup2fa.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

Setup2fa.layoutName = "HomeLayout"

export default Setup2fa
