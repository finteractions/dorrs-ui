import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import InvoiceBlock from "@/components/backend/invoice-block";
import BankBlock from "@/components/backend/bank-block";

const Invoices: NextPageWithLayout = () => {

    return (
        <>
            <ul className="nav nav-tabs" id="myTabs">
                <li className="nav-item">
                    <a className="nav-link active" id="home-tab" data-bs-toggle="tab" href="#invoices">Invoices</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#banks">Bank Information</a>
                </li>
            </ul>

            <div className="tab-content">
                <div className="tab-pane fade show active mt-24" id="invoices">
                    <InvoiceBlock/>
                </div>
                <div className="tab-pane fade mt-24" id="banks">
                    <BankBlock/>
                </div>
            </div>

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
