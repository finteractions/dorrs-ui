import React from "react";
import CompanyProfileNav from "@/components/company-profile-nav";
import CompanyProfileLogo from "@/components/company-profile-logo";
import Link from "next/link";
import {useRouter} from "next/router";

type CompanyProfileContainerProps = {
    children: React.ReactNode,
}

export default function CompanyProfileContainer({children}: CompanyProfileContainerProps) {

    return (
        <>
            <div className="d-flex align-items-center justify-content-between flex-1">
                <div className="login__bottom">
                    <p>
                        <i className="icon-chevron-left"/> <Link
                        className="login__link"
                        href="/asset-profiles"

                    >Back
                    </Link>
                    </p>
                </div>
            </div>
            <div className="profile section">
                <div className="profile__container">
                    <div className={'profile__left bg-transparent flex-panel-box pt-0 '}>
                        <div className="panel logo__pannel">
                            <CompanyProfileLogo/>
                        </div>
                        <div>
                            <div className="profile__left">
                                <CompanyProfileNav/>
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </>

    )
}
