import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DashboardBlock from "@/components/public-dashboard/dashboard-block";
import PortalLayout from "@/components/layouts/portal/portal-layout";


const PublicDashboard: NextPageWithLayout = () => {
    return (
        <>
            <DashboardBlock />
        </>
    );
};

PublicDashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    );
};

PublicDashboard.layoutName = "PortalLayout";

export default PublicDashboard;
