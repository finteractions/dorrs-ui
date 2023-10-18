import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import formatterService from "@/services/formatter/formatter-service";
import Modal from "@/components/modal";
import AssetForm from "@/components/backend/asset-form";
import adminIconService from "@/services/admin/admin-icon-service";
import AssetImage from "@/components/asset-image";
// import DateRangePicker from "@/components/date-range-picker";
import moment from "moment";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import MembershipForm from "@/components/membership-form";
import SymbolForm from "@/components/symbol-form";
import CompanyProfile from "@/components/company-profile-form";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface AssetsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    isOpenCompanyModal: boolean;
    formData: ISymbol | null;
    formCompanyData: ICompanyProfile | null;
    formAction: string;
    formCompanyAction: string;
    data: ISymbol[];
    errors: string[];
    modalTitle: string;
    dataFull: ISymbol[];
    filterData: any;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class AssetsBlock extends React.Component<{}> {
    state: AssetsBlockState;
    // dateRangePickerRef1: any = React.createRef<typeof DateRangePicker>();
    // dateRangePickerRef2: any = React.createRef<typeof DateRangePicker>();
    getAssetsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            isOpenCompanyModal: false,
            formData: null,
            formCompanyData: null,
            formAction: 'add',
            formCompanyAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: [],
            showSymbolForm: true
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => row.cusip, {
                id: "cusip",
                cell: (item) => item.getValue(),
                header: () => <span>CUSIP</span>,
            }),
            columnHelper.accessor((row) => ({
                symbol: row.symbol,
                company_profile: row.company_profile,
                formData: row,
                name_label: row.company_profile?.security_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div
                        className={`table-image cursor-pointer`}
                        onClick={() => {
                            this.setState({formData: item.getValue().formData, formAction: 'view'})
                            this.openCompanyModal('view', item.getValue().company_profile)
                        }}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.reason_for_entry, {
                id: "reason_for_entry",
                cell: (item) => item.getValue(),
                header: () => <span>Reason for Entry</span>,
            }),
            columnHelper.accessor((row) => row.security_name, {
                id: "security_name",
                cell: (item) => item.getValue(),
                header: () => <span>Security Name </span>,
            }),
            columnHelper.accessor((row) => row.dsin, {
                id: "dsin",
                cell: (item) => item.getValue(),
                header: () => <span>DSIN</span>,
            }),
            columnHelper.accessor((row) => row.primary_ats, {
                id: "primary_ats",
                cell: (item) => item.getValue(),
                header: () => <span>Primary ATS </span>,
            }),
            columnHelper.accessor((row) => row.transfer_agent, {
                id: "transfer_agent",
                cell: (item) => item.getValue(),
                header: () => <span>Transfer Agent </span>,
            }),
            // columnHelper.accessor((row) => row.custodian, {
            //     id: "custodian",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Custodian </span>,
            // }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector </span>,
            }),
            // columnHelper.accessor((row) => row.lot_size, {
            //     id: "lot_size",
            //     cell: (item) => formatterService.numberFormat(item.getValue()),
            //     header: () => <span>Lot Size </span>,
            // }),
            // columnHelper.accessor((row) => row.fractional_lot_size, {
            //     id: "fractional_lot_size",
            //     cell: (item) => formatterService.numberFormat(item.getValue()),
            //     header: () => <span>Fractional Lot Size </span>,
            // }),
            // columnHelper.accessor((row) => row.mvp, {
            //     id: "mvp",
            //     cell: (item) => formatterService.numberFormat(item.getValue()),
            //     header: () => <span>MPV </span>,
            // }),

            // columnHelper.accessor((row) => row.security_type, {
            //     id: "security_type",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Security Type </span>,
            // }),
            // columnHelper.accessor((row) => row.security_type_2, {
            //     id: "security_type2",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Security Type 2 </span>,
            // }),
            // columnHelper.accessor((row) => row.blockchain, {
            //     id: "blockchain",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Blockchain </span>,
            // }),
            // columnHelper.accessor((row) => row.smart_contract_type, {
            //     id: "smart_contract_type",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Smart Contract type </span>,
            // }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
            columnHelper.accessor((row) => row.company_profile_status, {
                id: "company_profile_status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Company Profile Status</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getAssets();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getAssets = () => {
        adminService.getAssets()
            .then((res: ISymbol[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;

                    if (s.company_profile && s.company_profile?.status) {
                        s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                    }

                    s.company_profile_status = s.company_profile?.status ? s.company_profile.status :  '-'
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
        this.getAssetsInterval = setInterval(this.getAssets, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
    }

    openModal = (mode: string, data?: IAdminAsset) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
        this.cancelCompanyForm();
    }

    openCompanyModal = (mode: string, data?: ICompanyProfile | null) => {
        this.setState({
            isOpenCompanyModal: true,
            formCompanyData: data || null,
            formCompanyAction: mode,
            modalTitle: this.modalTitle(mode)
        })
        this.cancelForm();
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Symbol`;
        }
    }

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Company Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Company Profile`;
        }
    }

    cancelCompanyForm(): void {
        this.setState({isOpenCompanyModal: false});
    }

    cancelForm(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false, isOpenCompanyModal: false});
        this.getAssets();
    }

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
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
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Symbol Management</div>
                        <button className="border-btn ripple modal-link"
                                disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Symbol
                        </button>
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
                                                value={filterService.setValue('reason_for_entry', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('reason_for_entry', item)}
                                                options={filterService.buildOptions('reason_for_entry', this.state.dataFull)}
                                                placeholder="Reason for Entry"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('security_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('security_name', item)}
                                                options={filterService.buildOptions('security_name', this.state.dataFull)}
                                                placeholder="Security Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('symbol', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('symbol', item)}
                                                options={filterService.buildOptions('symbol', this.state.dataFull)}
                                                placeholder="Symbol"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('cusip', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('cusip', item)}
                                                options={filterService.buildOptions('cusip', this.state.dataFull)}
                                                placeholder="CUSIP"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('dsin', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('dsin', item)}
                                                options={filterService.buildOptions('dsin', this.state.dataFull)}
                                                placeholder="DSIN"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('transfer_agent', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('transfer_agent', item)}
                                                options={filterService.buildOptions('transfer_agent', this.state.dataFull)}
                                                placeholder="Transfer Agent"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('market_sector', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('market_sector', item)}
                                                options={filterService.buildOptions('market_sector', this.state.dataFull)}
                                                placeholder="Market Sector"
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
                                                value={filterService.setValue('company_profile_status', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('company_profile_status', item)}
                                                options={filterService.buildOptions('company_profile_status', this.state.dataFull)}
                                                placeholder="Company Profile Status"
                                            />
                                        </div>
                                        <button
                                            className="content__filter-clear ripple"
                                            onClick={this.handleResetButtonClick}>
                                            <FontAwesomeIcon className="nav-icon"
                                                             icon={filterService.getFilterResetIcon()}/>
                                        </button>
                                    </div>


                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={false}
                                               deleteBtn={true}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No symbols available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.cancelForm()}
                       title={this.modalTitle(this.state.formAction)}
                >
                    {(this.state.formAction === 'edit' || this.state.formAction === 'view') && (
                        <div className="modal__navigate">
                            <div className="modal__navigate__title">Company Profile:</div>

                            {this.state.formData?.company_profile ? (
                                <>
                                    <div
                                        className={`table__status table__status-${this.state.formData?.company_profile?.status.toLowerCase()}`}>{this.state.formData?.company_profile?.status}</div>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('view', this.state.formData?.company_profile)}>
                                        View
                                    </button>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('edit', this.state.formData?.company_profile)}>
                                        Edit
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className={'border-btn ripple'}
                                            onClick={() => this.openCompanyModal('add')}>
                                        Add
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <SymbolForm action={this.state.formAction}
                                data={this.state.formData}
                                onCancel={() => this.cancelForm()}
                                onCallback={() => this.submitForm()}
                                isAdmin={true}/>
                </Modal>

                <Modal isOpen={this.state.isOpenCompanyModal}
                       className={this.state.formCompanyAction === 'view' ? 'big_modal' : ''}
                       onClose={() => this.cancelCompanyForm()}
                       title={this.modalCompanyTitle(this.state.formCompanyAction)}
                >


                    <div className="modal__navigate">
                        <button className={'border-btn ripple'}
                                onClick={() => this.setState({isOpenModal: true, isOpenCompanyModal: false})}>
                            Back to Symbol
                        </button>
                    </div>

                    <CompanyProfile action={this.state.formCompanyAction}
                                    data={this.state.formCompanyData}
                                    symbolData={this.state.formData}
                                    onCancel={() => this.cancelCompanyForm()}
                                    onCallback={() => this.submitForm()}
                                    isAdmin={true}/>

                </Modal>
            </>
        )
    }
}

export default AssetsBlock;
