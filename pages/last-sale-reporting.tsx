import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import LastSaleReportingBlock from "@/components/last-sale-reporting-block";
import {useRouter} from "next/router";


const Dashboard: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/last-sale-reporting/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
              <LastSaleReportingBlock onCallback={onCallback}/>
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
