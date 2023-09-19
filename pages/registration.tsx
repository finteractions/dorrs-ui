import React, {useCallback, useContext, useEffect, useState} from "react";
import RegistrationTypeOfAccountForm from "@/components/registration-type-of-account-form";
import RegistrationPersonalInformationForm from "@/components/registration-personal-information-form";
import RegistrationIdentityVerificationForm from "@/components/registration-identity-verification-form";
import RegistrationResidenceAddressForm from "@/components/registration-residence-address-form";
import RegistrationBankAccountDetailsForm from "@/components/registration-bank-account-details-form";
import RegistrationSignDMCCAgreementForm from "@/components/registration-sign-dmcc-agreement-form";
import {useRouter} from "next/router";
import HomeLogo from "@/components/layouts/home/home-logo";
import RegistrationSetup2faForm from "@/components/registration-setup-2fa-form";
import VerifyOtpForm from "@/components/verify-otp-form";
import {getGlobalConfig} from "@/utils/global-config";
import CookieService from "@/services/cookie/cookie-service";
import LoaderBlock from "@/components/loader-block";
import cookieService from "@/services/cookie/cookie-service";
import {AuthUserContext} from "@/contextes/auth-user-context";
import userService from "@/services/user/user-service";
import AccountApprovalBlock from "@/components/account-approval-block";
import Link from "next/link";

export default function Registration() {

    const PATH = `${getGlobalConfig().host}-wieRegistration`;
    const contextUser = useContext(AuthUserContext);
    const steps = 2;

    const [step, setStep] = useState(-1);
    const [lastStep, setLastStep] = useState(-1);
    const [stepsData, setStepsData] = useState(Array(steps).fill({}));
    const router = useRouter();

    const saveData = useCallback(
        (stepIndex: number, data: {} | object, nextStep = true): void => {
            setStepsData(prevData => {
                const newData = [...prevData];
                newData[stepIndex] = data;
                return newData;
            });

            setStep(prevStep => nextStep ? prevStep + 1 : prevStep - 1);
            setLastStep(prevStep => nextStep ? prevStep + 1 : prevStep - 1);
        },
        []
    );


    const onCallback = (values: any, nextStep = true): void => {

        if (step === 1) {
            setStepsData(Array(steps).fill({}));
            setLastStep(lastStep + 1)
            if (!nextStep) {
                setStep(0);
                setLastStep(0)
            }
        } else {
            saveData(step, values, nextStep);

            if (values?.access_token && values?.refresh_token) {
                contextUser.setAuthState({access_token: values.access_token, refresh_token: values.refresh_token});
            }
        }

    }

    const components: Map<number, any> = new Map<number, any>()
        .set(0,
            <RegistrationTypeOfAccountForm
                key={step}
                initialValues={stepsData[step]}
                onCallback={onCallback}
            />)
        .set(1,
            <RegistrationPersonalInformationForm
                key={step}
                initialValues={[stepsData[step], stepsData[step - 1]]}
                onCallback={onCallback}
            />)
    // .set(2,
    //     <RegistrationSetup2faForm
    //         key={step}
    //         initialValues={stepsData[step]}
    //         onCallback={onCallback}
    //     />)
    // .set(3,
    //     <VerifyOtpForm
    //         key={step}
    //         initialValues={stepsData[step - 1]}
    //         isStep={true}
    //         onCallback={onCallback}
    //         onBack={true}
    //     />)
    // .set(4,
    //     <RegistrationIdentityVerificationForm
    //         key={step}
    //         initialValues={stepsData[step]}
    //         onCallback={onCallback}
    //     />)
    // .set(5,
    //     <RegistrationResidenceAddressForm
    //         key={step}
    //         initialValues={stepsData[step]}
    //         onCallback={onCallback}
    //     />)
    // .set(6,
    //     <RegistrationBankAccountDetailsForm
    //         key={step}
    //         initialValues={stepsData[step]}
    //         onCallback={onCallback}
    //     />)
    // .set(7,
    //     <RegistrationSignDMCCAgreementForm
    //         key={step}
    //         initialValues={stepsData[step]}
    //         onCallback={onCallback}
    //     />);

    const stepTitles: Map<number, any> = new Map<number, any>()
        .set(0, 'Select your account type')
        .set(1, 'Fill in your personal information')
        .set(2, 'Confirm your email')

    useEffect(() => {
        let step = 0;
        const data = JSON.parse(localStorage.getItem(PATH) || 'null');

        if (data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const idx = Number(key);
                const values = value || {}
                saveData(idx, values);
            }
            let stepArray: number[] = Object.keys(data).filter(key => Object.keys(data[key]).length > 0).map(Number);

            step = stepArray.length ? Math.max(...stepArray) + 1 : 0;
        }

        setStep(step);
        setLastStep(step);
    }, [PATH, saveData]);

    useEffect(() => {
        const obj = stepsData.reduce((acc, curr, index) => {
            acc[index] = curr;
            return acc;
        }, {});

        localStorage.setItem(PATH, JSON.stringify(obj));
    }, [PATH, stepsData]);

    useEffect(() => {
        const setup2FA = JSON.parse(CookieService.getItem(`${process.env.TOKEN_NAME}RegistrationSetup2FA`) || 'null');
        if (setup2FA !== null) {
            setStep(-1)
            setLastStep(-1)
            saveData(2, setup2FA, false);
            setStep(2);
            setLastStep(2);
            cookieService.removeItem(`${process.env.TOKEN_NAME}RegistrationSetup2FA`);
        }
    }, [saveData]);


    useEffect(() => {
        if (step === stepsData.length) {
            localStorage.removeItem(PATH);

            setStepsData(Array(steps).fill({}));


            contextUser.clearAuthInfo();

        }
    }, [PATH, step, stepsData.length])


    return (
        <>
            <div className="login sign-up">
                <div className={`login__wrapper ${step === 0 ? 'lg' : ''}`}>

                    <HomeLogo/>
                    <div className="link__block">
                        <Link className="mb-24 login__link" href="/">Get back to Home</Link>
                    </div>
                    <div className="login__block registration">
                        <div className="login__title">Registration</div>

                        {step < stepsData.length && step >= 0 && (
                            <div className="sign-up__step">
                                {stepTitles.get(lastStep)}
                                <div><span>{lastStep + 1}</span><span> | {stepsData.length + 1}</span></div>
                            </div>
                        )}

                        {step < 0 && (
                            <LoaderBlock/>
                        )}

                        {step >= 0 && (
                            components.get(step)
                        )}


                        {step === stepsData.length && (
                            <>
                                <div className="login__title">You have successfully registered!</div>
                                <AccountApprovalBlock isRegistration={true}/>
                                <div className="login__bottom">
                                    <p>
                                        <i className="icon-chevron-left"/>
                                        <Link className="login__link" href="/login">Go to Login</Link>
                                    </p>
                                </div>
                            </>

                        )}
                    </div>

                </div>
            </div>
        </>
    )
}
