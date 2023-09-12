import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import BalancesBlock from "@/components/backend/balances-block";
const BalancesScreen: NextPageWithLayout = () => {

    return (
        <>
           <BalancesBlock/>
        </>
    )
}

BalancesScreen.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

BalancesScreen.layoutName = "BackendLayout"

export default BalancesScreen
