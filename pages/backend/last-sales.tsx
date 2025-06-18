import React, {ReactElement} from "react"
import BackendLayout from "@/components/layouts/backend/backend-layout";
import LastSalesBlock from "@/components/backend/last-sales-block";
import {NextPageWithLayout} from "@/pages/_app";

const LastSales: NextPageWithLayout = () => {

    return (
        <>
            <LastSalesBlock/>
        </>
    )
}

LastSales.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

LastSales.layoutName = "BackendLayout"

export default LastSales
