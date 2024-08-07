import React, { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DashboardBlock from "@/components/public-dashboard/dashboard-block";
import {GetLayout, LayoutNameProvider} from "@/components/layouts/utils/layout-utils";


const PublicDashboard: NextPageWithLayout = () => {
    return (
        <>
            <DashboardBlock />
        </>
    );
};

PublicDashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <LayoutNameProvider>
            <GetLayout page={page} />
        </LayoutNameProvider>
    );
};

PublicDashboard.layoutName = "PublicLayout";

export default PublicDashboard;
