import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import InvoiceBlock from "@/components/backend/invoice-block";
import BankBlock from "@/components/backend/bank-block";

const Banking: NextPageWithLayout = () => {

    return (
        <>
            <ul className="nav nav-tabs" id="myTabs">
                <li className="nav-item">
                    <a className="nav-link active" id="home-tab" data-bs-toggle="tab" href="#invoices">Invoices</a>
                </li>
                {/*<li className="nav-item">*/}
                {/*    <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#payments">Payments</a>*/}
                {/*</li>*/}
                <li className="nav-item">
                    <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#banks">Bank Information</a>
                </li>
            </ul>

            <div className="tab-content">
                <div className="tab-pane fade show active mt-24" id="invoices">
                    <InvoiceBlock/>
                </div>
                {/*<div className="tab-pane fade mt-24" id="payments">*/}
                {/*    Payments*/}
                {/*</div>*/}
                <div className="tab-pane fade mt-24" id="banks">
                    <BankBlock/>
                </div>
            </div>

        </>
    )
}

Banking.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Banking.layoutName = "BackendLayout"

export default Banking
