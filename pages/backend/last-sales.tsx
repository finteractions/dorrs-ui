import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import LastSalesBlock from "@/components/backend/last-sales-block";

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
