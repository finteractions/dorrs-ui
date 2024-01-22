import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import QuoteBoardBlock from "@/components/quote-board-block";
import {useRouter} from "next/router";


const QuoteBoard: NextPageWithLayout = () => {
    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/quote-board/${symbol}`)
    }

    return (
        <div className="flex-panel-box">
            <QuoteBoardBlock
                onCallback={onCallback}
            />
        </div>
    )
}

QuoteBoard.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

QuoteBoard.layoutName = "PortalLayout"

export default QuoteBoard
