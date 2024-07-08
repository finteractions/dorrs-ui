import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import AlgorandDataFeedLastSaleBlock from "@/components/algorand-data-feed-last-sale-block";
import AlgorandDataFeedBestBidAndBestOfferBlock from "@/components/algorand-data-feed-best-bid_and-best-offer-block";

interface BlockchainBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    dataLastSale: IDashboardBlockchainDataLastSale | null;
    dataBestBidAndBestOffer: IDashboardBlockchainDataBestBidAndBestOffer | null;
    activeTab: string | null;
}

class BlockchainDataBlock extends React.Component<{}, BlockchainBlockState> {

    state: BlockchainBlockState;
    private subscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            dataLastSale: null,
            dataBestBidAndBestOffer: null,
            activeTab: 'last-sale'
        }
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getBlockchainData();
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    setActiveTab = (tab: string) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }

    subscriptions(): void {
        this.subscription = websocketService.on<Array<IDashboardBlockchainDataLastSale>>(WebsocketEvent.DASHBOARD_BLOCKCHAIN_DATA).subscribe((data: Array<IDashboardBlockchainDataLastSale>) => {
            this.handleData(data);
        });
    }

    getBlockchainData = () => {
        publicDashboardService.getBlockchainData()
            .then((res: Array<IDashboardBlockchainDataLastSale>) => {
                const data = res || [];
                this.handleData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<any>) => {
        this.setState({
            dataLastSale: data[0] ?? null,
            dataBestBidAndBestOffer: data[1] ?? null,
        })
    }


    render() {
        return (

            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Blockchain Data</div>
                    </div>

                    <div>
                        <div>

                        </div>
                    </div>
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <div className={'indicator__item__data'}>
                            <div className={'w-100'}>
                                <ul className="nav nav-tabs w-100" id="tabs">
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeTab === 'last-sale' ? 'active' : ''}`}
                                           data-bs-toggle="tab" href="#last-sale"
                                           onClick={() => this.setActiveTab('last-sale')}>Last
                                            Sale</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeTab === 'best-bid-and-best-offer' ? 'active' : ''}`}
                                           data-bs-toggle="tab"
                                           href="#best-bid-and-best-offer"
                                           onClick={() => this.setActiveTab('best-bid-and-best-offer')}>Best
                                            Bid And Best Offer</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="tab-content w-100">
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'last-sale' ? 'show active' : ''}`}
                                    id="last-sale">
                                    <div>
                                        <div>Total Tx Volume:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataLastSale?.total_volume) || 0, 4)}</div>
                                    </div>
                                    <div>
                                        <div>Avg. Tx Amount:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataLastSale?.avg_amount) || 0, 4)}</div>
                                    </div>
                                </div>
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'best-bid-and-best-offer' ? 'show active' : ''}`}
                                    id="best-bid-and-best-offer">
                                    <div>
                                        <div>Total Tx Volume:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.total_volume) || 0, 4)}</div>
                                    </div>
                                    <div>
                                        <div>Avg. Tx Amount:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.avg_amount) || 0, 4)}</div>
                                    </div>
                                    <div>
                                        <div>Highest Bid:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.best_bid_price) || 0, 4)}</div>
                                    </div>
                                    <div>
                                        <div>Lowest Offer:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.best_offer_price) || 0, 4)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

}

export default BlockchainDataBlock;
