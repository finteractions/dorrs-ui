import React from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import filterService from "@/services/filter/filter";
import NoDataBlock from "@/components/no-data-block";
import {IWeeklyMonthlyReport} from "@/interfaces/i-weekly-monthly-report";
import {
    IReportNumberOfSymbolAdditionsAndDeletions
} from "@/interfaces/i-report-number-of-symbol-additions-and-deletions";
import AssetImage from "@/components/asset-image";
import {FormStatus} from "@/enums/form-status";


interface ReportNumberOfSymbolAdditionsAndDeletionsState extends IState, IModalState {
    errors: string[];
    dataAdded: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    dataFullAdded: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    filterDataAdded: any;
    dataDeleted: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    dataFullDeleted: Array<IReportNumberOfSymbolAdditionsAndDeletions>;
    filterDataDeleted: any;
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
            dataAdded: [],
            dataFullAdded: [],
            filterDataAdded: [],
            dataDeleted: [],
            dataFullDeleted: [],
            filterDataDeleted: [],
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

            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date </span>,
            }),
        ];
    }

    componentDidMount() {
        const added = this.props.data.filter(s => s.status === FormStatus.APPROVED);
        const deleted = this.props.data.filter(s => s.status === FormStatus.DELETED);
        this.setState({
                dataFullAdded: added,
                dataAdded: added
            },
            () => {
                this.filterDataAdded();
            });

        this.setState({
                dataFullDeleted: deleted,
                dataDeleted: deleted
            },
            () => {
                this.filterDataDeleted();
            });
    }


    handleFilterChangeAdded = (prop_name: string, item: any): void => {
        this.setState(({
            filterDataAdded: {...this.state.filterDataAdded, [prop_name]: item?.value || ''}
        }), () => {
            this.filterDataAdded();
        });
    }

    handleFilterChangeDeleted = (prop_name: string, item: any): void => {
        this.setState(({
            filterDataDeleted: {...this.state.filterDataDeleted, [prop_name]: item?.value || ''}
        }), () => {
            this.filterDataDeleted();
        });
    }

    filterDataAdded = () => {
        this.setState({dataAdded: filterService.filterData(this.state.filterDataAdded, this.state.dataFullAdded)});
    }

    filterDataDeleted = () => {
        this.setState({dataDeleted: filterService.filterData(this.state.filterDataDeleted, this.state.dataFullDeleted)});
    }

    getRenderTable = (data: any, title: string) => {
        return (
            <>
                <div className={'content__top'}>
                    <div className={'content__title'}>
                        {title} Symbols: {data.length ? data.length : 0}
                    </div>
                </div>
                <div className="content__bottom">
                    {data.length ? (
                        <Table columns={columns}
                               data={data}
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
        )
    }

    render() {
        return (

            <>
                {this.getRenderTable(this.state.dataAdded, 'Added')}
                <hr className={'mb-24'}/>
                {this.getRenderTable(this.state.dataDeleted, 'Deleted')}
            </>

        )
    }
}

export default ReportLastSaleTotalsByAlternativeTradingSystem
