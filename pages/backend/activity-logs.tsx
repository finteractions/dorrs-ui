import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import ActivityLogsBlock from "@/components/backend/activity-logs-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";

const ActivityLogs: NextPageWithLayout = () => {

    return (
        <>
           <ActivityLogsBlock/>
        </>
    )
}

ActivityLogs.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

ActivityLogs.layoutName = "BackendLayout"

export default ActivityLogs
