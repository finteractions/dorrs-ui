import React, {useContext} from "react";
import PortalNav from "@/components/layouts/portal/portal-nav";
import PublicLogo from "@/components/layouts/public/public-logo";
import {AuthUserContext} from "@/contextes/auth-user-context";
import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
    toggleSidebar: () => void;
}

function PublicHeader(props: HeaderProps) {
    const authUserContext = useContext(AuthUserContext);

    return (
        <header className="header sticky-top">
            <div className={'sidebar'}>
                <div className={'sidebar-brand d-flex align-items-center justify-content-center'}>
                    <PublicLogo/>
                </div>
            </div>
            {!authUserContext.isAuthenticated() && window.innerWidth < 768 && (
                <div className={'sidebar-mob'}>
                    <div className={'sidebar-brand d-flex align-items-center justify-content-center'}>
                        <Link href="/dashboard" className="b-logo">
                                <span className={'b-logo'}>
                                    <Image src="/img/logo-small.png" width={34.25} height={40} alt="Logo" priority/>
                                </span>
                        </Link>
                    </div>
                </div>
            )}
            <PortalNav/>

        </header>
    )
}

export default PublicHeader
