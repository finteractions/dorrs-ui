import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import PortalLayout from "../../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import CompanyProfileBlock from "@/components/company-profile-block";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;
    
    return (
        <div className="flex-panel-box">
            <CompanyProfileBlock
                symbol={symbol}
            />
        </div>
    )
}


Symbol.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

Symbol.layoutName = "PortalLayout"

export default Symbol
