import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import WeeklyAndMonthlyReportsBlock from "@/components/weekly-and-monthly-reports-block";


const WeeklyAndMonthlyReports: NextPageWithLayout = () => {

    return (
        <>
            <div className="flex-panel-box">
                <WeeklyAndMonthlyReportsBlock/>
            </div>
        </>
    )
}

WeeklyAndMonthlyReports.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

WeeklyAndMonthlyReports.layoutName = "PortalLayout"

export default WeeklyAndMonthlyReports
