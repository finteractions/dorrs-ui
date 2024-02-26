import React, {ReactElement} from "react"
import WeeklyAndMonthlyReportsBlock from "@/components/weekly-and-monthly-reports-block";
import {NextPageWithLayout} from "@/pages/_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";


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
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

WeeklyAndMonthlyReports.layoutName = "BackendLayout"

export default WeeklyAndMonthlyReports
