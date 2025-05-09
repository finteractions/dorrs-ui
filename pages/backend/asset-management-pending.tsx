import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import PendingAssetsBlock from "@/components/backend/pending-assets-block";

const AssetManagementPending: NextPageWithLayout = () => {

    return (
        <>
           <PendingAssetsBlock/>
        </>
    )
}

AssetManagementPending.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

AssetManagementPending.layoutName = "BackendLayout"

export default AssetManagementPending
