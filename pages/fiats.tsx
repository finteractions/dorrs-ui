import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import FiatBlock from "@/components/fiat-block";


const Fiats: NextPageWithLayout = () => {
    return (
        <FiatBlock isDashboard={false} />
    )
}

Fiats.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default Fiats
