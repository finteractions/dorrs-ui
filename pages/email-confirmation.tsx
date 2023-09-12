import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import {useRouter} from "next/router";
import EmailConfirmationBlock from "@/components/email-confirmation-block";
import HomeLayout from "@/components/layouts/home/home-layout";

const EmailConfirmation: NextPageWithLayout = () => {
    const router = useRouter()
    const urlParams = new URLSearchParams(window.location.search);
    const token = router.query.token?.toString() ?? urlParams.get('token') ?? '';

    const onCallback = (values: any): void => {
        router.push('/dashboard');
    }

    return (
        <EmailConfirmationBlock
            token={token}
            onCallback={onCallback}/>
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
