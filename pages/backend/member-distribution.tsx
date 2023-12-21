import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";

import BackendLayout from "@/components/layouts/backend/backend-layout";
import BalancesBlock from "@/components/backend/balances-block";
import FeesBlock from "@/components/backend/fees-block";
import MemberDistributionBlock from "@/components/backend/member-distribution-block";

const MemberDistribution: NextPageWithLayout = () => {

    return (
        <>
            <MemberDistributionBlock/>
        </>
    )
}

MemberDistribution.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

MemberDistribution.layoutName = "BackendLayout"

export default MemberDistribution
