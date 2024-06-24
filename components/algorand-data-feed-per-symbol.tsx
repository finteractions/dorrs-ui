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
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";
import AssetImage from "@/components/asset-image";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import statisticsService from "@/services/statistics/statistics-service";
import lastSaleService from "@/services/last-sale/last-sale-service";

interface AlgorandDataFeedPerSymbolProps {
    symbol: string;
}

interface AlgorandDataFeedPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    transactions: ILastSale[];
    lastSale: ILastSale | null;
    charts: Array<ITradingView>;
    mpid: string | null;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class AlgorandDataFeedPerSymbolBlock extends React.Component<AlgorandDataFeedPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    state: AlgorandDataFeedPerSymbolState;

    getLastSaleReportingInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    private websocketSubscription: Subscription | null = null;
    private algorandChartsSubscription: Subscription | null = null;
    private algorandTransactionsSubscription: Subscription | null = null;
    private algorandStatisticsSubscription: Subscription | null = null;

    constructor(props: AlgorandDataFeedPerSymbolProps) {
        super(props);

        this.companyProfile = null;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            transactions: [],
            charts: [],
            lastSale: null,
            mpid: null,
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
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
            columnHelper.accessor((row) => ({
                hash: row.algorand_tx_hash,
            }), {
                id: "status",
                cell: (item) =>
                    <div
                        className={`table__status table__status-${formatterService.getTransactionStatusColour(item.getValue().hash)}`}>
                        {formatterService.getTransactionStatusName(item.getValue().hash)}
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
            {key: 'algorand_tx_hash', placeholder: 'Tx Hash'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
        this.getLastSale()
            .then(() => this.getLastSaleReportingChart())
            .then(() => this.getLastSaleReporting())
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

        this.algorandStatisticsSubscription = websocketService.on<Array<ILastSale>>(WebsocketEvent.ALGORAND_STATISTICS).subscribe((data: Array<ILastSale>) => {
            const lastSale = data[0] || null;
            this.setState({lastSale: lastSale})
        });

        this.algorandChartsSubscription = websocketService.on<Array<ILastSale>>(WebsocketEvent.ALGORAND_CHARTS).subscribe((data: Array<ILastSale>) => {
            console.log(data)
            this.setState({charts: data})
        });

        this.algorandTransactionsSubscription = websocketService.on<Array<ITradingView>>(WebsocketEvent.ALGORAND_TRANSACTIONS).subscribe((data: Array<ITradingView>) => {
            // console.log('3')
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

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-last-sale');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    getLastSaleReportingChart = () => {
        return new Promise((resolve) => {
            lastSaleService.getLastSaleReportingChartBySymbol(this.props.symbol, undefined)
                .then((res: Array<ITradingView>) => {
                    this.setState({charts: res})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingChart: false});
                    resolve(true);
                });
        });

    }

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const data = res || [];

                    const symbol = data.find((s: ISymbol) => s.symbol === formatterService.getSymbolName(this.props.symbol));
                    this.companyProfile = symbol?.company_profile || null;
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

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
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
                                                                src={this.companyProfile?.logo}
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
                                    <div className="content__title">Last Sale</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
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
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        {this.state.charts.length ? (
                                            <AreaAndBarChart data={this.state.charts}/>
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

                        <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value: any) => this.handleMPID(value)}/>
                    </>
                )}
            </>
        );
    }

}

export default AlgorandDataFeedPerSymbolBlock;
