import React, {useEffect} from "react";
import BackendLayoutWrapper from "@/components/layouts/backend/backend-layout-wrapper";
import authAdminGuard from "@/guards/auth-admin-guard";
import {DataProvider} from "@/contextes/data-context";

type BackendDashboardLayoutProps = {
    children: React.ReactNode
}

function BackendLayout({children}: BackendDashboardLayoutProps) {
    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, [])

    return (
        <>
            <DataProvider>
                <BackendLayoutWrapper>
                    {children}
                </BackendLayoutWrapper>
            </DataProvider>
        </>
    );
}


export default authAdminGuard(BackendLayout);
