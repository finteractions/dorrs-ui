import React, {ReactElement, useContext} from "react"
import type {NextPageWithLayout} from "./_app";
import {useRouter} from "next/router";
import EmailConfirmationBlock from "@/components/email-confirmation-block";
import HomeLayout from "@/components/layouts/home/home-layout";
import {AuthUserContext} from "@/contextes/auth-user-context";
import {AuthAdminContext} from "@/contextes/auth-admin-context";

const EmailConfirmation: NextPageWithLayout = () => {
    const router = useRouter()
    const urlParams = new URLSearchParams(window.location.search);
    const token = router.query.token?.toString() ?? urlParams.get('token') ?? '';
    const contextUser = useContext(AuthUserContext);
    const contextAdmin = useContext(AuthAdminContext);

    const onCallback = (): void => {
        router.push('/profile');
    }

    const onAuth = (values: any): void => {
        if (values?.access_token) {
            contextUser.setAuthState({access_token: values.access_token, refresh_token: values.refresh_token});
            if (values.is_admin) contextAdmin.setAuthState({access_token: values.access_token});
        }
    }

    return (
        <EmailConfirmationBlock
            token={token}
            onCallback={onCallback}
            onAuth={onAuth}
        />
    )
}

EmailConfirmation.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

EmailConfirmation.layoutName = "HomeLayout"

export default EmailConfirmation
