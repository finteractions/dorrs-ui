import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import WeeklyAndMonthlyReportsPortalBlock from "@/components/weekly-and-monthly-reports-portal-block";


const WeeklyAndMonthlyReports: NextPageWithLayout = () => {

    return (
        <>
            <div className="flex-panel-box">
                <WeeklyAndMonthlyReportsPortalBlock/>
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
