import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import BestBidAndBestOfferBlock from "@/components/best-bid-and-best-offer-block";


const BestBidAndBestOffer: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/best-bid-and-best-offer/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <BestBidAndBestOfferBlock onCallback={onCallback}/>
            </div>
        </>
    )
}

BestBidAndBestOffer.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

BestBidAndBestOffer.layoutName = "PortalLayout"

export default BestBidAndBestOffer
