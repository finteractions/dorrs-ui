import React, {useCallback, useContext, useEffect, useState} from "react";
import PortalHeader from "./portal-header";
import layoutWrapper from "@/wrappers/layout-wrapper";
import PortalSidebar from "@/components/layouts/portal/sidebar/portal-sidebar";
import {useResizeDetector} from "react-resize-detector";
import {SidebarOverlay} from "@/components/layouts/backend/sidebar/sidebar";
import {AuthUserContext} from "@/contextes/auth-user-context";

type PortalLayoutProps = {
    children: React.ReactNode;
};

function PortalLayoutWrapper({children}: PortalLayoutProps) {
    const [isShowSidebar, setIsShowSidebar] = useState(false);
    let loaded = false;
    // Show status for md screen and above
    const [isShowSidebarMd, setIsShowSidebarMd] = useState(true);

    const toggleIsShowSidebar = () => {
        setIsShowSidebar(!isShowSidebar);
    };

    const toggleIsShowSidebarMd = () => {
        const newValue = !isShowSidebarMd;
        localStorage.setItem("isPortalShowSidebarMd", newValue ? "true" : "false");
        window.dispatchEvent(new Event("isPortalShowSidebarMd"));
        setIsShowSidebarMd(newValue);
    };

    // Clear and reset sidebar
    const resetIsShowSidebar = () => {
        setIsShowSidebar(false);
    };

    const onResize = useCallback(() => {
        resetIsShowSidebar();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1366) {
                setIsShowSidebar(false);
                setIsShowSidebarMd(false);
            }
        };

        const hideSidebar = () => {
            if (window.innerWidth < 1366) {
                setIsShowSidebar(false);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('hideSidebar', hideSidebar);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('hideSidebar', hideSidebar);
        };
    }, []);

    const {ref} = useResizeDetector({onResize});

    const authUserContext = useContext(AuthUserContext)
    // On first time load only
    useEffect(() => {
        if (localStorage.getItem("isPortalShowSidebarMd")) {
            setIsShowSidebarMd(
                localStorage.getItem("isPortalShowSidebarMd") === "true"
            );
        }
    }, [setIsShowSidebarMd]);

    useEffect(() => {
        return () => {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.removeAttribute('style');
        };
    }, []);

    useEffect(() => {
        if (!authUserContext.isAuthenticated() && !loaded) {
            toggleIsShowSidebarMd();
            loaded = true;
        }
    }, []);

    return (
        <div className="portal">
            <div ref={ref} className="position-absolute w-100"/>
            <PortalSidebar
                isShow={isShowSidebar}
                isShowMd={isShowSidebarMd}
                toggleIsShowSidebarMd={toggleIsShowSidebarMd}
            />

            <div className={"wrapper d-flex flex-column min-vh-100"}>
                <PortalHeader toggleSidebar={toggleIsShowSidebar}/>
                <div className="content">
                    <div className="container-fluid">{children}</div>
                </div>
            </div>
            <SidebarOverlay
                isShowSidebar={isShowSidebar}
                toggleSidebar={toggleIsShowSidebar}
            />
        </div>
    );
}

export default layoutWrapper(PortalLayoutWrapper);
