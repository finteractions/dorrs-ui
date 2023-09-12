import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import CustodiansBlock from "@/components/backend/custodians-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";
const CustodyManagement: NextPageWithLayout = () => {

    return (
        <>
           <CustodiansBlock/>
        </>
    )
}

CustodyManagement.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

CustodyManagement.layoutName = "BackendLayout"

export default CustodyManagement
