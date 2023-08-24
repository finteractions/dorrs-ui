import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "@/components/modal";
import BankAccountForm from "@/components/backend/bank-account-form";
import adminIconService from "@/services/admin/admin-icon-service";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import DateRangePicker from "@/components/date-range-picker";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface BankAccountsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IAdminBankAccount | null;
    formAction: string;
    data: IAdminBankAccount[];
    errors: string[];
    modalTitle: string;
    dataFull: IAdminBankAccount[],
    filterData: any
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class BankAccountsBlock extends React.Component<{}> {
    state: BankAccountsBlockState;

    getBankAccountsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
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
            columnHelper.accessor((row) => row.currency, {
                id: "currency",
                cell: (item) => item.getValue(),
                header: () => <span>Currency</span>,
            }),
            columnHelper.accessor((row) => row.bank_name, {
                id: "bank_name",
                cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
                header: () => <span>Bank Name</span>,
            }),
            columnHelper.accessor((row) => row.account_number, {
                id: "account_number",
                cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
                header: () => <span>Account Number</span>,
            }),
            // columnHelper.accessor((row) => row.beneficiary_name, {
            //     id: "beneficiary_name",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Beneficiary Name</span>,
            // }),
            columnHelper.accessor((row) => row.iban, {
                id: "iban",
                cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
                header: () => <span>IBAN</span>,
            }),
            columnHelper.accessor((row) => row.swift, {
                id: "swift",
                cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
                header: () => <span>SWIFT</span>,
            }),
            // columnHelper.accessor((row) => row.bank_address, {
            //     id: "bank_address",
            //     cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
            //     header: () => <span>Bank Address</span>,
            // }),
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
            columnHelper.accessor((row) => row.approved_by, {
                id: "approved_by",
                cell: (item) => item.getValue(),
                header: () => <span>Approved By</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getBankAccounts();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getBankAccounts = () => {
        adminService.getBankAccounts()
            .then((res: IAdminBankAccount[]) => {
                const data = res.sort((a, b) => a.id - b.id);
                data.forEach(s => {
                    s.status = s.deleted ? 'Deleted' : s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase();
                });
                this.setState({dataFull: data, data: data}, () => {
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
        this.getBankAccountsInterval = setInterval(this.getBankAccounts, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getBankAccountsInterval) clearInterval(this.getBankAccountsInterval);
    }

    openModal = (mode: string, data?: IAdminBankAccount) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this bank account?';
        } else if (mode === 'view') {
            return 'View Bank Account'
        }else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Bank Account`;
        }
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(isOpenModal: boolean): void {
        this.setState({isOpenModal: isOpenModal})
        this.getBankAccounts();
    }

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
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
                        <div className="content__title">Bank Accounts</div>
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
                                                value={filterService.setValue('currency', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('currency', item)}
                                                options={filterService.buildOptions('currency', this.state.dataFull)}
                                                placeholder="Currency"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('bank_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('bank_name', item)}
                                                options={filterService.buildOptions('bank_name', this.state.dataFull)}
                                                placeholder="Bank Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('account_number', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('account_number', item)}
                                                options={filterService.buildOptions('account_number', this.state.dataFull)}
                                                placeholder="Account Number"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('iban', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('iban', item)}
                                                options={filterService.buildOptions('iban', this.state.dataFull)}
                                                placeholder="IBAN"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('swift', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('swift', item)}
                                                options={filterService.buildOptions('swift', this.state.dataFull)}
                                                placeholder="SWIFT"
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
                                        <button
                                            className="content__filter-clear ripple"
                                            onClick={this.handleResetButtonClick}>
                                            <FontAwesomeIcon className="nav-icon" icon={filterService.getFilterResetIcon()}/>
                                        </button>
                                    </div>

                                    {this.state.data.length ? (
                                        <Table
                                            columns={columns}
                                            data={this.state.data}
                                            searchPanel={true}
                                            block={this}
                                            viewBtn={true}
                                            deleteBtn={true}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No bank accounts available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
                <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.state.modalTitle}>
                    <BankAccountForm updateModalTitle={(title) => this.setState({ modalTitle: title })} action={this.state.formAction} data={this.state.formData} onCancel={() => this.cancelForm()} onCallback={(isOpenModal) => this.submitForm(isOpenModal)} />
                </Modal>

            </>
        )
    }
}

export default BankAccountsBlock;
