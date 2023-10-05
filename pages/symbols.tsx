import React, {ReactElement} from "react"
import SymbolBlock from "@/components/symbol-block";;
import PortalLayout from "@/components/layouts/portal/portal-layout";
import {NextPageWithLayout} from "@/pages/_app";
import {useRouter} from "next/router";


const Symbols: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/symbols/${symbol}`)
    }

    return (
        <div className="flex-panel-box">
            <SymbolBlock
                isDashboard={false}
                onCallback={onCallback}
            />
        </div>
    )
}


Symbols.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Symbols.layoutName = "PortalLayout"

export default Symbols
