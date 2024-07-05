import React, {useEffect} from "react";
import Link from "next/link";
import {initializeGoogleTagManager} from '@/js/googleTagManager';
import HomeLogo from "@/components/layouts/home/home-logo";

type HomeLayoutProps = {
    children: React.ReactNode
}

function PublicLayout({children}: HomeLayoutProps) {

    useEffect(() => {
        initializeGoogleTagManager(process.env.GTM_CODE);
    }, []);

    return (
        <>
            <div className="public-container">
                <div className="login__right">
                    <div className="login__wrapper">
                        <HomeLogo/>
                        <div className="link__block">
                            <Link className="mb-24 login__link" href="/">Get back to Home</Link>
                        </div>
                        <div className="login__block">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default PublicLayout
