import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import DepthOfBookBlock from "@/components/depth-of-book-block";
import AlgorandDataFeedBlock from "@/components/algorand-data-feed-block";



const AlgorandDataFeed: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/algorand-data-feed/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
               <AlgorandDataFeedBlock  onCallback={onCallback}/>
            </div>
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
