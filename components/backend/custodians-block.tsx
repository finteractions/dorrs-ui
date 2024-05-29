import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {ICustody} from "@/interfaces/i-custody";
import Modal from "@/components/modal";
import UserForm from "@/components/backend/user-form";
import TransactionForm from "@/components/backend/transaction-form";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import moment from "moment/moment";
import filterService from "@/services/filter/filter";
import DateRangePicker from "@/components/date-range-picker";
import Select from "react-select";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface CustodiansBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: ICustody | null;
    formAction: string;
    data: ICustody[];
    errors: string[];
    modalTitle: string;
    dataFull: ICustody[];
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class CustodiansBlock extends React.Component<{}> {
    state: CustodiansBlockState;
    dateRangePickerRef1: any = React.createRef<typeof DateRangePicker>();
    dateRangePickerRef2: any = React.createRef<typeof DateRangePicker>();
    getCustodiansInterval: NodeJS.Timer | number | undefined;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'view',
            data: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: []
        }

        columns = [

            columnHelper.accessor((row) => row.user_id, {
                id: "user_id",
                cell: (item) => item.getValue(),
                header: () => <span>User</span>,
            }),
            columnHelper.accessor((row) => row.type, {
                id: "type",
                cell: (item) => item.getValue(),
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
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency} -&gt; {formatterService.numberFormat(item.getValue().quote_price)} {item.getValue().quote_currency}</span>
                    ) : (
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency}</span>
                    ),
                header: () => <span>Amount</span>,
            }),
            columnHelper.accessor((row) => ({
                comment: row.comment,
                status: row.status
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
                        {item.getValue().comment ? <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.from_address, {
                id: "from_address",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>From Address</span>,
            }),
            columnHelper.accessor((row) => row.to_address, {
                id: "to_address",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>To Address</span>,
            }),
            columnHelper.accessor((row) => row.transaction_hash, {
                id: "transaction_hash",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>Transaction Hash</span>,
            }),
            columnHelper.accessor((row) => row.approved_by, {
                id: "approved_by",
                cell: (item) => item.getValue(),
                header: () => <span>Approved By</span>,
            }),
            columnHelper.accessor((row) => row.approved_date_time, {
                id: "approved_date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Approved Date</span>,
            }),
            columnHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getCustodians();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getCustodians = () => {
        adminService.getCustodians()
            .then((res: ICustody[]) => {
                const data = res?.sort((a, b) => b.id - a.id) || [];
                this.setState({dataFull: data, data: data},() => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getCustodiansInterval = setInterval(this.getCustodians, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getCustodiansInterval) clearInterval(this.getCustodiansInterval as number);
    }

    openModal = (mode: string, data?: ICustody) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this transaction?';
        } else if (mode === 'view') {
            return 'View Transaction'
        }else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Transaction`;
        }
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        // this.setState({isOpenModal: false})
        this.getCustodians();
    }

    handleResetButtonClick = () => {
        this.dateRangePickerRef1.current.onReset();
        this.dateRangePickerRef2.current.onReset();
        this.setState({data: this.state.dataFull, filterData: []});
    }

    handleFilterDateChange = (prop_name: string, startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
        this.setState(({
            filterData: { ...this.state.filterData, [prop_name]: {startDate: startDate, endDate: endDate} }
        }), () => {
            this.filterData();
        });
    }

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: { ...this.state.filterData, [prop_name]: item?.value || ''}
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
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Transactions</div>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    <div className="content__filter mb-3">
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('user_id', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('user_id', item)}
                                                options={filterService.buildOptions('user_id', this.state.dataFull)}
                                                placeholder="User"
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
                                                value={filterService.setValue('base_currency', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('base_currency', item)}
                                                options={filterService.buildOptions('base_currency', this.state.dataFull)}
                                                placeholder="Currency (from)"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('quote_currency', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('quote_currency', item)}
                                                options={filterService.buildOptions('quote_currency', this.state.dataFull)}
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
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('approved_by', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('approved_by', item)}
                                                options={filterService.buildOptions('approved_by', this.state.dataFull)}
                                                placeholder="Approved By"

                                            />
                                        </div>
                                        <div className="date__range__wrap">
                                            <DateRangePicker
                                                onChange={(startDate, endDate) => {this.handleFilterDateChange('approved_date_time',startDate, endDate)}}
                                                onReset={() => {}}
                                                ref={this.dateRangePickerRef1}
                                            />
                                        </div>
                                        <div className="date__range__wrap">
                                            <DateRangePicker
                                                onChange={(startDate, endDate) => {this.handleFilterDateChange('date_time',startDate, endDate)}}
                                                onReset={() => {}}
                                                ref={this.dateRangePickerRef2}
                                            />
                                        </div>
                                        <button
                                            className="content__filter-clear ripple"
                                            onClick={this.handleResetButtonClick}>
                                            <FontAwesomeIcon className="nav-icon" icon={filterService.getFilterResetIcon()}/>
                                        </button>
                                    </div>

                                    {this.state.data.length ? (
                                        <Table
                                            columns={columns}
                                            pageLength={pageLength}
                                            data={this.state.data}
                                            searchPanel={true}
                                            block={this}
                                            viewBtn={true}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No Custodians available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
                <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.state.modalTitle}>
                    <TransactionForm action={this.state.formAction} data={this.state.formData} onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()} />
                </Modal>
            </>
        )
    }
}

export default CustodiansBlock;
