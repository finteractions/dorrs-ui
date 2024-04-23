import React, {useEffect} from "react";
import PortalLayoutWrapper from "@/components/layouts/portal/portal-layout-wrapper";
import authUserGuard from "@/guards/auth-user-guard";
import {DataProvider} from "@/contextes/data-context";
import {ThemeProvider} from "next-themes";
import websocketService from "@/services/websocket/websocket-service";

type DashboardLayoutProps = {
    children: React.ReactNode
}

function PortalLayout({children}: DashboardLayoutProps) {

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');

        return () => {
            websocketService.closeWebSocket(false);
        };
    }, [])

    return (
        <>
            <ThemeProvider attribute="class">
                <DataProvider>
                    <PortalLayoutWrapper>
                        {children}
                    </PortalLayoutWrapper>
                </DataProvider>
            </ThemeProvider>
        </>
    );
}


export default authUserGuard(PortalLayout);
