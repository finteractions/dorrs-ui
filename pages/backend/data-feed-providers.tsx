import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import DataFeedProvidersBlock from "@/components/backend/data-feed-providers-block";


const DataFeedProviders: NextPageWithLayout = () => {
    return (
        <>
            <DataFeedProvidersBlock/>
        </>
    )
}

DataFeedProviders.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

DataFeedProviders.layoutName = "BackendLayout"

export default DataFeedProviders
