import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import QuoteBoardPerSymbolBlock from "@/components/quote-bord-per-symbol";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    const onCallback = (symbol: string, mode?: string, option?: string) => {

        let queryString = "";
        if (option) {
            queryString += `/${option}`;
        }

        router.push(`/${mode}/${symbol}${queryString}`)
    }

    return (
        <div className="flex-panel-box">
            <QuoteBoardPerSymbolBlock onCallback={onCallback}
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
