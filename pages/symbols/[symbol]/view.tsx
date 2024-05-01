import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../../_app";
import PortalLayout from "../../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import SymbolInfoContainer from "@/components/symbol-info-container";
import SymbolInfoBlock from "@/components/symbol-info-block";


const View: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
        }

        if (mode === 'asset_profile') {
            router.push(`/asset-profiles/${symbol}/view`)
        } else {
            router.push(`/symbols/${symbol}${queryString}`)
        }

    }

    return (
        <SymbolInfoBlock onCallback={onCallback} symbol={symbol}/>
    )
}


View.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <SymbolInfoContainer>
                {page}
            </SymbolInfoContainer>
        </PortalLayout>
    )
}

View.layoutName = "PortalLayout"

export default View
