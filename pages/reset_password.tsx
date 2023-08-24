import React, {ReactElement, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import LoaderBlock from "@/components/loader-block";
import HomeLayout from "@/components/layouts/home/home-layout";

const ResetPasswordPage = () => {
    const router = useRouter();
    const [isRedirected, setIsRedirected] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const _token = urlParams.get('token');
        const {token = null} = router.query;

        if (_token === token && !isRedirected) {
            let redirectUrl = token
                ? `/reset-password/?token=${encodeURIComponent(token as string)}`
                : '/reset-password';

            router.push(redirectUrl)
            setIsRedirected(true);
        }
    }, [isRedirected, router]);

    return <LoaderBlock/>;
};


ResetPasswordPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

export default ResetPasswordPage
