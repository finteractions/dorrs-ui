import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import HomeLayout from "../components/layouts/home/home-layout";
import ResetPasswordForm from "@/components/reset-password-form";
import { useRouter } from "next/router";

const ResetPassword: NextPageWithLayout = () => {
    const router = useRouter()
    const urlParams = new URLSearchParams(window.location.search);
    const token = router.query.token?.toString() ?? urlParams.get('token') ?? '';

    return (
        <ResetPasswordForm token={token}/>
    )
}

ResetPassword.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

export default ResetPassword
