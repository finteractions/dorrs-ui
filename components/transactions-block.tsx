import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import DateRangePicker from "@/components/date-range-picker";
import moment from "moment";
import ordersService from "@/services/orders/orders-service";
import LoaderBlock from "./loader-block";
import NoDataBlock from "./no-data-block";
import AlertBlock from "./alert-block";
import {ITransaction} from "../interfaces/i-transaction";
import downloadFile from "@/services/download-file/download-file";
import Select from 'react-select';
import filterService from "@/services/filter/filter";

let isDashboard = false;

let title = 'Transactions';

const MAX_ITEMS: number = 4;

const txTypeIcon = (type: string) => {
    let icon = '';

    switch (type.toLowerCase()) {
        case 'deposit':
            icon = '/img/dep-ico.svg'
            break
        case 'exchange':
            icon = '/img/ex-ixo.svg'
            break
        case 'withdraw':
            icon = '/img/with-ico.svg'
            break
        default:
            icon = ''
            break
    }

    return icon ? <Image src={icon} width={17} height={17} alt={type}/> : '';
};

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface TransactionsBlockProps {
    isDashboard?: boolean;
    title?: string;
}

interface TransactionsBlockState extends IState {
    dataFull: ITransaction[];
    data: ITransaction[];
    errors: string[];
    loading: boolean;
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class TransactionsBlock extends React.Component<TransactionsBlockProps, TransactionsBlockState> {

    state: TransactionsBlockState;
    dateRangePickerRef: any = React.createRef<typeof DateRangePicker>();
    getTransactionsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        isDashboard = this.props?.isDashboard ?? true;
        title = this.props?.title || title;

        columns = [
            columnHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Date &amp; time</span>,
            }),
            columnHelper.accessor((row) => row.type, {
                id: "type",
                cell: (item) =>
                    <div className="table__type">
                        <div className="table__type-ico">
                            {txTypeIcon(item.getValue())}
                        </div>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Type</span>,
            }),
            columnHelper.accessor((row) => ({
                type: row.type,
                base_price: row.base_price,
                base_currency: row.base_currency,
                quote_price: row.quote_price,
                quote_currency: row.quote_currency
            }), {
                id: "base_price",
                cell: (item) =>
                    item.getValue().type.toLowerCase() == 'exchange' ? (
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency.label} -&gt; {formatterService.numberFormat(item.getValue().quote_price)} {item.getValue().quote_currency.label}</span>
                    ) : (
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency.label}</span>
                    )
                ,
                header: () => <span>Amount</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Status</span>,
            })
        ];

        this.state = {
            dataFull: [],
            data: [],
            success: false,
            errors: [],
            loading: true,
            filterData: []
        }
    }

    componentDidMount() {
        this.setState({loading: true});

        this.getTransactions();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getTransactions = () => {
        // ordersService.getTransactions()
        //     .then((res: ITransaction[]) => {
        //         const dataFull = res?.sort((a, b) => b.id - a.id) || [];
        //         const data = dataFull.slice(0, !isDashboard ? dataFull.length : MAX_ITEMS);
        //         this.setState({dataFull: dataFull, data: data}, () => {
        //             // const {
        //             //     startDate,
        //             //     endDate
        //             // } = this.dateRangePickerRef?.current?.getSelectedDates() ?? {startDate: null, endDate: null};
        //             // this.onChange(startDate, endDate);
        //             this.filterData();
        //         });
        //     })
        //     .catch((errors: IError) => {
        //         this.setState({errors: errors.messages});
        //     })
        //     .finally(() => {
        //         this.setState({loading: false})
        //     });
    }

    startAutoUpdate(): void {
        this.getTransactionsInterval = setInterval(this.getTransactions, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getTransactionsInterval) clearInterval(this.getTransactionsInterval);
    }

    // onChange = (startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
    //     const filteredData = startDate !== null && endDate !== null ? this.state.dataFull.filter((row) => {
    //         const date = moment(row.date_time);
    //         return (!startDate || date.isSameOrAfter(startDate, 'date')) && (!endDate || date.isSameOrBefore(endDate, 'date'));
    //     }) : this.state.dataFull;
    //     this.setState({data: filteredData});
    // }

    handleFilterDateChange = (prop_name: string, startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: {startDate: startDate, endDate: endDate}}
        }), () => {
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

    handleResetButtonClick = () => {
        this.dateRangePickerRef.current.onReset();
        this.setState({data: this.state.dataFull, filterData: []});
    }

    downloadTransactionsCSV = () => {
        let from_date = this.state.filterData?.date_time?.startDate
        let to_date = this.state.filterData?.date_time?.endDate

        if (from_date && to_date) {
            from_date = from_date.format("DD-MM-YYYY");
            to_date = to_date.format("DD-MM-YYYY");
        } else {
            from_date = moment().subtract('years', 1).format("DD-MM-YYYY");
            to_date = moment().format("DD-MM-YYYY");
        }

        // ordersService.downloadTransactions({from_date: from_date, to_date: to_date}).then((res) => {
        //     downloadFile.CSV('transactions', res);
        // })
    }

    downloadTransactionsXLSX = () => {
        let from_date = this.state.filterData?.date_time?.startDate
        let to_date = this.state.filterData?.date_time?.endDate

        if (from_date && to_date) {
            from_date = from_date.format("DD-MM-YYYY");
            to_date = to_date.format("DD-MM-YYYY");
        } else {
            from_date = moment().subtract('years', 1).format("DD-MM-YYYY");
            to_date = moment().format("DD-MM-YYYY");
        }
        // ordersService.downloadTransactions({from_date: from_date, to_date: to_date}).then((res) => {
        //     downloadFile.XLSX('transactions', res);
        // })
    }

    render() {
        return (
            <div className="transactions section">
                <div className={`content__top ${!isDashboard ? 'xs-d-block' : ''}`}>
                    <div className="content__title">{title}</div>
                    {isDashboard && (
                        <Link href="/transactions" className="b-link">View all</Link>
                    )}

                    {(!isDashboard && this.state.data.length > 0) && (
                        <div className={`content__filter download-buttons`}>
                            <button className="content__filter-clear ripple d-flex"
                                    onClick={this.downloadTransactionsCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button className="content__filter-clear ripple d-flex"
                                    onClick={this.downloadTransactionsXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                        </div>
                    )}
                </div>

                {this.state.loading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {!isDashboard && (
                            <div className="content__filter mb-3">

                                <div className="input__wrap">
                                    <DateRangePicker
                                        onChange={(startDate, endDate) => {
                                            this.handleFilterDateChange('date_time', startDate, endDate)
                                        }}
                                        onReset={() => {
                                        }}
                                        ref={this.dateRangePickerRef}
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('type', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('type', item)}
                                        options={filterService.buildOptions('type', this.state.dataFull)}
                                        placeholder="Type"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('base_currency.name', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('base_currency.name', item)}
                                        options={filterService.buildOptions('base_currency.name', this.state.dataFull)}
                                        placeholder="Currency (from)"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('quote_currency.name', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('quote_currency.name', item)}
                                        options={filterService.buildOptions('quote_currency.name', this.state.dataFull)}
                                        placeholder="Currency (to)"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('status', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('status', item)}
                                        options={filterService.buildOptions('status', this.state.dataFull)}
                                        placeholder="Status"
                                    />
                                </div>
                                <button
                                    className="content__filter-clear ripple"
                                    onClick={this.handleResetButtonClick}>
                                    Clear
                                </button>
                            </div>
                        )}

                        {this.state.data.length ? (
                            <Table columns={columns} data={this.state.data}/>
                        ) : (
                            <>
                                {this.state.errors && this.state.errors.length ? (
                                    <AlertBlock type="error" messages={this.state.errors}/>
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        )
    }
}

export default TransactionsBlock;
