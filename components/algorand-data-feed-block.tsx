import React from 'react';
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import AlgorandDataFeedLastSaleBlock from "@/components/algorand-data-feed-last-sale-block";
import AlgorandDataFeedBestBidAndBestOfferBlock from "@/components/algorand-data-feed-best-bid_and-best-offer-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";


interface AlgorandDataFeedBlockState {
    activeTab: string;
}

interface AlgorandDataFeedProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

class AlgorandDataFeedBlock extends React.Component<AlgorandDataFeedProps, AlgorandDataFeedBlockState> {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>

    constructor(props: AlgorandDataFeedProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            activeTab: ''
        }
    }

    componentDidMount() {
        const tab = this.context.getSharedData();
        this.setState({activeTab: tab?.activeTab ?? 'last-sale'})
    }

    componentWillUnmount() {

    }

    onLastSaleCallback = (symbol: string) => {
        this.props.onCallback('last-sale', symbol)
    }

    onBestBidAndBestOfferCallback = (symbol: string) => {
        this.props.onCallback('best-bid-and-best-offer', symbol)
    }

    setActiveTab(tab: string) {
        this.setState({activeTab: tab})
    }

    render() {
        return (

            <>
                <div className={'flex-panel-box '}>
                    <div className={'panel'}>
                        <div className={'content__top'}>
                            <div className={'content__title'}>Algorand Data Feed</div>
                        </div>
                        <div className={'content__bottom'}>
                            <ul className="nav nav-tabs" id="tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'last-sale' ? 'active' : ''}`}
                                       id="home-tab" data-bs-toggle="tab" href="#last-sale"
                                       onClick={() => this.setActiveTab('last-sale')}>Last
                                        Sale</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'best-bid-and-best-offer' ? 'active' : ''}`}
                                       id="profile-tab" data-bs-toggle="tab"
                                       href="#best-bid-and-best-offer"
                                       onClick={() => this.setActiveTab('best-bid-and-best-offer')}>Best
                                        Bid And Best Offer</a>
                                </li>
                            </ul>
                            <div className="tab-content w-100">
                                <div
                                    className={`tab-pane fade ${this.state.activeTab === 'last-sale' ? 'show active' : ''}`}
                                    id="last-sale">
                                    {this.state.activeTab === 'last-sale' && (
                                        <AlgorandDataFeedLastSaleBlock onCallback={this.onLastSaleCallback}/>
                                    )}
                                </div>
                                <div
                                    className={`tab-pane fade ${this.state.activeTab === 'best-bid-and-best-offer' ? 'show active' : ''}`}
                                    id="best-bid-and-best-offer">
                                    {this.state.activeTab === 'best-bid-and-best-offer' && (
                                        <AlgorandDataFeedBestBidAndBestOfferBlock
                                            onCallback={this.onBestBidAndBestOfferCallback}/>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(AlgorandDataFeedBlock, 'AlgorandDataFeedBlock');
