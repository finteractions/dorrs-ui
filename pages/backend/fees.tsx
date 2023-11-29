import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import BalancesBlock from "@/components/backend/balances-block";
import FeesBlock from "@/components/backend/fees-block";

const Fees: NextPageWithLayout = () => {

    return (
        <>
            <FeesBlock isAdmin={true}/>
        </>
    )
}

Fees.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Fees.layoutName = "BackendLayout"

export default Fees
