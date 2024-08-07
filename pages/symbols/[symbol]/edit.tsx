import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement} from "react";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import SymbolInfoContainer from "@/components/symbol-info-container";
import {useRouter} from "next/router";
import SymbolPageForm from "@/components/symbol-page-form";

const Edit: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;

    const onCallback = (symbol: string, mode?: string, option?: string) => {
        if (!option) {
            let queryString = "";
            if (mode) {
                queryString += `/${mode}`;
            }
            router.push(`/symbols/${symbol}${queryString}`)
        } else {
            router.push(`/${option}/${mode}`)
        }
    }

    return (
        <SymbolPageForm action={'edit'} symbol={symbol} onCallback={onCallback}/>
    )
}


Edit.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <SymbolInfoContainer>
                {page}
            </SymbolInfoContainer>
        </PortalLayout>
    )
}

Edit.layoutName = "PortalLayout"

export default Edit
