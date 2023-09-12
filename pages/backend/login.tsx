import React, {ReactElement, useContext, useEffect, useState} from "react"
import HomeLayout from "@/components/layouts/home/home-layout";
import LoginForm from "@/components/login-form";
import VerifyOtpForm from "@/components/verify-otp-form";
import {useRouter} from "next/router";
import LoaderBlock from "@/components/loader-block";
import {NextPageWithLayout} from "@/pages/_app";
import {AuthAdminContext} from "@/contextes/auth-admin-context";
import {AuthUserContext} from "@/contextes/auth-user-context";

const Login: NextPageWithLayout = () => {
    const [step, setStep] = useState(0);
    const [otpToken, setOtpToken] = useState<string>('');
    const router = useRouter();
    const contextUser = useContext(AuthUserContext);
    const contextAdmin = useContext(AuthAdminContext);

    const onCallback = (values: any, nextStep = true): void => {

        if (values?.access_token && values?.refresh_token) {
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
        if (step === 2) router.push('/backend/dashboard');
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

Login.layoutName = "HomeLayout"

export default Login
