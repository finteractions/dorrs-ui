import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";

interface MarketDataSummaryBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IDashboardMarketDataSummary | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS_PUBLIC_DASHBOARD || '2')

class MarketDataSummaryBlock extends React.Component<{}, MarketDataSummaryBlockState> {

    state: MarketDataSummaryBlockState;
    private subscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: null
        }
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getMarketSummary();
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    subscriptions(): void {
        this.subscription = websocketService.on<Array<IDashboardMarketDataSummary>>(WebsocketEvent.DASHBOARD_MARKET_DATA_SUMMARY).subscribe((data: Array<IDashboardMarketDataSummary>) => {
            this.handleData(data);
        });
    }

    getMarketSummary = () => {
        publicDashboardService.getMarketData()
            .then((res: Array<IDashboardMarketDataSummary>) => {
                const data = res || [];
                this.handleData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<IDashboardMarketDataSummary>) => {
        this.setState({data: data[0] ?? null})
    }


    render() {
        return (

            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Market Data Summary</div>
                    </div>

                    <div>
                        <div>

                        </div>
                    </div>
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <div className={'indicator__item__data'}>
                            <div>
                                <div>Total Volume:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_volume) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Avg. Sale Price:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.avg_sale_price) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Highest Bid:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.best_bid_price) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Lowest Offer:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.best_offer_price) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Total Bid Vol:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_bid_volume) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Total Ask Vol:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_offer_volume) || 0, decimalPlaces)}</div>
                            </div>
                            <div>
                                <div>Bid-Ask Spread:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.spread_price) || 0, decimalPlaces)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

}

export default MarketDataSummaryBlock;
