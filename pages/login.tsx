import React, {ReactElement, useContext, useEffect, useState} from "react"
import type {NextPageWithLayout} from "./_app";
import HomeLayout from "@/components/layouts/home/home-layout";
import LoginForm from "@/components/login-form";
import VerifyOtpForm from "@/components/verify-otp-form";
import {useRouter} from "next/router";
import LoaderBlock from "@/components/loader-block";
import {AuthUserContext} from "@/contextes/auth-user-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import cookieService from "@/services/cookie/cookie-service";
import {getGlobalConfig} from "@/utils/global-config";

const Login: NextPageWithLayout = () => {
    const [step, setStep] = useState(0);
    const [otpToken, setOtpToken] = useState<string>('');
    const router = useRouter();
    const contextUser = useContext(AuthUserContext);
    const contextAdmin = useContext(AuthAdminContext);

    const onCallback = (values: any, nextStep = true): void => {
        if (values.message !== 'success' && values.message?.includes('gauth')) {
            cookieService.setItem(`${process.env.TOKEN_NAME}RegistrationSetup2FA`, JSON.stringify({
                email: values.email,
                otp_token: values.otp_token
            }));
            router.push('/registration');
        } else if (nextStep && !values?.is_approved && !values.is_admin) {
            router.push('/account-approval');
        } else if (values?.access_token && values?.refresh_token) {
            localStorage.removeItem(`${getGlobalConfig().host}-${process.env.TOKEN_NAME}Registration`)
            contextUser.setAuthState({access_token: values.access_token, refresh_token: values.refresh_token});
            if (values.is_admin) contextAdmin.setAuthState({access_token: values.access_token});
            setStep(2);
        } else {
            setStep(nextStep ? step + 1 : step - 1);
            setOtpToken(values?.otp_token || '');
        }
    }

    const components: Map<number, any> = new Map<number, any>()
        .set(0,
            <LoginForm key={step}
                       isAdmin={false}
                       onCallback={onCallback}
            />)
        .set(1,
            <VerifyOtpForm key={step}
                           initialValues={{otp_token: otpToken}}
                           isStep={false}
                           onCallback={onCallback}
                           onBack={true}/>
        )
        .set(2,
            <LoaderBlock key={step}/>)

    useEffect(() => {
        if (step === 2) {
            const routePath = contextAdmin.isAuthenticated() ? '/backend/dashboard' : '/dashboard';
            router.push(routePath);
        }
    }, [step, router]);

    return (
        <>
            {components.get(step)}
        </>
    )
}

Login.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

export default Login
