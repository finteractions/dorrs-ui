import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "@/components/modal";
import TradeForm from "@/components/backend/trade-form";
import adminIconService from "@/services/admin/admin-icon-service";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {ISymbol} from "@/interfaces/i-symbol";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface TradesBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IAdminAsset | null;
    formAction: string;
    data: IAdminAsset[];
    errors: string[];
    dataFull: IAdminAsset[];
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class TradesBlock extends React.Component<{}> {
    state: TradesBlockState;

    getTradesInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'edit',
            data: [],
            errors: [],
            dataFull: [],
            filterData: []
        }

        columns = [
            columnHelper.accessor((row) => row.name_label, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Name</span>,
            }),

            columnHelper.accessor((row) => row.active, {
                id: "active",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
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
            .then((res: ISymbol[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];

                data.forEach(s => {
                    // s.name_label = `${s.name} (${s.label})`;
                    // s.active_text = s.active ? 'Yes' : 'No';
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
        this.getTradesInterval = setInterval(this.getAssets, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getTradesInterval) clearInterval(this.getTradesInterval);
    }

    openModal = (mode: string, data?: IAdminAsset) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode})
    }

    modalTitle = () => {
        return 'Edit Symbol Status'
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        this.setState({isOpenModal: false})
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
                        <div className="content__title">All Symbols</div>
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
                                                value={filterService.setValue('active_text', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('active_text', item)}
                                                options={filterService.buildOptions('active_text', this.state.dataFull)}
                                                placeholder="Active"
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
                                                <NoDataBlock primaryText="No data available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.modalTitle()}>
                    <TradeForm action={this.state.formAction} data={this.state.formData}
                               onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()}/>
                </Modal>
            </>
        )
    }
}

export default TradesBlock;
