import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import MembershipBlock from "@/components/membership-block";
import SymbolBlock from "@/components/symbol-block";

const Dashboard: NextPageWithLayout = () => {

    return (
        <>
            <MembershipBlock/>
            <SymbolBlock isDashboard={true}/>
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
