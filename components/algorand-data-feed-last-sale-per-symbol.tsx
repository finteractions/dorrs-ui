import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import {ILastSale} from "@/interfaces/i-last-sale";
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
import lastSaleService from "@/services/last-sale/last-sale-service";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import CopyClipboard from "@/components/copy-clipboard";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faFilter, faSortAmountAsc} from "@fortawesome/free-solid-svg-icons";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";

interface AlgorandDataFeedLastSalePerSymbolProps extends ICallback {
    symbol: string;
}

interface AlgorandDataFeedLastSalePerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    companyProfile: ICompanyProfile | null,
    lastSale: ILastSale | null;
    transactions: ILastSale[];
    charts: Array<ITradingView>;
    mpid: string | null;
    isChartToggle: boolean;
    isTableToggle: boolean;
    isTableFilterShow: boolean;
    filtersClassName: string;
    period: string;
    algorandLastSaleApplicationId: string;
    algorandLastSaleApplicationIdLink: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class AlgorandDataFeedLastSalePerSymbolBlock extends React.Component<AlgorandDataFeedLastSalePerSymbolProps> {

    state: AlgorandDataFeedLastSalePerSymbolState;

    getLastSaleReportingInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    private websocketSubscription: Subscription | null = null;
    private algorandChartsSubscription: Subscription | null = null;
    private algorandTransactionsSubscription: Subscription | null = null;
    private algorandStatisticsSubscription: Subscription | null = null;

    constructor(props: AlgorandDataFeedLastSalePerSymbolProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            companyProfile: null,
            lastSale: null,
            transactions: [],
            charts: [],
            mpid: null,
            isChartToggle: false,
            isTableToggle: false,
            isTableFilterShow: false,
            filtersClassName: 'd-none d-md-flex',
            period: '',
            algorandLastSaleApplicationId: '',
            algorandLastSaleApplicationIdLink: ''
        }

        columns = [
            columnHelper.accessor((row) => ({
                quantity: row.quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Quantity</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Price</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.time, {
                id: "time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
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
            .then(() => this.getLastSale())
            .then(() => this.getLastSaleReportingChart())
            .then(() => this.getLastSaleReporting())
            .finally(() => this.setState({isLoading: false}))

        window.addEventListener('click', this.handleChartClickOutside);
        window.addEventListener('click', this.handleTableClickOutside);
        this.startAutoUpdate();
        this.subscriptions()
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.addEventListener('click', this.handleChartClickOutside);
        window.addEventListener('click', this.handleTableClickOutside);
        this.unsubscribe();
    }

    subscriptions(): void {
        this.websocketSubscription = websocketService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) this.subscribe();
        });

        this.algorandStatisticsSubscription = websocketService.on<Array<ILastSale>>(WebsocketEvent.ALGORAND_LAST_SALE_STATISTICS).subscribe((data: Array<ILastSale>) => {
            const lastSale = data[0] || null;
            this.setState({lastSale: lastSale})
        });

        this.algorandChartsSubscription = websocketService.on<Array<ITradingView>>(WebsocketEvent.ALGORAND_LAST_SALE_CHARTS).subscribe((data: Array<ITradingView>) => {
            this.setCharts(data)
                .then(() => this.getLastSaleReporting())
        });

        this.algorandTransactionsSubscription = websocketService.on<Array<ILastSale>>(WebsocketEvent.ALGORAND_LAST_SALE_TRANSACTIONS).subscribe((data: Array<ILastSale>) => {

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

    getLastSale = () => {
        return new Promise((resolve) => {
            statisticsService.getLastSaleBySymbol(this.props.symbol)
                .then((res: Array<ILastSale>) => {
                    const lastSale = res[0] || null;
                    this.setState({lastSale: lastSale})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        })
    }

    startAutoUpdate = () => {
        this.getLastSaleReportingInterval = setInterval(this.getLastSaleReporting, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getLastSaleReportingInterval) clearInterval(this.getLastSaleReportingInterval as number);
    }

    toggleTableMenu = () => {
        this.setState({isTableToggle: !this.state.isTableToggle})
    };

    handleTableClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-last-sale-table');
        if (menu && !menu.contains(event.target)) {
            this.setState({isTableToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isTableFilterShow: !this.state.isTableFilterShow}, () => {
            this.setState({filtersClassName: this.state.isTableFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    toggleChartMenu = () => {
        this.setState({isChartToggle: !this.state.isChartToggle})
    };


    handleChartClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-last-sale-chart');
        if (menu && !menu.contains(event.target)) {
            this.setState({isChartToggle: false});
        }
    };

    getLastSaleReportingChart = () => {
        return new Promise((resolve) => {
            lastSaleService.getLastSaleReportingChartBySymbol(this.props.symbol, undefined)
                .then(async (res: Array<ITradingView>) => {
                    await this.setCharts(res);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingChart: false});
                    resolve(true);
                });
        });

    }

    setCharts = (res: Array<ITradingView>) => {
        return new Promise(resolve => {
            const period = res[0]?.period || '';
            this.setState({charts: res, period: period}, () => {
                resolve(true);
            })
        })
    }

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    let data = res || [];

                    const symbol = data.find((s: ISymbol) => s.symbol === formatterService.getSymbolName(this.props.symbol));
                    const companyProfile = symbol?.company_profile ?? null;
                    const algorandLastSaleApplicationId = symbol?.algorand_last_sale_application_id ?? ''
                    const algorandlastSaleApplicationIdLink = symbol?.algorand_last_sale_application_id_link ?? ''

                    this.setState({
                        companyProfile: companyProfile,
                        algorandLastSaleApplicationId: algorandLastSaleApplicationId,
                        algorandLastSaleApplicationIdLink: algorandlastSaleApplicationIdLink
                    });
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true)
                });
        });
    }

    getLastSaleReporting = () => {
        return new Promise((resolve) => {
            lastSaleService.getLastSaleReportingBySymbol(this.props.symbol, undefined)
                .then((res: Array<ILastSale>) => {
                    const data = res || [];

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
        });

    }
    handleBack = () => {
        const router = useRouter();
        router.push('/algorand-data-feed');
    }

    onCallback = async (values: any, step: boolean) => {
        this.getLastSaleReporting();
    };

    setActiveTab = () => {
        this.props.onCallback({activeTab: 'last-sale'})
    }

    setPeriod = (period: string) => {
        this.setState({isLoadingChart: true, period: period, isChartToggle: false}, async () => {
            await this.getLastSaleReportingChart();
        });
    }


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

                        <div className={'indicators content__bottom p-0'}>
                            <div className={'indicator__item statistics mw-30'}>
                                <div className="content__top pb-0">
                                    <div className="content__title">Last Sale</div>
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
                                                    href={this.state.algorandLastSaleApplicationIdLink || ''}
                                                    target={'_blank'}
                                                    className="link">{this.state.algorandLastSaleApplicationId ?? ''}</Link>
                                                <CopyClipboard
                                                    text={`${this.state.algorandLastSaleApplicationId ?? ''}`}/>
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
                                        <div>Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.lastSale?.quantity) || 0, Number(this.state.lastSale?.fractional_lot_size || 0))}</div>
                                    </div>
                                    <div>
                                        <div>Price:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.lastSale?.price) || 0, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Price Change:</div>
                                        <div
                                            className={'pl-28'}>{formatterService.formatAndColorNumberValueHTML(this.state.lastSale?.price_changed || 0)}</div>
                                    </div>
                                    <div>
                                        <div>% Change:</div>
                                        <div>{formatterService.formatAndColorNumberBlockHTML(this.state.lastSale?.percentage_changed || 0)}</div>
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
                                        {this.state.charts.length ? (
                                            <>
                                                {this.state.period}
                                                <div
                                                    className="content__title_btns content__filter download-buttons justify-content-end">
                                                    <div className="filter-menu filter-menu-last-sale-chart">
                                                        <Button
                                                            variant="link"
                                                            className="d-md-none admin-table-btn ripple"
                                                            type="button"
                                                            onClick={this.toggleChartMenu}
                                                        >
                                                            {this.state.isChartToggle ? (
                                                                <FontAwesomeIcon icon={faSortAmountAsc}/>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faSortAmountDesc}/>
                                                            )}
                                                        </Button>

                                                        <ul className={`${this.state.isChartToggle ? 'open' : ''}`}>
                                                            <li>
                                                                <button
                                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '1d' ? 'active' : 'disabled'} ${this.state.isLoading ? 'disable' : ''}`}
                                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                                    onClick={() => this.setPeriod('1d')}>
                                                                    <span>1 Day</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '30d' ? 'active' : 'disabled'} ${this.state.isLoading ? 'disable' : ''}`}
                                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                                    onClick={() => this.setPeriod('30d')}>
                                                                    <span>30 Days</span>
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '3m' ? 'active' : 'disabled'} ${this.state.isLoading ? 'disable' : ''}`}
                                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                                    onClick={() => this.setPeriod('3m')}>
                                                                    <span>3 Months</span>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <AreaAndBarChart data={this.state.charts}/>
                                            </>

                                        ) : (
                                            <div className="no-chart">
                                                <NoDataBlock primaryText="No Chart available yet"/>
                                            </div>
                                        )}
                                    </>

                                )}
                            </div>
                        </div>

                        <div className={'panel'}>
                            <div className={`content__bottom`}>
                                <div
                                    className="content__title_btns content__filter download-buttons justify-content-end mb-24">

                                    <Button
                                        variant="link"
                                        className="d-md-none admin-table-btn ripple"
                                        type="button"
                                        onClick={() => this.handleShowFilters()}
                                    >
                                        <FontAwesomeIcon icon={faFilter}/>
                                    </Button>
                                </div>
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

export default AlgorandDataFeedLastSalePerSymbolBlock;
