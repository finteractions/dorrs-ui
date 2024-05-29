import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {IBalance} from "@/interfaces/i-balance";
import downloadFile from "@/services/download-file/download-file";
import BalanceForm from "@/components/backend/balance-form";
import Modal from "@/components/modal";
import moment from "moment";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import DateRangePicker from "@/components/date-range-picker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface BalancesBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IBalance | null;
    formAction: string;
    data: IBalance[];
    errors: string[];
    dataFull: IBalance[];
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class BalancesBlock extends React.Component<{}> {
    state: BalancesBlockState;

    getBalancesInterval: NodeJS.Timer | number | undefined;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
            data: [],
            errors: [],
            dataFull: [],
            filterData: []
        }

        columns = [

            columnHelper.accessor((row) => row.user_id, {
                id: "user_id",
                cell: (item) => item.getValue(),
                header: () => <span>User</span>,
            }),
            columnHelper.accessor((row) => row.balance, {
                id: "balance",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Balance</span>,
            }),
            columnHelper.accessor((row) => row.asset, {
                id: "asset",
                cell: (item) => item.getValue(),
                header: () => <span>View</span>,
            }),
            columnHelper.accessor((row) => row.wallet_address, {
                id: "wallet_address",
                cell: (item) => item.getValue(),
                header: () => <span>Wallet Address</span>,
            }),

        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getBalances();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getBalances = () => {
        adminService.getBalances()
            .then((res: IBalance[]) => {
                const data = res?.sort((a, b) =>  a.id - b.id) || [];
                data.forEach(s => {
                    s.editable = s.wallet_address.toLowerCase() === 'fiat'
                })
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
        this.getBalancesInterval = setInterval(this.getBalances, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getBalancesInterval) clearInterval(this.getBalancesInterval as number);
    }

    downloadBalancesCSV = () => {
        const data = {}
        adminService.downloadBalances(data).then((res) => {
            downloadFile.CSV('balances', res);
        })
    }

    downloadBalancesXLSX = () => {
        const data = {}
        adminService.downloadBalances(data).then((res) => {
            downloadFile.XLSX('balances', res);
        })
    }

    openModal = (mode: string, data?: IBalance) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode})
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        this.setState({isOpenModal: false})
        this.getBalances();
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
                        <div className="content__title">Balances Screen</div>
                        {(this.state.data.length > 0) && (
                            <div className={`download-buttons`}>
                                <button className="border-grey-btn ripple d-flex"
                                        onClick={this.downloadBalancesCSV}>
                                    <span className="file-item__download"></span>
                                    <span>CSV</span>
                                </button>
                                <button className="border-grey-btn ripple d-flex"
                                        onClick={this.downloadBalancesXLSX}>
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
                                                value={filterService.setValue('asset', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('asset', item)}
                                                options={filterService.buildOptions('asset', this.state.dataFull)}
                                                placeholder="View"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('wallet_address', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('wallet_address', item)}
                                                options={filterService.buildOptions('wallet_address', this.state.dataFull)}
                                                placeholder="Wallet Address"
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
                                            editBtn={true}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No balances available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
                <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title='Edit Balance'>
                    <BalanceForm action={this.state.formAction} data={this.state.formData} onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()} />
                </Modal>
            </>
        )
    }
}

export default BalancesBlock;
