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
import {IFirm} from "@/interfaces/i-firm";
import FirmForm from "@/components/backend/firm-form";
import {IBank} from "@/interfaces/i-bank";
import {IBankTemplate} from "@/interfaces/i-bank-template";
import adminIconService from "@/services/admin/admin-icon-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface FirmsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formFirmData: IFirm | null;
    formBankData: IBankTemplate | null;
    formAction: string;
    data: IFirm[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class FirmsBlock extends React.Component<{}> {
    state: FirmsBlockState;
    getAssetsInterval: NodeJS.Timer | number | undefined;
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
            showSymbolForm: true,
        }

        columns = [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Name</span>,
            }),
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) => item.getValue(),
                header: () => <span>MPID</span>,
            }),
            columnHelper.accessor((row) => row.is_member, {
                id: "is_member",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>DORRS Member</span>,
            }),
            columnHelper.accessor((row) => row.is_ats, {
                id: "is_ats",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>ATS</span>,
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

        tableFilters = [
            {key: 'name', placeholder: 'Name'},
            {key: 'mpid', placeholder: 'MPID'},
            {key: 'is_member_text', placeholder: 'DORRS Member'},
            {key: 'is_ats_text', placeholder: 'ATS'},
            {key: 'status', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.getFirms()
            .then(() => this.getBank())
            .finally(() => {
                this.setState({loading: false}, () => {
                    this.startAutoUpdate();
                })
            })


    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getFirms = () => {
        return new Promise(resolve => {
            adminService.getFirms()
                .then((res: IFirm[]) => {
                    const data = res?.sort((a, b) => a.id - b.id) || [];
                    data.forEach((s, idx) => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                        s.is_member_text = s.is_member ? 'Yes' : 'No'
                        s.is_ats_text = s.is_ats ? 'Yes' : 'No'
                    });
                    this.setState({data: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getBank = () => {
        return new Promise(resolve => {
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
                    resolve(true)
                });
        })
    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getFirms, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
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
        this.setState({isOpenModal: false}, async () => {
            await this.getFirms();
        });

    }

    onCallback = async (values: any, step: boolean) => {
        this.closeModal();
        await this.getFirms();
    };

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Firms</div>
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
                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={true}
                                               deleteBtn={true}
                                               filters={tableFilters}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No firms available yet"/>
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
