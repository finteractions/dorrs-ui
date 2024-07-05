import React from 'react';
import TickerBlock from "@/components/public-dashboard/ticker";
import SymbolRegistryBlock from "@/components/public-dashboard/symbol-registry";
import CompanyProfileBlock from "@/components/public-dashboard/company-profile";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";


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
                    <div className={'indicator__item statistics'}>
                        <div className="content__top pb-0">
                            <div className="content__title">Market Data Summary</div>
                        </div>

                        <div>
                            <div>

                            </div>
                        </div>
                        <div className={'indicator__item__data'}>

                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default DashboardBlock;
