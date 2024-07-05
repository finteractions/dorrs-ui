import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PublicLayout from "@/components/layouts/public/public-layout";
import DashboardBlock from "@/components/public-dashboard/dashboard";

const PublicDashboard: NextPageWithLayout = () => {

    return (
        <>
            <DashboardBlock/>
        </>
    )
}

PublicDashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PublicLayout>
            {page}
        </PublicLayout>
    )
}

PublicDashboard.layoutName = "PublicLayout"

export default PublicDashboard
