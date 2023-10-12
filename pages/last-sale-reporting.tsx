import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import LastSaleReportingBlock from "@/components/last-sale-reporting-block";


const Dashboard: NextPageWithLayout = () => {

    return (
        <>
            <div className={'flex-panel-box'}>
              <LastSaleReportingBlock />
            </div>
        </>
    )
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Dashboard.layoutName = "PortalLayout"

export default Dashboard
