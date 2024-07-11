import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";

interface BlockchainBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    dataLastSale: IDashboardBlockchainDataLastSale | null;
    dataBestBidAndBestOffer: IDashboardBlockchainDataBestBidAndBestOffer | null;
    activeTab: string | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS_PUBLIC_DASHBOARD || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class BlockchainDataBlock extends React.Component<{}, BlockchainBlockState> {

    state: BlockchainBlockState;
    private subscriptionLastSale: Subscription | null = null;
    private subscriptionBestBidAndBestOffer: Subscription | null = null;
    getDataInterval: NodeJS.Timer | number | undefined;

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
            this.getBlockchainDataLastSale()
                .then(() => this.getBlockchainDataBestBidAndBestOffer())
            this.subscriptions();
            this.startAutoUpdate();
        });
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        this.subscriptionLastSale?.unsubscribe();
        this.subscriptionBestBidAndBestOffer?.unsubscribe();
    }

    setActiveTab = (tab: string) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }

    subscriptions(): void {
        this.subscriptionLastSale = websocketService.on<Array<IDashboardBlockchainDataLastSale>>(WebsocketEvent.DASHBOARD_BLOCKCHAIN_DATA_LAST_SALE).subscribe((data: Array<IDashboardBlockchainDataLastSale>) => {
            this.handleLastSaleData(data);
        });
        this.subscriptionBestBidAndBestOffer = websocketService.on<Array<IDashboardBlockchainDataBestBidAndBestOffer>>(WebsocketEvent.DASHBOARD_BLOCKCHAIN_DATA_BEST_BID_AND_BEST_OFFER).subscribe((data: Array<IDashboardBlockchainDataBestBidAndBestOffer>) => {
            this.handleBestBidAndBestOfferData(data);
        });
    }

    getBlockchainDataLastSale = () => {
        return new Promise(resolve => {
            publicDashboardService.getBlockchainData<IDashboardBlockchainDataLastSale>('last_sale')
                .then((res: Array<IDashboardBlockchainDataLastSale>) => {
                    const data = res || [];
                    this.handleLastSaleData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoading: false})
                    resolve(true)
                });
        })
    }

    getBlockchainDataBestBidAndBestOffer = () => {
        return new Promise(resolve => {
            publicDashboardService.getBlockchainData<IDashboardBlockchainDataBestBidAndBestOffer>('best_bid_and_best_offer')
                .then((res: Array<IDashboardBlockchainDataBestBidAndBestOffer>) => {
                    const data = res || [];
                    this.handleBestBidAndBestOfferData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoading: false})
                    resolve(true)
                });
        })
    }

    handleLastSaleData = (data: Array<any>) => {
        console.log(data)
        this.setState({
            dataLastSale: data[0] ?? null
        })
    }

    handleBestBidAndBestOfferData = (data: Array<any>) => {
        this.setState({
            dataBestBidAndBestOffer: data[0] ?? null,
        })
    }

    startAutoUpdate = () => {
        this.getDataInterval = setInterval(() => this.getBlockchainDataLastSale().then(() => this.getBlockchainDataBestBidAndBestOffer()), Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getDataInterval) clearInterval(this.getDataInterval as number);
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
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataLastSale?.total_volume) || 0, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Avg. Tx Amount:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataLastSale?.avg_amount) || 0, decimalPlaces)}</div>
                                    </div>
                                </div>
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'best-bid-and-best-offer' ? 'show active' : ''}`}
                                    id="best-bid-and-best-offer">
                                    <div>
                                        <div>Total Tx Volume:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.total_volume) || 0, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Avg. Tx Amount:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.avg_amount) || 0, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Highest Bid:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.best_bid_price) || 0, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Lowest Offer:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.dataBestBidAndBestOffer?.best_offer_price) || 0, decimalPlaces)}</div>
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
