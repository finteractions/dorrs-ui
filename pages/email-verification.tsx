import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import EmailVerificationBlock from "@/components/email-verification-block";
import HomeLayout from "@/components/layouts/home/home-layout";

const EmailVerification: NextPageWithLayout = () => {
    return (
        <EmailVerificationBlock/>
    )
}

EmailVerification.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

EmailVerification.layoutName = "HomeLayout"

export default EmailVerification
