import React, { ReactElement, useContext, createContext, useState, useEffect } from "react";
import type { NextPageWithLayout } from "./_app";
import PublicLayout from "@/components/layouts/public/public-layout";
import DashboardBlock from "@/components/public-dashboard/dashboard-block";
import { AuthUserContext } from "@/contextes/auth-user-context";
import PortalLayout from "@/components/layouts/portal/portal-layout";

const LayoutNameContext = createContext<{ layoutName: string; setLayoutName: (name: string) => void }>({
    layoutName: "PublicLayout",
    setLayoutName: () => {}
});

const PublicDashboard: NextPageWithLayout = () => {
    return (
        <>
            <DashboardBlock />
        </>
    );
};

const GetLayout: React.FC<{ page: ReactElement }> = ({ page }) => {
    const authUserContext = useContext(AuthUserContext);
    const { setLayoutName } = useContext(LayoutNameContext);

    useEffect(() => {
        if (authUserContext.isAuthenticated()) {
            setLayoutName("PortalLayout");
        } else {
            setLayoutName("PublicLayout");
        }
    }, [authUserContext, setLayoutName]);

    return authUserContext.isAuthenticated() ? (
        <PortalLayout>
            {page}
        </PortalLayout>
    ) : (
        <PublicLayout>
            {page}
        </PublicLayout>
    );
};

PublicDashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <LayoutNameProvider>
            <GetLayout page={page} />
        </LayoutNameProvider>
    );
};

const LayoutNameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [layoutName, setLayoutName] = useState("PublicLayout");

    useEffect(() => {
        PublicDashboard.layoutName = layoutName;
    }, [layoutName]);

    return (
        <LayoutNameContext.Provider value={{ layoutName, setLayoutName }}>
            {children}
        </LayoutNameContext.Provider>
    );
};

PublicDashboard.layoutName = "PublicLayout";

export default PublicDashboard;
