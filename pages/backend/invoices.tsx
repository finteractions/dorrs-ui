import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import BalancesBlock from "@/components/backend/balances-block";
import FeesBlock from "@/components/backend/fees-block";
import InvoiceBlock from "@/components/backend/invoice-block";

const Invoices: NextPageWithLayout = () => {

    return (
        <>
            <InvoiceBlock/>
        </>
    )
}

Invoices.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Invoices.layoutName = "BackendLayout"

export default Invoices
