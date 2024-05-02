import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import QuoteBoardBlock from "@/components/quote-board-block";
import {useRouter} from "next/router";


const QuoteBoard: NextPageWithLayout = () => {
    const router = useRouter();

    const onCallback = (mode: string, symbol: string, option: string) => {
        let queryString = "";
        if (option) {
            queryString += `/${option}`;
        }
        router.push(`/${mode}/${symbol}${queryString}`)
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
