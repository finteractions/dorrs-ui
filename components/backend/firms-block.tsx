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
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {IFirm} from "@/interfaces/i-firm";
import FirmForm from "@/components/backend/firm-form";
import {IBank} from "@/interfaces/i-bank";
import {IBankTemplate} from "@/interfaces/i-bank-template";
import adminIconService from "@/services/admin/admin-icon-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface FirmsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formFirmData: IFirm | null;
    formBankData: IBankTemplate | null;
    formAction: string;
    data: IFirm[];
    errors: string[];
    modalTitle: string;
    dataFull: IFirm[];
    filterData: any;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class FirmsBlock extends React.Component<{}> {
    state: FirmsBlockState;
    getAssetsInterval!: NodeJS.Timer;
    columnDefinition: any;
    columnValues: any;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formFirmData: null,
            formBankData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: [],
            showSymbolForm: true,
        }

        columns = [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Name</span>,
            }),
            columnHelper.accessor((row) => row.is_member, {
                id: "is_member",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>DORRS Member</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getFirms();
        this.getBank();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getFirms = () => {
        adminService.getFirms()
            .then((res: IFirm[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];
                data.forEach((s, idx) => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.is_member_text = s.is_member? 'Yes' : 'No'
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

    getBank = () => {
        adminService.getFirmBank()
            .then((res: IBank[]) => {
                const bank = res[0];

                const columns = bank.columns;
                let values = bank.values;

                const columnsObject = JSON.parse(columns) as any
                values = values.replace(/'/g, '"');
                const valuesObject = JSON.parse(values)

                this.columnDefinition = columnsObject;
                this.columnValues = valuesObject;

                this.setState({
                    formBankData: new class implements IBankTemplate {
                        columnDefinition = columnsObject;
                        columnValues = valuesObject
                    }
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
        this.getAssetsInterval = setInterval(this.getFirms, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
    }

    openModal = (mode: string, data?: IFirm) => {

        this.setState({
            isOpenModal: true,
            formAction: mode,
            formFirmData: data || null,
            modalTitle: this.modalTitle(mode)
        })
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this firm?';
        } else if (mode === 'view') {
            return 'View Firm'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Firm`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getFirms();
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


    onCallback = async (values: any, step: boolean) => {
        this.getFirms();
        this.closeModal();
    };

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Firm Management</div>
                        <button className="border-btn ripple modal-link"
                                disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Firm
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
                                                value={filterService.setValue('name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('name', item)}
                                                options={filterService.buildOptions('name', this.state.dataFull)}
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('is_member_text', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('is_member_text', item)}
                                                options={filterService.buildOptions('is_member_text', this.state.dataFull)}
                                                placeholder="DORRS Member"
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
                                               editBtn={true}
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
                       onClose={() => this.closeModal()}
                       title={this.modalTitle(this.state.formAction)}
                >

                    <FirmForm
                        action={this.state.formAction}
                        firmData={this.state.formFirmData}
                        bankData={this.state.formBankData}
                        onCallback={this.onCallback}
                    />
                </Modal>

            </>
        )
    }
}

export default FirmsBlock;
