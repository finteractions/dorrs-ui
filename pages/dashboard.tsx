import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import MembershipBlock from "@/components/membership-block";
import SymbolBlock from "@/components/symbol-block";
import {useRouter} from "next/router";
import IndicatorBlock from "@/components/indicator-block";

const Dashboard: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/symbols/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <MembershipBlock/>
                <IndicatorBlock/>
                <SymbolBlock
                    isDashboard={false}
                    onCallback={onCallback}
                />
            </div>


            {/*<SymbolBlock isDashboard={true}/>*/}
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
