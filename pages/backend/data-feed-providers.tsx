import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import DataFeedProvidersBlock from "@/components/backend/data-feed-providers-block";
import {useRouter} from "next/router";


const DataFeedProviders: NextPageWithLayout = () => {
    const router = useRouter();

    const onCallback = (name: string) => {
        router.push(`/backend/data-feed-providers/${name}`)
    }


    return (
        <>
            <DataFeedProvidersBlock onCallback={onCallback}/>
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
