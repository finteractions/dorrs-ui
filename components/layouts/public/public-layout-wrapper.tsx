import React, { useCallback, useEffect, useState } from "react";
import PortalSidebar from "@/components/layouts/portal/sidebar/portal-sidebar";
import { useResizeDetector } from "react-resize-detector";
import { SidebarOverlay } from "@/components/layouts/backend/sidebar/sidebar";
import PortalHeader from "@/components/layouts/portal/portal-header";
import PublicHeader from "@/components/layouts/public/public-header";

type PortalLayoutProps = {
    children: React.ReactNode;
};

function PublicLayoutWrapper({ children }: PortalLayoutProps) {
    const [isShowSidebar, setIsShowSidebar] = useState(false);

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

    const { ref } = useResizeDetector({ onResize });

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

    return (
        <div className="portal">
            <div ref={ref} className="position-absolute w-100" />
            <div className={"wrapper d-flex flex-column min-vh-100"}>
                <PublicHeader toggleSidebar={toggleIsShowSidebar} />
                <div className="content">
                    <div className="container-fluid">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default PublicLayoutWrapper
