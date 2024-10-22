import React, {ReactElement} from "react"
import type {NextPageWithLayout} from "../_app";
import BackendLayout from "@/components/layouts/backend/backend-layout";
import OrderGeneratorBlock from "@/components/backend/order-generator-block";
import LastSaleGeneratorBlock from "@/components/backend/last-sale-reporting-generator-block";
import BestBidAndBestOfferGeneratorBlock from "@/components/backend/best-bid-and-best-offer-generator-block";
import AIToolsAssetProfileBlock from "@/components/backend/ai-tools-asset-profile-block";


const Tools: NextPageWithLayout = () => {

    return (
        <>
            <OrderGeneratorBlock/>
            <LastSaleGeneratorBlock/>
            <BestBidAndBestOfferGeneratorBlock/>
            <AIToolsAssetProfileBlock/>
        </>
    )
}


Tools.getLayout = function getLayout(page: ReactElement) {
    return (
        <BackendLayout>
            {page}
        </BackendLayout>
    )
}

Tools.layoutName = "BackendLayout";

export default Tools
