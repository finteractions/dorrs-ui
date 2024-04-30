import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement} from "react";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import SymbolInfoContainer from "@/components/symbol-info-container";
import SymbolPageForm from "@/components/symbol-page-form";
import {useRouter} from "next/router";

const Add: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
        }
        router.push(`/symbols/${symbol}${queryString}`)
    }

    return (
        <SymbolPageForm action={'add'} onCallback={onCallback}/>
    )
}


Add.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <SymbolInfoContainer>
                {page}
            </SymbolInfoContainer>
        </PortalLayout>
    )
}

Add.layoutName = "PortalLayout"

export default Add
