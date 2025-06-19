import React from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import NoDataBlock from "@/components/no-data-block";
import {IWeeklyMonthlyReport} from "@/interfaces/i-weekly-monthly-report";
import AssetImage from "@/components/asset-image";
import {ILastSale} from "@/interfaces/i-last-sale";
import {Condition} from "@/enums/condition";
import LoaderBlock from "@/components/loader-block";
import reportsService from "@/services/reports/reports-service";
import {instanceOf} from "prop-types";
import downloadFile from "@/services/download-file/download-file";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";


interface ReportLastSaleTotalsTableState extends IState {
    isLoading: boolean;
    isShowData: boolean;
    errors: string[];
    data: ILastSale[];
    dataFull: ILastSale[];
    filterData: any;
    report: IWeeklyMonthlyReport | null;
    params: any;
    isToggle: boolean;
}

interface ReportLastSaleTotalsTableProps {
    report: IWeeklyMonthlyReport | null;
    ats?: string;
    symbol?: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class ReportLastSaleTotalsTable extends React.Component<ReportLastSaleTotalsTableProps, ReportLastSaleTotalsTableState> {

    state: ReportLastSaleTotalsTableState;
    errors: Array<string> = new Array<string>();

    constructor(props: ReportLastSaleTotalsTableProps) {
        super(props);

        let params: any = {};
        if (this.props.ats) {
            params.ats = this.props.ats
        }

        if (this.props.symbol) {
            params.symbol = this.props.symbol
        }
        params = Object.assign({}, params, props.report);

        this.state = {
            success: false,
            isLoading: true,
            isShowData: false,
            errors: [],
            data: [],
            dataFull: [],
            filterData: [],
            report: props.report,
            params: params,
            isToggle: false,
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                symbol_suffix: row.symbol_suffix,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div className={`table-image`}>
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.symbol_suffix, {
                id: "symbol_suffix",
                cell: (item) => item.getValue(),
                header: () => <span>Symbol Suffix</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => item.getValue(),
                header: () => <span>Condition</span>,
            }),
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Quantity</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
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
                cell: (item) => item.getValue(),
                header: () => <span>Tick</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];
    }

    componentDidMount() {
        this.getDetails();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickOutside);
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

    getDetails = () => {

        reportsService.getDetails(this.state.params)
            .then((res: Array<ILastSale>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];

                data.forEach(s => {
                    s.condition = Condition[s.condition as keyof typeof Condition] || ''
                })

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false});

                setTimeout(() => {
                    this.setState({isShowData: true})
                })
            });
    }

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    downloadLastSalesCSV = () => {
        reportsService.downloadDetailsReport(this.state.params).then((res) => {
            downloadFile.CSV(`${this.state.report?.report}_${this.state.report?.date}-last-sales` || 'last-sales', res);
        })
    }

    downloadLastSalesXLSX = () => {
        reportsService.downloadDetailsReport(this.state.params).then((res) => {
            downloadFile.XLSX(`${this.state.report?.report}_${this.state.report?.date}-last-sales` || 'last-sales', res);
        })
    }

    render() {
        return (

            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className={!this.state.isShowData ? 'd-none' : ''}>
                            {this.state.data.length ? (
                                <div className={''}>
                                    <div className={'content__bottom'}>
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
                                                                onClick={this.downloadLastSalesCSV}>
                                                            <span className="file-item__download"></span>
                                                            <span>CSV</span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="border-grey-btn ripple d-flex"
                                                                onClick={this.downloadLastSalesXLSX}>
                                                            <span className="file-item__download"></span>
                                                            <span>XLSX</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>


                                        </div>

                                        <Table columns={columns}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               editBtn={false}
                                               viewBtn={false}
                                               pageLength={5}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <NoDataBlock/>
                            )}
                        </div>

                    </>
                )}
            </>

        )
    }
}

export default ReportLastSaleTotalsTable
