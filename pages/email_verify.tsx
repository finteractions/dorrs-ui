import React, {ReactElement, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import LoaderBlock from "@/components/loader-block";
import HomeLayout from "@/components/layouts/home/home-layout";

const EmailVerifyPage = () => {
    const router = useRouter();
    const [isRedirected, setIsRedirected] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const _token = urlParams.get('token');
        const {token = null} = router.query;

        if (_token === token && !isRedirected) {
            let redirectUrl = token
                ? `/email-confirmation/?token=${encodeURIComponent(token as string)}`
                : '/email-confirmation';

            router.push(redirectUrl)
            setIsRedirected(true);
        }
    }, [isRedirected, router]);

    return <LoaderBlock/>;
};


EmailVerifyPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

EmailVerifyPage.layoutName = "HomeLayout"

export default EmailVerifyPage
