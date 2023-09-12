import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import HomeLayout from "../components/layouts/home/home-layout";
import ForgotPasswordForm from "@/components/forgot-password-form";

const ForgotPassword: NextPageWithLayout = () => {
    return (
        <ForgotPasswordForm/>
    )
}

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

ForgotPassword.layoutName = "HomeLayout"

export default ForgotPassword
