import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import FiatBlock from "@/components/fiat-block";
import FeesBlock from "@/components/backend/fees-block";


const Tariffs: NextPageWithLayout = () => {
    return (
        <FeesBlock />
    )
}

Tariffs.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Tariffs.layoutName = "PortalLayout"

export default Tariffs
