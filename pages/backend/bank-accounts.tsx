import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BankAccountsBlock from "@/components/backend/bank-accounts-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";
const BankAccounts: NextPageWithLayout = () => {

    return (
        <>
           <BankAccountsBlock/>
        </>
    )
}

BankAccounts.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

BankAccounts.layoutName = "BackendLayout"

export default BankAccounts
