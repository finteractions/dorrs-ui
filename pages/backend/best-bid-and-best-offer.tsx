import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import BBOBlock from "@/components/backend/bbo-block";

const BestBidAndBestOffer: NextPageWithLayout = () => {

    return (
        <>
            <BBOBlock/>
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
