import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import {createColumnHelper} from "@tanstack/react-table";
import AssetImage from "@/components/asset-image";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";

interface TOP5ActiveSymbolsBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    dataActiveSymbols: Array<IDashboardTOP5ActiveSymbols>;
    activeTab: string | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const pageLength = 5

const columnHelperTOP5ActiveSymbols = createColumnHelper<any>();
let columnsTOP5ActiveSymbols: any[] = [];

class TOP5ActiveSymbolsBlock extends React.Component<{}, TOP5ActiveSymbolsBlockState> {

    state: TOP5ActiveSymbolsBlockState;
    private subscription: Subscription | null = null;

    tableRefTOP5ActiveSymbols: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            dataActiveSymbols: [],
            activeTab: 'active-symbols'
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        //     Table: Active Symbols
        columnsTOP5ActiveSymbols = [
            columnHelperTOP5ActiveSymbols.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.logo,
            }), {
                id: "symbol",
                cell: (item) =>
                    <>
                        <div className={`table-image`}
                        >
                            <div className="table-image-container">
                                <AssetImage alt=''
                                            src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                            width={28} height={28}/>
                            </div>
                            {item.getValue().symbol}
                        </div>
                    </>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_volume, {
                id: "total_volume",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), 0)}</span>
                ,
                header: () => <span>Total Volume</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.avg_sale_price, {
                id: "avg_sale_price",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Avg. Sale Price</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.best_bid_price, {
                id: "best_bid_price",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Highest Bid</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.best_offer_price, {
                id: "best_offer_price",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Lowest Offer</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_bid_volume, {
                id: "total_bid_volume",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Total Bid Vol</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_offer_volume, {
                id: "total_offer_volume",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Total Ask Vol</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.spread_price, {
                id: "spread_price",
                cell: (item) =>
                    <span className='blue-text'>{formatterService.numberFormat(item.getValue(), decimalPlaces)}</span>
                ,
                header: () => <span>Bid-Ask Spread</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getTop5ActiveSymbols();
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
        this.subscription = websocketService.on<Array<IDashboardTOP5ActiveSymbols>>(WebsocketEvent.DASHBOARD_TOP5_ACTIVE_SYMBOLS).subscribe((data: Array<IDashboardTOP5ActiveSymbols>) => {
            this.handleTOP5ActiveSymbolsData(data);
        });
    }

    getTop5ActiveSymbols = () => {
        publicDashboardService.getTOP5ActiveSymbols()
            .then((res: Array<IDashboardTOP5ActiveSymbols>) => {
                const data = res || [];
                this.handleTOP5ActiveSymbolsData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleTOP5ActiveSymbolsData = (data: Array<IDashboardTOP5ActiveSymbols>) => {
        this.setState({
            dataActiveSymbols: data ?? [],
        })
    }


    render() {
        return (

            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">TOP-5 Entities</div>
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
                                        <a className={`nav-link ${this.state.activeTab === 'active-symbols' ? 'active' : ''}`}
                                           data-bs-toggle="tab"
                                           href="#active-symbols"
                                           onClick={() => this.setActiveTab('active-symbols')}>Active Symbols</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeTab === 'percentage-gains' ? 'active' : ''}`}
                                           data-bs-toggle="tab"
                                           href="#percentage-gains"
                                           onClick={() => this.setActiveTab('percentage-gains')}>Percentage
                                            Gains</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeTab === 'percentage-losses' ? 'active' : ''}`}
                                           data-bs-toggle="tab"
                                           href="#percentage-losses"
                                           onClick={() => this.setActiveTab('percentage-losses')}>Percentage
                                            Losses</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={`nav-link ${this.state.activeTab === 'trade-volumes' ? 'active' : ''}`}
                                           data-bs-toggle="tab"
                                           href="#trade-volumes"
                                           onClick={() => this.setActiveTab('trade-volumes')}>Percentage
                                            Losses</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="tab-content w-100">
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'active-symbols' ? 'show active' : ''}`}
                                    id="active-symbols">
                                    {this.state.dataActiveSymbols.length ? (
                                        <Table columns={columnsTOP5ActiveSymbols}
                                               pageLength={pageLength}
                                               data={this.state.dataActiveSymbols}
                                               searchPanel={false}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               ref={this.tableRefTOP5ActiveSymbols}
                                        />
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )}

                                </div>
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'percentage-gains' ? 'show active' : ''}`}
                                    id="percentage-gains">
                                    IN DEVELOPMENT
                                </div>
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'percentage-losses' ? 'show active' : ''}`}
                                    id="percentage-losses">
                                    IN DEVELOPMENT
                                </div>
                                <div
                                    className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'trade-volumes' ? 'show active' : ''}`}
                                    id="trade-volumes">
                                    IN DEVELOPMENT
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

}

export default TOP5ActiveSymbolsBlock;
