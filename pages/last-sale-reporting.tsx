import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import LastSaleReportingBlock from "@/components/last-sale-reporting-block";
import {useRouter} from "next/router";


const LastSaleReporting: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string, symbol_suffix: string) => {
        symbol_suffix ? router.push(`/last-sale-reporting/${symbol}:${symbol_suffix}`) : router.push(`/last-sale-reporting/${symbol}`)

    }

    return (
        <>
            <div className={'flex-panel-box'}>
              <LastSaleReportingBlock onCallback={onCallback}/>
            </div>
        </>
    )
}

LastSaleReporting.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

LastSaleReporting.layoutName = "PortalLayout"

export default LastSaleReporting
