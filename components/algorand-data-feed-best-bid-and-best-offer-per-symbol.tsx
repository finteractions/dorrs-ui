import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import NoDataBlock from "@/components/no-data-block";
import {AreaAndBarChart} from "@/components/chart/area-and-bar-chart";
import converterService from "@/services/converter/converter-service";
import AssetImage from "@/components/asset-image";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import statisticsService from "@/services/statistics/statistics-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import CopyClipboard from "@/components/copy-clipboard";
import bestBidAndBestOfferService from "@/services/bbo/best-bid-and-best-offer-service";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSortAmountAsc} from "@fortawesome/free-solid-svg-icons";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";

interface AlgorandDataFeedBestBidAndBestOfferPerSymbolProps {
    symbol: string;
}

interface AlgorandDataFeedBestBidAndBestOfferPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    companyProfile: ICompanyProfile | null,
    bestBidAndBestOffer: IBestBidAndBestOffer | null;
    transactions: IBestBidAndBestOffer[];
    charts: Array<ITradingView>;
    mpid: string | null;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
    chart: string;
    isToggleBidOffer: boolean;
    algorandBestBidAndBestOfferApplicationId: string;
    algorandBestBidAndBestOfferApplicationIdLink: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock extends React.Component<AlgorandDataFeedBestBidAndBestOfferPerSymbolProps> {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>

    state: AlgorandDataFeedBestBidAndBestOfferPerSymbolState;

    getBestBidAndBestOfferReportingInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    private websocketSubscription: Subscription | null = null;
    private algorandChartsSubscription: Subscription | null = null;
    private algorandTransactionsSubscription: Subscription | null = null;
    private algorandStatisticsSubscription: Subscription | null = null;

    constructor(props: AlgorandDataFeedBestBidAndBestOfferPerSymbolProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            companyProfile: null,
            bestBidAndBestOffer: null,
            transactions: [],
            charts: [],
            mpid: null,
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex',
            chart: 'b',
            isToggleBidOffer: false,
            algorandBestBidAndBestOfferApplicationId: '',
            algorandBestBidAndBestOfferApplicationIdLink: '',
        }

        columns = [
            columnHelper.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Quantity</span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price</span>,
            }),
            columnHelper.accessor((row) => row.bid_date, {
                id: "bid_date",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Date</span>,
            }),
            columnHelper.accessor((row) => row.bid_time, {
                id: "bid_time",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Time</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Quantity</span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price</span>,
            }),
            columnHelper.accessor((row) => row.offer_date, {
                id: "offer_date",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Date</span>,
            }),
            columnHelper.accessor((row) => row.offer_time, {
                id: "offer_time",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Time</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div
                        className={`table__status table__status-${item.getValue().toString().toLowerCase()}`}>
                        {item.getValue()}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => ({
                hash: row.algorand_tx_hash,
                link: row.algorand_tx_hash_link
            }), {
                id: "algorand_tx_hash_link",
                cell: (item) => {
                    return item.getValue().link ? (
                        <Link href={item.getValue().link} target={'_blank'}
                              className="link">{item.getValue().hash}</Link>
                    ) : (
                        <></>
                    )
                },
                header: () => <span>Tx Hash</span>,
            }),
        ];

        tableFilters = [
            {key: 'uti', placeholder: 'UTI'},
            {key: 'status', placeholder: 'Status'},
            {key: 'algorand_tx_hash', placeholder: 'Tx Hash'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
            .then(() => this.getBBO())
            .then(() => this.getBBOChart())
            .then(() => this.getBBOReporting())
            .finally(() => this.setState({isLoading: false}))

        window.addEventListener('click', this.handleClickOutside);

        this.startAutoUpdate();

        this.subscriptions()
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);

        this.unsubscribe();
    }

    subscriptions(): void {
        this.websocketSubscription = websocketService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) this.subscribe();
        });

        this.algorandStatisticsSubscription = websocketService.on<Array<IBestBidAndBestOffer>>(WebsocketEvent.ALGORAND_BEST_BID_AND_BEST_OFFER_STATISTICS).subscribe((data: Array<IBestBidAndBestOffer>) => {
            const bestBidAndBestOffer = data[0] || null;
            this.setState({bestBidAndBestOffer: bestBidAndBestOffer})
        });

        this.algorandChartsSubscription = websocketService.on<Array<Array<ITradingView>>>(WebsocketEvent.ALGORAND_BEST_BID_AND_BEST_OFFER_CHARTS).subscribe((data: Array<Array<ITradingView>>) => {
            const charts = this.state.chart === 'b' ? data[0] : data[1]
            this.setState({charts: charts}, () => {
                this.getBBOReporting();
            })
        });

        this.algorandTransactionsSubscription = websocketService.on<Array<IBestBidAndBestOffer>>(WebsocketEvent.ALGORAND_LAST_SALE_TRANSACTIONS).subscribe((data: Array<IBestBidAndBestOffer>) => {

        });
    }

    subscribe() {
        websocketService.subscribeOnAlgorandDataFeed(this.props.symbol)
    }

    unsubscribe() {
        websocketService.unSubscribeOnAlgorandDataFeed(this.props.symbol)
        this.websocketSubscription?.unsubscribe();
        this.algorandStatisticsSubscription?.unsubscribe();
        this.algorandChartsSubscription?.unsubscribe();
        this.algorandTransactionsSubscription?.unsubscribe();
    }

    getBBO = () => {
        return new Promise((resolve) => {
            statisticsService.getBestBidAndBestOfferBySymbol(this.props.symbol)
                .then((res: Array<IBestBidAndBestOffer>) => {
                    let bestBidAndBestOffer = res[0] || null as any
                    this.setState({bestBidAndBestOffer: bestBidAndBestOffer})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        })

    }

    getBBOReporting = () => {
        return new Promise((resolve) => {
            bestBidAndBestOfferService.getBestBidAndBestOfferBySymbol(this.props.symbol)
                .then((res: Array<IBestBidAndBestOffer>) => {
                    const data = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

                    data.forEach(s => {
                        s.status = formatterService.getTransactionStatusName(s.algorand_tx_hash || '')
                    })

                    this.setState({transactions: data});
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        })

    }

    startAutoUpdate = () => {
        this.getBestBidAndBestOfferReportingInterval = setInterval(this.getBBOReporting, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getBestBidAndBestOfferReportingInterval) clearInterval(this.getBestBidAndBestOfferReportingInterval as number);
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    getBBOChart = () => {
        return new Promise((resolve) => {
            bestBidAndBestOfferService.getBestBidAndBestOfferChartBySymbol(this.props.symbol, this.state.chart)
                .then((res: Array<ITradingView>) => {
                    this.setState({charts: res})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingChart: false})
                    resolve(true);
                });
        })

    }

    getChart = (chart: string) => {
        this.setState({isLoadingChart: true, chart: chart, isToggleBidOffer: false}, () => {
            this.getBBOChart();
        });
    }

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const data = res || [];

                    const symbol = data.find((s: ISymbol) => s.symbol === formatterService.getSymbolName(this.props.symbol));
                    const companyProfile = symbol?.company_profile ?? null;
                    const algorandBestBidAndBestOfferApplicationId = symbol?.algorand_best_bid_and_best_offer_application_id ?? ''
                    const algorandBestBidAndBestOfferApplicationIdLink = symbol?.algorand_best_bid_and_best_offer_application_id_link ?? ''

                    this.setState({
                        companyProfile: companyProfile,
                        algorandBestBidAndBestOfferApplicationId: algorandBestBidAndBestOfferApplicationId,
                        algorandBestBidAndBestOfferApplicationIdLink: algorandBestBidAndBestOfferApplicationIdLink
                    });
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true)
                });
        });
    }

    handleBack = () => {
        const router = useRouter();
        router.push('/algorand-data-feed');
    }

    onCallback = async (values: any, step: boolean) => {
        this.getBBOReporting();
    };

    setActiveTab = () => {
        this.context.setSharedData({activeTab: 'best-bid-and-best-offer'})
    }

    toggleBidOfferMenu = () => {
        this.setState({isToggleBidOffer: !this.state.isToggleBidOffer})
    };

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-best-bid-and-best-offer');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggleBidOffer: false});
        }
    };

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        <div className="d-flex align-items-center justify-content-between flex-1">
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/> <Link
                                    className="login__link"
                                    href="/algorand-data-feed"
                                    onClick={() => this.setActiveTab()}
                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>

                        <div className={'flex-panel-box'}>
                            <div className={'panel d-flex justify-content-between align-items-center'}>
                                <div
                                    className={'content__bottom d-flex align-items-center justify-content-between w-100'}>
                                    <div className={'d-flex gap-10'}>
                                        <div className={'cursor-pointer title d-flex align-items-center gap-10'}>
                                            <h2 className={'view_block_main_title mb-0'}>
                                                <div className={"company-profile-logo"}>
                                                    <AssetImage alt=''
                                                                src={this.state.companyProfile?.logo}
                                                                width={60}
                                                                height={60}/>
                                                </div>
                                                <>{formatterService.formatSymbolName(this.props.symbol)}</>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={'indicators content__bottom'}>
                            <div className={'indicator__item statistics mw-30'}>
                                <div className="content__top pb-0">
                                    <div className="content__title">Best Bid and Best Offer</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
                                    <div>
                                        <div>Contract Address:</div>
                                        <div
                                            className={'padding-left-60'}>
                                            <div className={'d-flex align-items-center'}>
                                                <Link
                                                    href={this.state.algorandBestBidAndBestOfferApplicationIdLink || ''}
                                                    target={'_blank'}
                                                    className="link">{this.state.algorandBestBidAndBestOfferApplicationId ?? ''}</Link>
                                                <CopyClipboard
                                                    text={`${this.state.algorandBestBidAndBestOfferApplicationId ?? ''}`}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div>Symbol:</div>
                                        <div
                                            className={'padding-left-60'}> {this.props.symbol}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Currency:</div>
                                        <div
                                            className={'padding-left-60'}> USD
                                        </div>
                                    </div>
                                    <div>
                                        <div>Bid Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.bid_quantity ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.bid_quantity), Number(this.state.bestBidAndBestOffer?.fractional_lot_size || 0)) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Bid Price:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.bid_price ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.bid_price), decimalPlaces) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Offer Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.offer_quantity ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.offer_quantity), Number(this.state.bestBidAndBestOffer?.fractional_lot_size || 0)) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Offer Price:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.offer_price ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.offer_price), decimalPlaces) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={'align-items-center d-flex'}>Network:</div>
                                        <div
                                            className={`table-image d-flex align-items-center gap-10`}
                                        >
                                            <div className="table-image-container">
                                                <AssetImage alt='' src={'/img/algorand-network-logo.svg'} width={20}
                                                            height={20}/>
                                            </div>
                                            Algorand
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className={'indicator__item statistics p-20'}>
                                {this.state.isLoadingChart ? (
                                    <div className={'flex-1-1-100 justify-content-center'}>
                                        <LoaderBlock/>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="content__title_btns content__filter download-buttons justify-content-end mb-24 p-0 flex-1-1-100 align-items-baseline">
                                            <div className="filter-menu filter-menu-best-bid-and-best-offer">
                                                <Button
                                                    variant="link"
                                                    className="d-md-none admin-table-btn ripple"
                                                    type="button"
                                                    onClick={this.toggleBidOfferMenu}
                                                >
                                                    {this.state.isToggleBidOffer ? (
                                                        <FontAwesomeIcon icon={faSortAmountAsc}/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faSortAmountDesc}/>
                                                    )}
                                                </Button>

                                                <ul className={`${this.state.isToggleBidOffer ? 'open' : ''}`}>
                                                    <li>
                                                        <button
                                                            className={`border-grey-btn ripple d-flex ${this.state.chart === 'b' ? 'active' : ''}`}
                                                            onClick={() => this.getChart('b')}>
                                                            <span>Bid</span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            className={`border-grey-btn ripple d-flex ${this.state.chart === 'a' ? 'active' : ''}`}
                                                            onClick={() => this.getChart('a')}>
                                                            <span>Offer</span>
                                                        </button>
                                                    </li>
                                                </ul>

                                            </div>
                                        </div>

                                        <div className={'flex-1-1-100 justify-content-center'}>
                                            {this.state.charts.length ? (
                                                <AreaAndBarChart data={this.state.charts}/>
                                            ) : (
                                                <div className="no-chart">
                                                    <NoDataBlock primaryText="No Chart available yet"/>
                                                </div>
                                            )}
                                        </div>
                                    </>

                                )}
                            </div>
                        </div>

                        <div className={'panel'}>
                            <div className={`content__bottom`}>
                                <Table columns={columns}
                                       data={this.state.transactions}
                                       searchPanel={true}
                                       block={this}
                                       editBtn={false}
                                       viewBtn={false}
                                       filters={tableFilters}
                                       filtersClassName={this.state.filtersClassName}
                                       ref={this.tableRef}
                                />
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default AlgorandDataFeedBestBidAndBestOfferPerSymbolBlock;
