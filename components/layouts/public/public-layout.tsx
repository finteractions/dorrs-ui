import React, {useEffect} from "react";
import Link from "next/link";
import {initializeGoogleTagManager} from '@/js/googleTagManager';
import HomeLogo from "@/components/layouts/home/home-logo";
import websocketService from "@/services/websocket/websocket-service";
import {ThemeProvider} from "next-themes";
import {DataProvider} from "@/contextes/data-context";
import ScrollToTop from "@/components/layouts/scroll-to-top";
import PublicLayoutWrapper from "@/components/layouts/public/public-layout-wrapper";
import publicGuard from "@/guards/public-guard";
import authUserGuard from "@/guards/auth-user-guard";

type HomeLayoutProps = {
    children: React.ReactNode
}

function PublicLayout({children}: HomeLayoutProps) {

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
                    <PublicLayoutWrapper>
                        {children}
                    </PublicLayoutWrapper>
                </DataProvider>
            </ThemeProvider>
            <ScrollToTop/>
        </>
    );
}

export default publicGuard(PublicLayout);
