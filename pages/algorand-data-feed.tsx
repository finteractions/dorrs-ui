import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import AlgorandDataFeedBlock from "@/components/algorand-data-feed-block";


const AlgorandDataFeed: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (action: string, symbol: string) => {
        console.log(action, symbol)
        router.push(`/algorand-data-feed/${action}/${symbol}`)
    }

    return (
        <>

            <AlgorandDataFeedBlock onCallback={onCallback}/>
        </>
    )
}

AlgorandDataFeed.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

AlgorandDataFeed.layoutName = "PortalLayout"

export default AlgorandDataFeed
