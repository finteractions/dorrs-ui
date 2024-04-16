import React from "react";
import Link from "next/link";
import DataFeedProviderLogo from "@/components/data-feed-provider-logo";
import DataFeedProviderNav from "@/components/data-feed-provider-nav";

type DataFeedProviderContainerProps = {
    children: React.ReactNode,
}

export default function DataFeedProviderContainer({children}: DataFeedProviderContainerProps) {

    return (
        <>
            <div className="d-flex align-items-center justify-content-between flex-1">
                <div className="login__bottom">
                    <p>
                        <i className="icon-chevron-left"/> <Link
                        className="login__link"
                        href="/data-feed-providers"

                    >Back
                    </Link>
                    </p>
                </div>
            </div>
            <div className="profile section">
                <div className="profile__container">
                    <div className={'profile__left bg-transparent flex-panel-box pt-0 '}>
                        <div className="panel logo__pannel">
                            <DataFeedProviderLogo/>
                        </div>
                        <div>
                            <div className="profile__left">
                                <DataFeedProviderNav/>
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </>

    )
}
