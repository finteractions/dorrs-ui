import React, { ReactElement } from "react"
import type { NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import TransactionsBlock from "@/components/transactions-block";


const Transactions: NextPageWithLayout = () => {
    return (
        <TransactionsBlock isDashboard={false} title="Transaction History"/>
    )
}

Transactions.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default Transactions
