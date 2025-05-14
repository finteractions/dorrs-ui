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
import AssetImage from "@/components/asset-image";
import SymbolForm from "@/components/symbol-form";
import CompanyProfile from "@/components/company-profile-form";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import downloadFile from "@/services/download-file/download-file";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import {getSymbolSourceTypeName, SymbolSourceType} from "@/enums/symbol-source-type";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

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
    showSymbolForm: boolean;
    symbolLoaded: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class AssetsBlock extends React.Component<{}> {
    state: AssetsBlockState;
    getAssetsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

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
            showSymbolForm: true,
            symbolLoaded: false
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
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
            columnHelper.accessor((row) => row.security_name, {
                id: "security_name",
                cell: (item) => item.getValue(),
                header: () => <span>Security Name </span>,
            }),
            columnHelper.accessor((row) => ({
                count: row.linked_symbol_count === 0 ? null : row.linked_symbol_count,
            }), {
                id: "linked_symbol_count",
                cell: (item) => item.getValue().count,
                header: () => <span>S </span>,
            }),
            columnHelper.accessor((row) => row.source_name, {
                id: "source_name",
                cell: (item) => item.getValue(),
                header: () => <span>Source </span>,
            }),
            columnHelper.accessor((row) => row.symbol_suffix, {
                id: "symbol_suffix",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Symbol Suffix </span>,
            }),
            columnHelper.accessor((row) => row.reason_for_entry, {
                id: "reason_for_entry",
                cell: (item) => item.getValue(),
                header: () => <span>Reason for Entry</span>,
            }),
            columnHelper.accessor((row) => row.dsin, {
                id: "dsin",
                cell: (item) => item.getValue(),
                header: () => <span>DSIN</span>,
            }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector </span>,
            }),
            columnHelper.accessor((row) => row.asset_status, {
                id: "asset_status",
                cell: (item) => item.getValue(),
                header: () => <span>Asset Status </span>,
            }),
            columnHelper.accessor((row) => ({
                comment_status: row.reason_change_status || row.reason_delete_status,
                comment: row.reason_change || row.reason_delete,
                status: row.status
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
                        {item.getValue().comment_status ?
                            <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon
                                className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.company_profile_status, {
                id: "company_profile_status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Asset Profile Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'symbol', placeholder: 'Symbol'},
            {key: 'security_name', placeholder: 'Security Name'},
            {key: 'cusip', placeholder: 'CUSIP'},
            // {key: 'reason_for_entry', placeholder: 'Reason for Entry'},
            {key: 'dsin', placeholder: 'DSIN'},
            {key: 'market_sector', placeholder: 'Market Sector'},
            {key: 'asset_status', placeholder: 'Asset Status'},
            {key: 'status', placeholder: 'Status'},
            {key: 'company_profile_status', placeholder: 'Asset Profile Status'},
        ]
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
                let data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];
                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.reason_change_status = !!s.reason_change
                    s.reason_delete_status = !!s.reason_delete
                    s.source_name = getSymbolSourceTypeName(s.source as SymbolSourceType)

                    if (s.company_profile && s.company_profile?.status) {
                        s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                    }
                    s.company_profile_status = s.company_profile?.status ? s.company_profile.status : '-';
                    s.isAdmin = true;
                })

                this.setState({data: data});
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
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
    }

    openModal = (mode: string, data?: IAdminAsset) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode),
            symbolLoaded: true})
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
            return 'Do you want to delete this symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Symbol`;
        }
    }

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
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

    onLoading = () => {
        this.setState({symbolLoaded: false});
    }

    downloadSymbolsCSV = () => {
        if (this.tableRef.current) {
            adminService.downloadSymbols(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('symbols', res);
            })
        }
    }

    downloadSymbolsXLSX = () => {
        if (this.tableRef.current) {
            adminService.downloadSymbols(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('symbols', res);
            })
        }
    }

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Symbols</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadSymbolsCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadSymbolsXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                            <button className="border-btn ripple modal-link"
                                    disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Symbol
                            </button>
                        </div>

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
                                               ref={this.tableRef}
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
                       className={this.state.formAction !== 'delete' ? `big_modal` : ``}
                       onClose={() => this.cancelForm()}
                       title={this.modalTitle(this.state.formAction)}
                >
                    {(this.state.formAction === 'view' && !this.state.symbolLoaded) && (
                        <div className="modal__navigate">
                            <div className="modal__navigate__title">Asset Profile:</div>

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
                                onLoading={this.onLoading}
                                isAdmin={true}/>
                </Modal>

                <Modal isOpen={this.state.isOpenCompanyModal}
                       className={'big_modal'}
                       onClose={() => this.cancelCompanyForm()}
                       title={this.modalCompanyTitle(this.state.formCompanyAction)}
                >


                    <div className="modal__navigate">
                        <button className={'border-btn ripple'}
                                onClick={() => this.setState({isOpenModal: true, isOpenCompanyModal: false, symbolLoaded: true})}>
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
