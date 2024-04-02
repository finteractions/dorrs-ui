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
import {faFileExport, faFilter} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

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
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')


class LastSaleReportingPerSymbolBlock extends React.Component<LastSaleReportingPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: LastSaleReportingPerSymbolState;
    isDashboard: boolean;

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
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }


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
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
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
        window.addEventListener('click', this.handleClickOutside);

    }

    componentWillUnmount() {
        window.addEventListener('click', this.handleClickOutside);
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
            lastSaleService.getLastSaleReportingChartBySymbol(this.props.symbol, this.props.symbolSuffix)
                .then((res: Array<ITradingView>) => {
                    this.charts = res;
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
                    const data = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

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
                    const data = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

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
        this.getLastSaleReporting();
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
                                        {this.companyProfile ? (
                                            <>
                                                <div className={"company-profile-logo"}>
                                                    <img src={this.companyProfile.logo} alt="Logo"/>
                                                </div>
                                                {this.companyProfile.company_name} ({this.companyProfile.security_name})
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

                                {this.state.isLoadingChart ? (
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        {this.charts.length ? (
                                            <AreaAndBarChart data={this.charts}/>
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
                                        <div className="filter-menu filter-menu-last-sale">
                                            <Button
                                                variant="link"
                                                className="d-md-none admin-table-btn ripple"
                                                type="button"
                                                onClick={this.toggleMenu}
                                            >
                                                <FontAwesomeIcon icon={faFileExport}/>
                                            </Button>
                                            <ul className={`${this.state.isToggle ? 'open' : ''}`}>
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
