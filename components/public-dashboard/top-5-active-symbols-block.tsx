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
    isLoadingTOP5ActiveSymbols: boolean;
    isLoadingTOP5PercentageGains: boolean;
    isLoadingTOP5PercentageLosses: boolean;
    isLoadingTOP5TradeVolumes: boolean;
    errors: string[];
    dataActiveSymbols: Array<IDashboardTOP5ActiveSymbols>;
    dataPercentageGains: Array<IDashboardTOP5PercentageChange>;
    dataPercentageLosses: Array<IDashboardTOP5PercentageChange>;
    dataTradeVolumes: Array<IDashboardTOP5PercentageChange>;
    activeTab: string | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS_PUBLIC_DASHBOARD || '2')
const pageLength = 5

const columnHelperTOP5ActiveSymbols = createColumnHelper<any>();
let columnsTOP5ActiveSymbols: any[] = [];

const columnHelperTOP5PercentageGains = createColumnHelper<any>();
let columnsTOP5PercentageGains: any[] = [];

const columnHelperTOP5PercentageLosses = createColumnHelper<any>();
let columnsTOP5PercentageLosses: any[] = [];

const columnHelperTOP5TradeVolumes = createColumnHelper<any>();
let columnsTOP5TradeVolumes: any[] = [];


class TOP5ActiveSymbolsBlock extends React.Component<{}, TOP5ActiveSymbolsBlockState> {

    state: TOP5ActiveSymbolsBlockState;
    private subscriptionOnTOP5ActiveSymbols: Subscription | null = null;
    private subscriptionOnTOP5PercentageGains: Subscription | null = null;
    private subscriptionOnTOP5PercentageLoses: Subscription | null = null;
    private subscriptionOnTOP5TradeVolumes: Subscription | null = null;

    tableRefTOP5ActiveSymbols: React.RefObject<any> = React.createRef();
    tableRefTOP5PercentageGains: React.RefObject<any> = React.createRef();
    tableRefTOP5PercentageLosses: React.RefObject<any> = React.createRef();
    tableRefTOP5TradeVolumes: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoadingTOP5ActiveSymbols: true,
            isLoadingTOP5PercentageGains: true,
            isLoadingTOP5PercentageLosses: true,
            isLoadingTOP5TradeVolumes: true,
            errors: [],
            dataActiveSymbols: [],
            dataPercentageGains: [],
            dataPercentageLosses: [],
            dataTradeVolumes: [],
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
            columnHelperTOP5PercentageGains.accessor((row) => row.company_name, {
                id: "company_name",
                cell: (item) => item.getValue() || '-'
                ,
                header: () => <span>Company Name</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_volume, {
                id: "total_volume",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Total Volume</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.avg_sale_price, {
                id: "avg_sale_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Avg. Sale Price</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.best_bid_price, {
                id: "best_bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Highest Bid</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.best_offer_price, {
                id: "best_offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Lowest Offer</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_bid_volume, {
                id: "total_bid_volume",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Total Bid Vol</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.total_offer_volume, {
                id: "total_offer_volume",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Total Ask Vol</span>,
            }),
            columnHelperTOP5ActiveSymbols.accessor((row) => row.spread_price, {
                id: "spread_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid-Ask Spread</span>,
            }),
        ];

        //     Table: Percentage Gains
        columnsTOP5PercentageGains = [
            columnHelperTOP5PercentageGains.accessor((row) => ({
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
            columnHelperTOP5PercentageGains.accessor((row) => row.company_name, {
                id: "company_name",
                cell: (item) => item.getValue() || '-'
                ,
                header: () => <span>Company Name</span>,
            }),
            columnHelperTOP5PercentageGains.accessor((row) => row.percentage_changed, {
                id: "percentage_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Change</span>,
            }),
            columnHelperTOP5PercentageGains.accessor((row) => row.last_quantity, {
                id: "last_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Volume</span>,
            }),
            columnHelperTOP5PercentageGains.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Last Trade Price</span>,
            }),
        ];

        //     Table: Percentage Gains
        columnsTOP5PercentageLosses = [
            columnHelperTOP5PercentageLosses.accessor((row) => ({
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
            columnHelperTOP5PercentageLosses.accessor((row) => row.company_name, {
                id: "company_name",
                cell: (item) => item.getValue() || '-'
                ,
                header: () => <span>Company Name</span>,
            }),
            columnHelperTOP5PercentageLosses.accessor((row) => row.percentage_changed, {
                id: "percentage_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Change</span>,
            }),
            columnHelperTOP5PercentageLosses.accessor((row) => row.last_quantity, {
                id: "last_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Volume</span>,
            }),
            columnHelperTOP5PercentageLosses.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Last Trade Price</span>,
            }),
        ];

        //     Table: Trade Volumes
        columnsTOP5TradeVolumes = [
            columnHelperTOP5TradeVolumes.accessor((row) => ({
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
            columnHelperTOP5TradeVolumes.accessor((row) => row.company_name, {
                id: "company_name",
                cell: (item) => item.getValue() || '-'
                ,
                header: () => <span>Company Name</span>,
            }),
            columnHelperTOP5TradeVolumes.accessor((row) => row.percentage_changed, {
                id: "percentage_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Change</span>,
            }),
            columnHelperTOP5TradeVolumes.accessor((row) => row.last_quantity, {
                id: "last_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Volume</span>,
            }),
            columnHelperTOP5TradeVolumes.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Last Trade Price</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoadingTOP5ActiveSymbols: true, isLoadingTOP5PercentageGains: true}, () => {
            this.getTop5ActiveSymbols()
                .then(() => this.getTop5PercentageGains())
                .then(() => this.getTop5PercentageLosses())
                .then(() => this.getTop5TradeVolumes())
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscriptionOnTOP5ActiveSymbols?.unsubscribe();
        this.subscriptionOnTOP5PercentageGains?.unsubscribe();
        this.subscriptionOnTOP5PercentageLoses?.unsubscribe();
        this.subscriptionOnTOP5TradeVolumes?.unsubscribe();
    }

    setActiveTab = (tab: string) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }

    subscriptions(): void {
        this.subscriptionOnTOP5ActiveSymbols = websocketService.on<Array<IDashboardTOP5ActiveSymbols>>(WebsocketEvent.DASHBOARD_TOP5_ACTIVE_SYMBOLS).subscribe((data: Array<IDashboardTOP5ActiveSymbols>) => {
            this.handleTOP5ActiveSymbolsData(data);
        });

        this.subscriptionOnTOP5PercentageGains = websocketService.on<Array<IDashboardTOP5PercentageChange>>(WebsocketEvent.DASHBOARD_TOP5_PERCENTAGE_GAINS).subscribe((data: Array<IDashboardTOP5PercentageChange>) => {
            this.handleTOP5PercentageGainsData(data);
        });

        this.subscriptionOnTOP5PercentageLoses = websocketService.on<Array<IDashboardTOP5PercentageChange>>(WebsocketEvent.DASHBOARD_TOP5_PERCENTAGE_LOSSES).subscribe((data: Array<IDashboardTOP5PercentageChange>) => {
            this.handleTOP5PercentageLossesData(data);
        });

        this.subscriptionOnTOP5TradeVolumes = websocketService.on<Array<IDashboardTOP5PercentageChange>>(WebsocketEvent.DASHBOARD_TOP5_TRADE_VOLUMES).subscribe((data: Array<IDashboardTOP5PercentageChange>) => {
            this.handleTOP5TradeVolumesData(data);
        });
    }

    getTop5ActiveSymbols = () => {
        return new Promise(resolve => {
            publicDashboardService.getTOP5<IDashboardTOP5ActiveSymbols>('active_symbols')
                .then((res: Array<IDashboardTOP5ActiveSymbols>) => {
                    const data = res || [];
                    this.handleTOP5ActiveSymbolsData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingTOP5ActiveSymbols: false}, () => resolve(true))
                });
        })
    }

    getTop5PercentageGains = () => {
        return new Promise(resolve => {
            publicDashboardService.getTOP5<IDashboardTOP5PercentageChange>('percentage_gains')
                .then((res: Array<IDashboardTOP5PercentageChange>) => {
                    const data = res || [];
                    this.handleTOP5PercentageGainsData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingTOP5PercentageGains: false}, () => resolve(true))
                });
        })
    }

    getTop5PercentageLosses = () => {
        return new Promise(resolve => {
            publicDashboardService.getTOP5<IDashboardTOP5PercentageChange>('percentage_losses')
                .then((res: Array<IDashboardTOP5PercentageChange>) => {
                    const data = res || [];
                    this.handleTOP5PercentageLossesData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingTOP5PercentageLosses: false}, () => resolve(true))
                });
        })
    }

    getTop5TradeVolumes = () => {
        return new Promise(resolve => {
            publicDashboardService.getTOP5<IDashboardTOP5PercentageChange>('trade_volumes')
                .then((res: Array<IDashboardTOP5PercentageChange>) => {
                    const data = res || [];
                    this.handleTOP5TradeVolumesData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingTOP5TradeVolumes: false}, () => resolve(true))
                });
        })
    }

    handleTOP5ActiveSymbolsData = (data: Array<IDashboardTOP5ActiveSymbols>) => {
        this.setState({
            dataActiveSymbols: data ?? [],
        })
    }

    handleTOP5PercentageGainsData = (data: Array<IDashboardTOP5PercentageChange>) => {
        data.sort((a, b) => Number(b.percentage_changed) - Number(a.percentage_changed))

        this.setState({
            dataPercentageGains: data ?? [],
        })
    }

    handleTOP5PercentageLossesData = (data: Array<IDashboardTOP5PercentageChange>) => {
        data.sort((a, b) => Number(a.percentage_changed) - Number(b.percentage_changed))

        this.setState({
            dataPercentageLosses: data ?? [],
        })
    }

    handleTOP5TradeVolumesData = (data: Array<IDashboardTOP5PercentageChange>) => {
        data.sort((a, b) => Number(b.last_quantity) - Number(a.last_quantity))

        this.setState({
            dataTradeVolumes: data ?? [],
        })
    }


    render() {
        return (

            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">TOP-{pageLength} Entities</div>
                    </div>

                    <div>
                        <div>

                        </div>
                    </div>
                    <div className={'indicator__item__data'}>
                        <div className={'w-100'}>
                            <ul className="nav nav-tabs w-100" id="tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'active-symbols' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       href="#active-symbols"
                                       aria-disabled={this.state.isLoadingTOP5ActiveSymbols}
                                       onClick={() => this.setActiveTab('active-symbols')}>Active Symbols</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'percentage-gains' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       aria-disabled={this.state.isLoadingTOP5PercentageGains}
                                       href="#percentage-gains"
                                       onClick={() => this.setActiveTab('percentage-gains')}>Percentage
                                        Gains</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'percentage-losses' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       aria-disabled={this.state.isLoadingTOP5PercentageLosses}
                                       href="#percentage-losses"
                                       onClick={() => this.setActiveTab('percentage-losses')}>Percentage
                                        Losses</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'trade-volumes' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       href="#trade-volumes"
                                       onClick={() => this.setActiveTab('trade-volumes')}>Trade Volumes</a>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-content w-100">
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'active-symbols' ? 'show active' : ''}`}
                                id="active-symbols">

                                {this.state.isLoadingTOP5ActiveSymbols ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataActiveSymbols.length ? (
                                        <>
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
                                        </>


                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}

                            </div>
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'percentage-gains' ? 'show active' : ''}`}
                                id="percentage-gains">
                                {this.state.isLoadingTOP5PercentageGains ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataPercentageGains.length ? (
                                        <Table columns={columnsTOP5PercentageGains}
                                               pageLength={pageLength}
                                               data={this.state.dataPercentageGains}
                                               searchPanel={false}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               ref={this.tableRefTOP5PercentageGains}
                                        />
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}
                            </div>
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'percentage-losses' ? 'show active' : ''}`}
                                id="percentage-losses">
                                {this.state.isLoadingTOP5PercentageLosses ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataPercentageLosses.length ? (
                                        <Table columns={columnsTOP5PercentageLosses}
                                               pageLength={pageLength}
                                               data={this.state.dataPercentageLosses}
                                               searchPanel={false}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               ref={this.tableRefTOP5PercentageLosses}
                                        />
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}
                            </div>
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'trade-volumes' ? 'show active' : ''}`}
                                id="trade-volumes">
                                {this.state.isLoadingTOP5TradeVolumes ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataTradeVolumes.length ? (
                                        <Table columns={columnsTOP5TradeVolumes}
                                               pageLength={pageLength}
                                               data={this.state.dataTradeVolumes}
                                               searchPanel={false}
                                               block={this}
                                               viewBtn={false}
                                               editBtn={false}
                                               deleteBtn={false}
                                               ref={this.tableRefTOP5TradeVolumes}
                                        />
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default TOP5ActiveSymbolsBlock;
