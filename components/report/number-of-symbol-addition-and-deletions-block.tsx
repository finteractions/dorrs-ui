import React from 'react';
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import NoDataBlock from "@/components/no-data-block";
import {IWeeklyMonthlyReport} from "@/interfaces/i-weekly-monthly-report";
import LastSaleTotalsTableBlock from "@/components/report/last-sale-totals-table-block";
import {
    IReportNumberOfSymbolAdditionsAndDeletions
} from "@/interfaces/i-report-number-of-symbol-additions-and-deletions";
import AssetImage from "@/components/asset-image";
import {getReportTypeName, ReportType} from "@/enums/report-type";


interface ReportNumberOfSymbolAdditionsAndDeletionsState extends IState, IModalState {
    errors: string[];
    data: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    dataFull: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    filterData: any;
    report: IWeeklyMonthlyReport | null;
    reportDetail: IReportNumberOfSymbolAdditionsAndDeletions | null;
}

interface ReportNumberOfSymbolAdditionsAndDeletionsProps extends ICallback {
    data: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    report: IWeeklyMonthlyReport | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class ReportLastSaleTotalsByAlternativeTradingSystem extends React.Component<ReportNumberOfSymbolAdditionsAndDeletionsProps, ReportNumberOfSymbolAdditionsAndDeletionsState> {

    state: ReportNumberOfSymbolAdditionsAndDeletionsState;
    errors: Array<string> = new Array<string>();

    constructor(props: ReportNumberOfSymbolAdditionsAndDeletionsProps) {
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

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol,
                image: row.image?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div className={`table-image`}>
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue().charAt(0).toUpperCase() + item.getValue().slice(1)}
                    </div>
                ,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date </span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({dataFull: this.props.data, data: this.props.data}, () => {
            this.filterData();
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
                                   viewBtn={false}
                                   deleteBtn={false}
                            />
                        ) : (
                            <NoDataBlock/>
                        )}
                    </div>
                </>

            </>

        )
    }
}

export default ReportLastSaleTotalsByAlternativeTradingSystem
