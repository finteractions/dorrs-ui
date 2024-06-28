import React, {ReactElement} from "react"
import {useRouter} from "next/router";
import {NextPageWithLayout} from "@/pages/_app";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock
    from "@/components/algorand-data-feed-best-bid-and-best-offer-per-symbol";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbolQuery = router.query.symbol as string;
    const [symbol, symbolSuffix] = symbolQuery.split(':')
    return (
        <div className="flex-panel-box">
            <AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock
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
