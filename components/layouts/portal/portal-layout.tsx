import React from "react";
import PortalLayoutWrapper from "@/components/layouts/portal/portal-layout-wrapper";
import authUserGuard from "@/guards/auth-user-guard";
import {DataProvider} from "@/contextes/data-context";

type DashboardLayoutProps = {
    children: React.ReactNode
}

function PortalLayout({children}: DashboardLayoutProps) {

    return (
        <>
            <DataProvider>
                <PortalLayoutWrapper>
                    {children}
                </PortalLayoutWrapper>
            </DataProvider>
        </>
    );
}


export default authUserGuard(PortalLayout);
