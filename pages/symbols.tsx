import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import SymbolBlock from "@/components/symbol-block";


const Symbols: NextPageWithLayout = () => {
    return (
        <SymbolBlock isDashboard={false} />
    )
}

Symbols.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default Symbols
