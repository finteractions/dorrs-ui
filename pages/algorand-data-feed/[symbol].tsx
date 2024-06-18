import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import LastSaleReportingPerSymbolBlock from "@/components/last-sale-reporting-per-symbol";
import AlgorandDataFeedPerSymbolBlock from "@/components/algorand-data-feed-per-symbol";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbolQuery = router.query.symbol as string;
    const [symbol, symbolSuffix] = symbolQuery.split(':')
    return (
        <div className="flex-panel-box">
            <AlgorandDataFeedPerSymbolBlock
                symbol={symbol}
            />
        </div>
    )
}


Symbol.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Symbol.layoutName = "PortalLayout"

export default Symbol
