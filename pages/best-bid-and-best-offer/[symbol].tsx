import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import BestBidAndBestOfferPerSymbolBlock from "@/components/best-bid-and-best-offer-per-symbol-block";



const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    return (
        <div className="flex-panel-box">
            <BestBidAndBestOfferPerSymbolBlock
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
