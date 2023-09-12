import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import AssetsBlock from "@/components/backend/assets-block";
import BackendLayout from "@/components/layouts/backend/backend-layout";

const AssetManagement: NextPageWithLayout = () => {

    return (
        <>
           <AssetsBlock/>
        </>
    )
}

AssetManagement.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

AssetManagement.layoutName = "BackendLayout"

export default AssetManagement
