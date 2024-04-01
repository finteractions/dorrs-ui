import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import SymbolInfoContainer from "@/components/symbol-info-container";
import SymbolInfoBlock from "@/components/symbol-info-block";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    return (
        <SymbolInfoBlock symbol={symbol}/>
    )
}


Symbol.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <SymbolInfoContainer>
                {page}
            </SymbolInfoContainer>
        </PortalLayout>
    )
}

Symbol.layoutName = "PortalLayout"

export default Symbol
