import React from "react";
import CompanyProfileNav from "@/components/company-profile-nav";
import CompanyProfileLogo from "@/components/company-profile-logo";
import Link from "next/link";
import {useRouter} from "next/router";

type SymbolInfoContainerProps = {
    children: React.ReactNode,
}

export default function SymbolInfoContainer({children}: SymbolInfoContainerProps) {

    return (
        <>
            <div className="d-flex align-items-center justify-content-between flex-1">
                <div className="login__bottom">
                    <p>
                        <i className="icon-chevron-left"/> <Link
                        className="login__link"
                        href="/symbols"

                    >Back
                    </Link>
                    </p>
                </div>
            </div>
            <div className="profile section">
                <div className="profile__container">
                    {children}
                </div>
            </div>
        </>

    )
}
