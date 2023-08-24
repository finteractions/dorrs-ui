import React from "react";
import PortalHeader from "./portal-header";
import portalWrapper from "@/wrappers/portal-wrapper";

type PortalLayoutProps = {
    children: React.ReactNode
}

function PortalLayoutWrapper({children}: PortalLayoutProps) {

    return (
        <>
            <PortalHeader/>
            <div className="content">
                <div className="container">
                    {children}
                </div>
            </div>
        </>
    );
}


export default portalWrapper(PortalLayoutWrapper);
