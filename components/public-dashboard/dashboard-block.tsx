import React from 'react';
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import TickerBlock from "@/components/public-dashboard/ticker-block";
import SymbolRegistryBlock from "@/components/public-dashboard/symbol-registry-block";
import CompanyProfileBlock from "@/components/public-dashboard/company-profile-block";
import MarketDataSummaryBlock from "@/components/public-dashboard/marke-data-summary-block";
import BlockchainDataBlock from "@/components/public-dashboard/blockchain-data-block";
import TOP5ActiveSymbolsBlock from "@/components/public-dashboard/top-5-active-symbols-block";


class DashboardBlock extends React.Component {

    private websocketSubscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }

    componentDidMount() {
        this.subscriptions()
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    subscriptions(): void {
        this.websocketSubscription = websocketService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) this.subscribe();
        });
    }

    subscribe() {
        websocketService.subscribeOnDashboard();
    }

    unsubscribe() {
        websocketService.unSubscribeOnDashboard();
        this.websocketSubscription?.unsubscribe();
    }

    render() {
        return (
            <>
                <TickerBlock/>
                <div className={'indicators content__bottom mt-4'}>
                    <SymbolRegistryBlock/>
                    <CompanyProfileBlock/>
                    <MarketDataSummaryBlock/>
                    <BlockchainDataBlock/>
                </div>
                <div className={'indicators content__bottom mt-4'}>
                    <TOP5ActiveSymbolsBlock/>
                </div>
            </>
        );
    }

}

export default DashboardBlock;
