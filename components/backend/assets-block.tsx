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

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface AssetsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IAdminAsset | null;
    formAction: string;
    data: IAdminAsset[];
    errors: string[];
    modalTitle: string;
    dataFull: IAdminAsset[];
    filterData: any;
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
            formData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: []
        }

        columns = [
            columnHelper.accessor((row) => ({
                name_label: row.name_label,
                image: row.image
            }), {
                id: "name",
                cell: (item) =>
                    <>
                        <div className="table-image">
                            <div className="table-image-container">
                                <AssetImage alt='' src={item.getValue().image || ''} width={28} height={28}/>
                            </div>
                            {item.getValue().name_label}
                        </div>
                    </>,
                header: () => <span>Name</span>,
            }),
            columnHelper.accessor((row) => row.network, {
                id: "network",
                cell: (item) => item.getValue(),
                header: () => <span>Network</span>,
            }),
            columnHelper.accessor((row) => row.protocol, {
                id: "protocol",
                cell: (item) => item.getValue(),
                header: () => <span>Protocol</span>,
            }),
            columnHelper.accessor((row) => row.code, {
                id: "code",
                cell: (item) => <div title={item.getValue()} className='simple-data'>{item.getValue()}</div>,
                header: () => <span>Code</span>,
            }),
            columnHelper.accessor((row) => row.qr_wallet_name, {
                id: "qr_wallet_name",
                cell: (item) => item.getValue(),
                header: () => <span>QR Wallet Name</span>,
            }),
            columnHelper.accessor((row) => row.currency_type, {
                id: "currency_type",
                cell: (item) => item.getValue(),
                header: () => <span>Currency Type</span>,
            }),
            columnHelper.accessor((row) => row.transaction_fee, {
                id: "transaction_fee",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Fee</span>,
            }),
            // columnHelper.accessor((row) => row.transaction_fee_updated, {
            //     id: "transaction_fee_updated",
            //     cell: (item) => formatterService.dateTimeFormat(item.getValue()),
            //     header: () => <span>Fee Updated</span>,
            // }),
            columnHelper.accessor((row) => row.dollar_pegged, {
                id: "dollar_pegged",
                cell: (item) => <FontAwesomeIcon className="nav-icon" icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>Dollar Pegged</span>,
            }),
            columnHelper.accessor((row) => row.dollar_pegged_rate, {
                id: "dollar_pegged_rate",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Dollar Pegged Rate</span>,
            }),
            columnHelper.accessor((row) => row.inverted_rate, {
                id: "inverted_rate",
                cell: (item) => <FontAwesomeIcon className="nav-icon" icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>Inverted Rate</span>,
            }),
            columnHelper.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Last Price</span>,
            }),
            // columnHelper.accessor((row) => row.last_price_updated, {
            //     id: "last_price_updated",
            //     cell: (item) => formatterService.dateTimeFormat(item.getValue()),
            //     header: () => <span>Last Price Updated</span>,
            // }),
            columnHelper.accessor((row) => row.active, {
                id: "active",
                cell: (item) => <FontAwesomeIcon className="nav-icon" icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>Active</span>,
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
            .then((res: IAdminAsset[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];

                data.forEach(s => {
                    s.name_label = `${s.name} (${s.label})`;
                    s.active_text = s.active ? 'Yes' : 'No';
                    s.dollar_pegged_text = s.dollar_pegged ? 'Yes' : 'No';
                    s.inverted_rate_text = s.inverted_rate ? 'Yes' : 'No';
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
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this asset?';
        } else if (mode === 'view') {
            return 'View Asset'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset`;
        }
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        this.setState({isOpenModal: false})
        this.getAssets();
    }

    handleResetButtonClick = () => {
        // this.dateRangePickerRef1.current.onReset();
        // this.dateRangePickerRef2.current.onReset();
        this.setState({data: this.state.dataFull, filterData: []});
    }

    // handleFilterDateChange = (prop_name: string, startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
    //     this.setState(({
    //         filterData: { ...this.state.filterData, [prop_name]: {startDate: startDate, endDate: endDate} }
    //     }), () => {
    //         this.filterData();
    //     });
    // }

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
                        <div className="content__title">Asset Management</div>
                        <button className="border-btn ripple modal-link"
                                disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Asset
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
                                                value={filterService.setValue('name_label', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('name_label', item)}
                                                options={filterService.buildOptions('name_label', this.state.dataFull)}
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('network', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('network', item)}
                                                options={filterService.buildOptions('network', this.state.dataFull)}
                                                placeholder="Network"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('protocol', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('protocol', item)}
                                                options={filterService.buildOptions('protocol', this.state.dataFull)}
                                                placeholder="Protocol"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('code', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('code', item)}
                                                options={filterService.buildOptions('code', this.state.dataFull)}
                                                placeholder="Code"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('qr_wallet_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('qr_wallet_name', item)}
                                                options={filterService.buildOptions('qr_wallet_name', this.state.dataFull)}
                                                placeholder="QR Wallet Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('currency_type', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('currency_type', item)}
                                                options={filterService.buildOptions('currency_type', this.state.dataFull)}
                                                placeholder="Currency Type"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('dollar_pegged_text', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('dollar_pegged_text', item)}
                                                options={filterService.buildOptions('dollar_pegged_text', this.state.dataFull)}
                                                placeholder="Dollar Pegged"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('inverted_rate_text', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('inverted_rate_text', item)}
                                                options={filterService.buildOptions('inverted_rate_text', this.state.dataFull)}
                                                placeholder="Inverted Rate"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('active_text', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('active_text', item)}
                                                options={filterService.buildOptions('active_text', this.state.dataFull)}
                                                placeholder="Active"
                                            />
                                        </div>
                                        <button
                                            className="content__filter-clear ripple"
                                            onClick={this.handleResetButtonClick}>
                                            <FontAwesomeIcon className="nav-icon" icon={filterService.getFilterResetIcon()}/>
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
                                                <NoDataBlock primaryText="No assets available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.state.modalTitle}>
                    <AssetForm updateModalTitle={(title) => this.setState({modalTitle: title})}
                               action={this.state.formAction} data={this.state.formData}
                               onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()}/>
                </Modal>
            </>
        )
    }
}

export default AssetsBlock;
