import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import MembershipBlock from "@/components/membership-block";
import IndicatorBlock from "@/components/indicator-block";

const Dashboard: NextPageWithLayout = () => {

    return (
        <>
            <div className={'flex-panel-box'}>
                <MembershipBlock/>
                <IndicatorBlock/>

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
