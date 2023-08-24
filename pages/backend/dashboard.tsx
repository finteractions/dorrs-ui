import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import DashboardBlock from "@/components/backend/dashboard-block";



const Dashboard: NextPageWithLayout = () => {

    return (
        <>
            <DashboardBlock />
        </>
    )
}


Dashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

export default Dashboard
