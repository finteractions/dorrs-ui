import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import TradesBlock from "@/components/backend/trades-block";

const TradeManagement: NextPageWithLayout = () => {

    return (
        <>
           <TradesBlock/>
        </>
    )
}

TradeManagement.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

TradeManagement.layoutName = "BackendLayout"

export default TradeManagement
