import React, {ReactElement, useContext, useEffect, useState} from "react"
import type {NextPageWithLayout} from "./_app";
import HomeLayout from "@/components/layouts/home/home-layout";
import AccountApprovalBlock from "@/components/account-approval-block";

const AccountApproval: NextPageWithLayout = () => {
    return (
        <AccountApprovalBlock/>
    )
}

AccountApproval.getLayout = function getLayout(page: ReactElement) {
    return (
        <HomeLayout>
            {page}
        </HomeLayout>
    )
}

export default AccountApproval
