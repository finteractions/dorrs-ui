import React, {ReactElement, useContext, useEffect} from "react"
import {useRouter} from "next/router";
import {NextPageWithLayout} from "@/pages/_app";
import PortalLayout from "@/components/layouts/portal/portal-layout";
import AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock
    from "@/components/algorand-data-feed-best-bid-and-best-offer-per-symbol";
import AlgorandDataFeedContainer from "@/components/algorand-data-feed-container";
import {DataContext} from "@/contextes/data-context";


const Symbol: NextPageWithLayout = () => {
    const router = useRouter();
    const symbol = router.query.symbol as string;
    const dataContext = useContext(DataContext);
    const onCallback = (values: any) => {
        dataContext.setSharedData({ activeTab: values.activeTab });

        const event = new CustomEvent("handleTab", { detail: { activeTab: values.activeTab } });
        window.dispatchEvent(event);
    };

    const navigate = () => {
        router.push('/algorand-data-feed/')
    }

    useEffect(() => {
        window.addEventListener('algorandNavigate', navigate);

        return () => {
            window.addEventListener('algorandNavigate', navigate);
        };
    },[])

    return (
        <div className="flex-panel-box">
            <AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock
                symbol={symbol}
                onCallback={onCallback}
            />
        </div>
    )
}


Symbol.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            <AlgorandDataFeedContainer>
                {page}
            </AlgorandDataFeedContainer>
        </PortalLayout>
    )
}

Symbol.layoutName = "PortalLayout"

export default Symbol
