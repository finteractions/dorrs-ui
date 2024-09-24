import React from 'react';
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import AlgorandDataFeedLastSaleBlock from "@/components/algorand-data-feed-last-sale-block";
import AlgorandDataFeedBestBidAndBestOfferBlock from "@/components/algorand-data-feed-best-bid_and-best-offer-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";


interface AlgorandDataFeedBlockState {
    activeTab: string | null;
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
            activeTab: null
        }
    }

    componentDidMount() {
        this.setActiveTab();
    }

    componentDidUpdate(prevProps: Readonly<AlgorandDataFeedProps>, prevState: Readonly<AlgorandDataFeedBlockState>, snapshot?: any) {
        this.setActiveTab();
    }

    setActiveTab = () => {
        const tab = this.context.getSharedData();
        if (tab && tab.activeTab) {
            this.setState({activeTab: tab.activeTab})
        }
    }

    componentWillUnmount() {

    }

    onLastSaleCallback = (symbol: string) => {
        this.props.onCallback('last-sale', symbol)
    }

    onBestBidAndBestOfferCallback = (symbol: string) => {
        this.props.onCallback('best-bid-and-best-offer', symbol)
    }

    render() {
        return (

            <>
                <div className={'panel'}>
                    <div className="tab-content w-100">
                        <div
                            className={`tab-pane fade ${this.state.activeTab === 'last-sale' ? 'show active' : ''}`}
                            id="last-sale">
                            {this.state.activeTab === 'last-sale' && (
                                <AlgorandDataFeedLastSaleBlock
                                    onCallback={this.onLastSaleCallback}/>
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

            </>
        )
    }
}

export default portalAccessWrapper(AlgorandDataFeedBlock, 'AlgorandDataFeedBlock');
