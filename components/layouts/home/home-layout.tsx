import React from "react";
import HomeSlider from "./home-slider";
import HomeLogo from "./home-logo";
import loginGuard from "@/guards/login-guard";

type HomeLayoutProps = {
    children: React.ReactNode
}

function HomeLayout({ children }: HomeLayoutProps) {
    return (
        <>
            <div className="login">
                <div className="login__right">
                    <div className="login__wrapper">
                        <HomeLogo/>

                        {children}
                    </div>
                </div>
            </div>

        </>
    );
}

export default loginGuard(HomeLayout)
