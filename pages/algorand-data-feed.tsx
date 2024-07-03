import React, {ReactElement, useContext, useEffect} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import AlgorandDataFeedBlock from "@/components/algorand-data-feed-block";
import AlgorandDataFeedContainer from "@/components/algorand-data-feed-container";
import {DataContext} from "@/contextes/data-context";


const AlgorandDataFeed: NextPageWithLayout = () => {

    const router = useRouter();
    const dataContext = useContext(DataContext);

    const onCallback = (action: string, symbol: string) => {
        router.push(`/algorand-data-feed/${action}/${symbol}`)
    }

    useEffect(() => {
        dataContext.setSharedData({activeTab: 'last-sale'})
    }, [])

    return (
        <>
            <AlgorandDataFeedBlock onCallback={onCallback}/>
        </>
    )
}

AlgorandDataFeed.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <AlgorandDataFeedContainer>
                {page}
            </AlgorandDataFeedContainer>

        </PortalLayout>
    )
}

AlgorandDataFeed.layoutName = "PortalLayout"

export default AlgorandDataFeed
