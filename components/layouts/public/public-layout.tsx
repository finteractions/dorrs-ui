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
        const root = document.documentElement;

        document.documentElement.classList.add('light');
    }, []);

    return (
        <>
            <div className="public-container">
                <div className="public-container-block">
                    <div className="public-container-wrapper">
                        <HomeLogo/>
                        <div className="public-container-link-block">
                            <Link className="mb-24 login__link" href="/">Get back to Home</Link>
                        </div>
                        {children}
                    </div>
                </div>
            </div>

        </>
    );
}

export default PublicLayout
