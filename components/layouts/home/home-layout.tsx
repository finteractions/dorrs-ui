import React from "react";
import HomeLogo from "./home-logo";
import loginGuard from "@/guards/login-guard";
import Link from "next/link";

type HomeLayoutProps = {
    children: React.ReactNode
}

function HomeLayout({children}: HomeLayoutProps) {
    const handleLinkClick = () => {
        const currentUrl = window.location.href;
        const urlObject = new URL(currentUrl);
        window.location.href = `${urlObject.protocol}//${urlObject.hostname}`;
    };

    return (
        <>
            <div className="login">
                <div className="login__right">
                    <div className="login__wrapper">
                        <HomeLogo/>
                        <div className="link__block">
                            <a className="mb-24 login__link" href="javascript:void(0)" onClick={handleLinkClick}>Get back to Home</a>
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
