import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import lastSaleService from "@/services/last-sale/last-sale-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import {createColumnHelper} from "@tanstack/react-table";
import {Condition} from "@/enums/condition";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import symbolService from "@/services/symbol/symbol-service";
import downloadFile from "@/services/download-file/download-file";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import NoDataBlock from "@/components/no-data-block";
import {AreaAndBarChart} from "@/components/chart/area-and-bar-chart";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faFilter, faSortAmountAsc} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import AssetImage from "@/components/asset-image";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";

interface LastSaleReportingPerSymbolProps {
    symbol: string;
    symbolSuffix?: string;
    isDashboard?: boolean;
}

interface LastSaleReportingPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    data: ILastSale[];
    mpid: string | null;
    isChartToggle: boolean;
    isTableToggle: boolean;
    isTableFilterShow: boolean;
    filtersClassName: string;
    period: string;
    previousPeriod: string | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class LastSaleReportingPerSymbolBlock extends React.Component<LastSaleReportingPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: LastSaleReportingPerSymbolState;
    isDashboard: boolean;
    getLastSaleReportingInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: LastSaleReportingPerSymbolProps) {
        super(props);

        this.companyProfile = null;
        this.isDashboard = this.props.isDashboard ?? false;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            data: [],
            mpid: null,
            isChartToggle: false,
            isTableToggle: false,
            isTableFilterShow: false,
            period: '',
            previousPeriod: null,
            filtersClassName: 'd-none d-md-flex',
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => item.getValue(),
                header: () => <span>Condition</span>,
            }),
            columnHelper.accessor((row) => ({
                mpid: row.mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link table-image'}
                         onClick={() => {
                             this.handleMPID(item.getValue().mpid);
                         }}
                    >
                        <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                   height={28}/>
                        {item.getValue().mpid}
                    </div>,
                header: () => <span>MPID</span>,
            }),
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
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => formatterService.formatAndColorTickIndicationValueHTML(item.getValue()),
                header: () => <span>Tick</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];

        tableFilters = [
            {key: 'origin', placeholder: 'Origin'},
            {key: 'condition', placeholder: 'Condition'},
            {key: 'mpid', placeholder: 'MPID'},
            {key: 'tick_indication', placeholder: 'Tick'},
            {key: 'uti', placeholder: 'UTI'},
            {key: 'date', placeholder: 'Date'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
            .then(() => this.getLastSaleReportingChart())
            .then(() => this.getLastSaleReporting())
            .finally(() => this.setState({isLoading: false}))
        window.addEventListener('click', this.handleChartClickOutside);
        window.addEventListener('click', this.handleTableClickOutside);
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.addEventListener('click', this.handleChartClickOutside);
        window.addEventListener('click', this.handleTableClickOutside);
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

    toggleChartMenu = () => {
        this.setState({isChartToggle: !this.state.isChartToggle})
    };


    handleChartClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-last-sale-chart');
        if (menu && !menu.contains(event.target)) {
            this.setState({isChartToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isTableFilterShow: !this.state.isTableFilterShow}, () => {
            this.setState({filtersClassName: this.state.isTableFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    getLastSaleReportingChart = () => {
        return new Promise((resolve) => {
            lastSaleService.getLastSaleReportingChartBySymbol(this.props.symbol, this.props.symbolSuffix, this.state.period)
                .then((res: Array<ITradingView>) => {
                    this.charts = res;
                    const period = this.charts[0]?.period || this.state.period;
                    const previousPeriod = this.state.previousPeriod == null ? period : this.state.previousPeriod;
                    this.setState({period: period, previousPeriod: previousPeriod});
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
                    let data = res || [];

                    const symbol = data.find((s: ISymbol) => s.symbol === this.props.symbol);
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
            lastSaleService.getLastSaleReportingBySymbol(this.props.symbol, this.props.symbolSuffix)
                .then((res: Array<ILastSale>) => {
                    const data = res || [];

                    data.forEach(s => {
                        s.condition = Condition[s.condition as keyof typeof Condition] || ''
                    })

                    this.setState({data: data});
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
        router.push('/last-sale-reporting');
    }

    onCallback = async (values: any, step: boolean) => {
        await this.getLastSaleReporting();
    };

    downloadLastSaleReportingCSV = () => {
        if (this.tableRef.current) {
            lastSaleService.downloadLastSalesBySymbol(this.props.symbol, this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('last_sale_reporting', res);
            })
        }

    }

    downloadLastSaleReportingXLSX = () => {
        if (this.tableRef.current) {
            lastSaleService.downloadLastSalesBySymbol(this.props.symbol, this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('last_sale_reporting', res);
            })
        }
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    setPeriod = (period: string) => {
        this.setState({
            isLoadingChart: true,
            period: period,
            isChartToggle: false
        }, async () => {
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
                        {!this.isDashboard && (
                            <div className="d-flex align-items-center justify-content-between flex-1">
                                <div className="login__bottom">
                                    <p>
                                        <i className="icon-chevron-left"/> <Link
                                        className="login__link"
                                        href="/last-sale-reporting"

                                    >Back
                                    </Link>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className={'panel'}>
                            <div className={`content__bottom`}>
                                {!this.isDashboard ? (
                                    <h2 className={'view_block_main_title'}>
                                        <div className={"company-profile-logo"}>
                                            <AssetImage alt=''
                                                        src={this.companyProfile?.logo}
                                                        width={60}
                                                        height={60}/>
                                        </div>
                                        {this.companyProfile ? (
                                            <>
                                                {this.companyProfile.company_name} ({this.props.symbol})
                                            </>
                                        ) : (
                                            <>{this.props.symbol}{this.props.symbolSuffix ? `:${this.props.symbolSuffix}` : ``}</>
                                        )}
                                    </h2>
                                ) : (
                                    <div className={'content__top  px-0 border-bottom-0'}>
                                        <div className={'content__title'}>
                                            Last Sale Reporting
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="content__title_btns content__filter download-buttons justify-content-end mb-24 ">
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
                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '1d' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                    onClick={() => this.setPeriod('1d')}>
                                                    <span>1 Day</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '30d' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                    onClick={() => this.setPeriod('30d')}>
                                                    <span>30 Days</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className={`border-grey-btn ripple d-flex ${this.state.period === '3m' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                                    disabled={this.state.isLoading || this.state.isLoadingChart}
                                                    onClick={() => this.setPeriod('3m')}>
                                                    <span>3 Months </span>
                                                </button>
                                            </li>
                                            {/*{this.state.previousPeriod === '' && (*/}
                                            {/*    <li>*/}
                                            {/*        <button*/}
                                            {/*            className={`border-grey-btn ripple d-flex ${this.state.period === '' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}*/}
                                            {/*            disabled={this.state.isLoading || this.state.isLoadingChart}*/}
                                            {/*            onClick={() => this.setPeriod('')}>*/}
                                            {/*            <span>All </span>*/}
                                            {/*        </button>*/}
                                            {/*    </li>*/}
                                            {/*)}*/}
                                        </ul>
                                    </div>
                                </div>

                                {this.state.isLoadingChart ? (
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        {this.charts.length ? (
                                            <div className={'mb-48'}>
                                                <AreaAndBarChart data={this.charts}/>
                                            </div>
                                        ) : (
                                            <div className="no-chart mb-24">
                                                <NoDataBlock primaryText="No Chart available yet"/>
                                            </div>
                                        )}
                                    </>

                                )}

                                {!this.isDashboard && (
                                    <div
                                        className="content__title_btns content__filter download-buttons justify-content-end mb-24">
                                        <div className="filter-menu filter-menu-last-sale-table">
                                            <Button
                                                variant="link"
                                                className="d-md-none admin-table-btn ripple"
                                                type="button"
                                                onClick={this.toggleTableMenu}
                                            >
                                                <FontAwesomeIcon icon={faFileExport}/>
                                            </Button>
                                            <ul className={`${this.state.isTableToggle ? 'open' : ''}`}>
                                                <li>
                                                    <button className="border-grey-btn ripple d-flex"
                                                            onClick={this.downloadLastSaleReportingCSV}>
                                                        <span className="file-item__download"></span>
                                                        <span>CSV</span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="border-grey-btn ripple d-flex"
                                                            onClick={this.downloadLastSaleReportingXLSX}>
                                                        <span className="file-item__download"></span>
                                                        <span>XLSX</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>

                                        <Button
                                            variant="link"
                                            className="d-md-none admin-table-btn ripple"
                                            type="button"
                                            onClick={() => this.handleShowFilters()}
                                        >
                                            <FontAwesomeIcon icon={faFilter}/>
                                        </Button>
                                    </div>
                                )}

                                <Table columns={columns}
                                       data={this.state.data}
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

export default LastSaleReportingPerSymbolBlock;
