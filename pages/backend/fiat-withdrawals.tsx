import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import FiatWithdrawalsBlock from "@/components/backend/fiat-withdrawals-block";
const FiatWithdrawals: NextPageWithLayout = () => {

    return (
        <>
           <FiatWithdrawalsBlock/>
        </>
    )
}

FiatWithdrawals.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

FiatWithdrawals.layoutName = "BackendLayout"

export default FiatWithdrawals
