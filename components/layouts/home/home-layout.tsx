import React, {useEffect} from "react";
import HomeLogo from "./home-logo";
import loginGuard from "@/guards/login-guard";
import Link from "next/link";
import {initializeGoogleTagManager} from '@/js/googleTagManager';

type HomeLayoutProps = {
    children: React.ReactNode
}

function HomeLayout({children}: HomeLayoutProps) {

    useEffect(() => {
        initializeGoogleTagManager(process.env.GTM_CODE);
    }, []);

    return (
        <>
            <div className="login">
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

export default loginGuard(HomeLayout)
