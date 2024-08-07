import React, { ReactElement, useContext, createContext, useState, useEffect } from "react";
import PublicLayout from "@/components/layouts/public/public-layout";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import { AuthUserContext } from "@/contextes/auth-user-context";

const LayoutNameContext = createContext<{ layoutName: string; setLayoutName: (name: string) => void }>({
    layoutName: "PublicLayout",
    setLayoutName: () => {}
});

const LayoutNameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [layoutName, setLayoutName] = useState("PublicLayout");

    useEffect(() => {
        if (typeof (children as any).type.getLayout === 'function') {
            (children as any).type.layoutName = layoutName;
        }
    }, [layoutName, children]);

    return (
        <LayoutNameContext.Provider value={{ layoutName, setLayoutName }}>
            {children}
        </LayoutNameContext.Provider>
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

export { LayoutNameProvider, GetLayout, LayoutNameContext };
