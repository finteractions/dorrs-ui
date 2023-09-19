import React from "react";
import HomeLogo from "./home-logo";
import loginGuard from "@/guards/login-guard";
import Link from "next/link";

type HomeLayoutProps = {
    children: React.ReactNode
}

function HomeLayout({children}: HomeLayoutProps) {
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
