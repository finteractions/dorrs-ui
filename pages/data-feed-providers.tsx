import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import DataFeedProvidersBlock from "@/components/data-feed-providers-block";
import {useRouter} from "next/router";

const DataFeedProviders: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (name: string) => {
        router.push(`/data-feed-providers/${name}`)
    }

    return (
        <div className="flex-panel-box">
            <DataFeedProvidersBlock onCallback={onCallback}/>
        </div>

    )
}

DataFeedProviders.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

DataFeedProviders.layoutName = "PortalLayout"

export default DataFeedProviders
