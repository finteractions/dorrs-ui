import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import InvoiceBlock from "@/components/invoice-block";


const Invoices: NextPageWithLayout = () => {

    return (
        <>
            <div className="flex-panel-box">
                <InvoiceBlock/>
            </div>
        </>
    )
}

Invoices.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Invoices.layoutName = "PortalLayout"

export default Invoices
