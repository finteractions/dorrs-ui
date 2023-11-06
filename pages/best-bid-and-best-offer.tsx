import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import {useRouter} from "next/router";
import BboBlock from "@/components/bbo-block";


const BestBidAndBestOffer: NextPageWithLayout = () => {

    const router = useRouter();

    const onCallback = (symbol: string) => {
        router.push(`/best-bid-and-best-offer/${symbol}`)
    }

    return (
        <>
            <div className={'flex-panel-box'}>
                <BboBlock onCallback={onCallback}/>
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
