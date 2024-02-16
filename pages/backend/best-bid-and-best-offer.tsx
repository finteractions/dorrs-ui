import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import BestBidAndBestOfferBlock from "@/components/backend/best-bid-and-best-offer-block";

const BestBidAndBestOffer: NextPageWithLayout = () => {

    return (
        <>
            <BestBidAndBestOfferBlock/>
        </>
    )
}

BestBidAndBestOffer.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

BestBidAndBestOffer.layoutName = "BackendLayout"

export default BestBidAndBestOffer
