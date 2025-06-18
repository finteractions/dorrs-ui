import React, {ReactElement} from "react"

import BackendLayout from "@/components/layouts/backend/backend-layout";
import {NextPageWithLayout} from "@/pages/_app";
import ForgeGlobalLastSalesBlock from "@/components/backend/forge-global-last-sales-block";

const ForgeGlobalLastSales: NextPageWithLayout = () => {

    return (
        <>
           <ForgeGlobalLastSalesBlock />
        </>
    )
}

ForgeGlobalLastSales.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

ForgeGlobalLastSales.layoutName = "BackendLayout"

export default ForgeGlobalLastSales
