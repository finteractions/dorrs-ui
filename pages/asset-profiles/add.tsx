import {NextPageWithLayout} from "@/pages/_app";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import SymbolInfoContainer from "@/components/symbol-info-container";
import SymbolPageForm from "@/components/symbol-page-form";
import {useRouter} from "next/router";
import CompanyProfilePageForm from "@/components/company-profile-page-form";
import {DataContext} from "@/contextes/data-context";

const Add: NextPageWithLayout = () => {

    const router = useRouter();
    const context = useContext(DataContext);
    const [symbol, setSymbol] = useState<string | null>(null);

    useEffect(() => {
        if (context && context.getSharedData()) {
            const symbol = context.getSharedData().symbol;
            setSymbol(symbol ?? "")
        }

    }, [context])

    const onCallback = (symbol: string, mode?: string) => {
        let queryString = "";
        if (mode) {
            queryString += `/${mode}`;
            router.push(`/asset-profiles/${symbol}${queryString}`)
        }

    }

    return (
        <CompanyProfilePageForm action={'add'} symbol={symbol ?? ''} onCallback={onCallback}/>
    )
}


Add.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Add.layoutName = "PortalLayout"

export default Add
