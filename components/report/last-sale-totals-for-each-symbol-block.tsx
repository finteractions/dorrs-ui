import React from 'react';
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import NoDataBlock from "@/components/no-data-block";
import {IReportLastSaleTotalForEachSymbol} from "@/interfaces/i-report-last-sale-total-for-each-symbol";
import {IWeeklyMonthlyReport} from "@/interfaces/i-weekly-monthly-report";
import LastSaleTotalsTableBlock from "@/components/report/last-sale-totals-table-block";
import {getReportTypeName, ReportType} from "@/enums/report-type";


interface ReportLastSaleTotalsForEachSymbolState extends IState, IModalState {
    errors: string[];
    data: Array<IReportLastSaleTotalForEachSymbol>;
    dataFull: Array<IReportLastSaleTotalForEachSymbol>;
    filterData: any;
    reportDetail: IReportLastSaleTotalForEachSymbol | null;
    report: IWeeklyMonthlyReport | null;
}

interface ReportLastSaleTotalsForEachSymbolProps extends ICallback {
    data: Array<IReportLastSaleTotalForEachSymbol>;
    report: IWeeklyMonthlyReport | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class ReportLastSaleTotalsForEachSymbol extends React.Component<ReportLastSaleTotalsForEachSymbolProps, ReportLastSaleTotalsForEachSymbolState> {

    state: ReportLastSaleTotalsForEachSymbolState;
    errors: Array<string> = new Array<string>();

    constructor(props: ReportLastSaleTotalsForEachSymbolProps) {
        super(props);

        this.state = {
            success: false,
            isOpenModal: false,
            errors: [],
            data: [],
            dataFull: [],
            filterData: [],
            reportDetail: null,
            report: props.report
        }

        columns = [
            columnHelper.accessor((row) => row.symbol, {
                id: "symbol",
                cell: (item) =>
                    <span>{item.getValue()}</span>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.total_number_of_transactions, {
                id: "total_number_of_transactions",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Total Number of Transactions </span>,
            }),
            columnHelper.accessor((row) => row.total_number_of_quantity, {
                id: "total_number_of_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Total Number of Quantity </span>,
            }),
            columnHelper.accessor((row) => row.total_number_of_dollar_value, {
                id: "total_number_of_dollar_value",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Total number by Dollar Value </span>,
            }),
            columnHelper.accessor((row) => row.last_updated, {
                id: "last_updated",
                cell: (item) => item.getValue(),
                header: () => <span>Last Updated </span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({dataFull: this.props.data, data: this.props.data}, () => {
            this.filterData();
        });
    }

    openModal = (mode: string, report: IReportLastSaleTotalForEachSymbol) => {
        this.setState({isOpenModal: true, reportDetail: report})
    }


    closeModal(): void {
        this.setState({isOpenModal: false, reportDetail: null})
    }

    onCallback = async (values: any) => {

    };

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

    render() {
        return (

            <>
                <div className="content__top">
                    <div className="content__title">
                        <div
                            className="content__title">{getReportTypeName(ReportType[this.state.report?.report.toUpperCase() as keyof typeof ReportType])}</div>
                    </div>
                </div>

                <>
                    <div className="content__bottom">
                        {this.state.data.length ? (
                            <Table columns={columns}
                                   data={this.state.data}
                                   searchPanel={true}
                                   block={this}
                                   editBtn={false}
                                   viewBtn={true}
                                   deleteBtn={false}
                            />
                        ) : (
                            <NoDataBlock/>
                        )}
                    </div>

                    <Modal isOpen={this.state.isOpenModal}
                           onClose={() => this.closeModal()}
                           title={`Last Sale Total by ${this.state.reportDetail?.symbol} Details`}
                           className={'big_modal'}
                    >
                        <div className={'content__bottom'}>
                            <div className={'view_panel px-20'}>
                                <div className={'view_block'}>
                                    <div className={'view_block_title bold'}>Symbol
                                    </div>
                                    <div>{this.state.reportDetail?.symbol}</div>
                                </div>
                                <div className={'view_block'}>
                                    <div className={'view_block_title bold'}>Total Number of Transactions</div>
                                    <div>{formatterService.numberFormat(Number(this.state.reportDetail?.total_number_of_transactions))}</div>
                                </div>
                                <div className={'view_block'}>
                                    <div className={'view_block_title bold'}>Total Number of Quantity</div>
                                    <div>{formatterService.numberFormat(Number(this.state.reportDetail?.total_number_of_quantity))}</div>
                                </div>
                                <div className={'view_block'}>
                                    <div className={'view_block_title bold'}>Total number by Dollar Value</div>
                                    <div>{formatterService.numberFormat(Number(this.state.reportDetail?.total_number_of_dollar_value))}</div>
                                </div>
                                <div className={'view_block'}>
                                    <div className={'view_block_title bold'}>Last Updated</div>
                                    <div>{this.state.reportDetail?.last_updated}</div>
                                </div>
                            </div>
                        </div>
                        {this.state.reportDetail ? (
                            <>
                                <LastSaleTotalsTableBlock report={this.state.report}/>
                            </>
                        ) : (
                            <NoDataBlock/>
                        )}
                    </Modal>
                </>

            </>

        )
    }
}

export default ReportLastSaleTotalsForEachSymbol
