import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import {ISymbol} from "@/interfaces/i-symbol";
import Modal from "@/components/modal";
import SymbolForm from "@/components/symbol-form";
import symbolService from "@/services/symbol/symbol-service";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import Link from "next/link";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import CompanyProfile from "@/components/company-profile-form";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import AssetImage from "@/components/asset-image";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import UserPermissionService from "@/services/user/user-permission-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import downloadFile from "@/services/download-file/download-file";
import {
    faComment,
    faFileExport,
    faFilter,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";


interface SubSymbolBlockState extends IState, IModalState {
    isOpenCompanyModal: boolean;
    formCompanyData: ICompanyProfile | null;
    formCompanyAction: string;
    isLoading: boolean;
    formAction: string;
    symbol: ISymbol | null;
    modalTitle: string;
    errors: string[];
    companyProfileAccess: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    };
    data: ISymbol[];
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface SubSymbolBlockProps extends ICallback {
    isDashboard: boolean;
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    },
    symbol: string;
}

let isDashboard = false;
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

class SubSymbolBlock extends React.Component<SubSymbolBlockProps, SubSymbolBlockState> {

    state: SubSymbolBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval: NodeJS.Timer | number | undefined;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: SubSymbolBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        const companyProfileAccess = UserPermissionService.getAccessRulesByComponent(
            'CompanyProfileBlock',
            this.context.userProfile.access
        );

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            modalTitle: '',
            errors: [],
            symbol: null,
            isOpenCompanyModal: false,
            formCompanyData: null,
            formCompanyAction: 'add',
            companyProfileAccess: companyProfileAccess,
            data: [],
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        isDashboard = this.props?.isDashboard ?? true;


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
                    <>
                        <div onClick={() => {
                            this.navigate(item.getValue().symbol)
                        }}
                             className={`table-image cursor-pointer link`}
                        >
                            <div className="table-image-container">
                                <AssetImage alt=''
                                            src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                            width={28} height={28}/>
                            </div>
                            {item.getValue().symbol}
                        </div>
                    </>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.cusip, {
                id: "cusip",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>CUSIP</span>,
            }),
            columnHelper.accessor((row) => row.symbol_suffix, {
                id: "symbol_suffix",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Symbol Suffix </span>,
            }),
            columnHelper.accessor((row) => row.primary_ats, {
                id: "primary_ats",
                cell: (item) => item.getValue(),
                header: () => <span>Primary ATS </span>,
            }),
            columnHelper.accessor((row) => row.dsin, {
                id: "dsin",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>DSIN</span>,
            }),
            columnHelper.accessor((row) => row.transfer_agent, {
                id: "transfer_agent",
                cell: (item) => item.getValue(),
                header: () => <span>Transfer Agent </span>,
            }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector </span>,
            }),
            columnHelper.accessor((row) => row.digital_asset_category, {
                id: "digital_asset_category",
                cell: (item) => item.getValue(),
                header: () => <span>Digital Asset Category </span>,
            }),

        ];

        tableFilters = [
            {key: 'symbol', placeholder: 'Symbol'},
            {key: 'cusip', placeholder: 'CUSIP'},
            {key: 'dsin', placeholder: 'DSIN'},
            {key: 'primary_ats', placeholder: 'ATS'},
            {key: 'market_sector', placeholder: 'Market Sector'},
            {key: 'digital_asset_category', placeholder: 'Digital Asset Category'},
        ]
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols();
        // this.startAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.removeEventListener('click', this.handleClickOutside);
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    navigate = (symbol: string) => {
        this.props.onCallback(symbol, 'view');
    }

    startAutoUpdate = () => {
        this.getSymbolsInterval = setInterval(this.getSymbols, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getSymbolsInterval) clearInterval(this.getSymbolsInterval as number);
    }

    getSymbols = () => {
        symbolService.getSymbols(this.props.symbol, true)
            .then((res: Array<ISymbol>) => {
                let data = res || [];
                data = data.filter(s => s.symbol_id)

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.reason_change_status = !!s.reason_change
                    s.reason_delete_status = !!s.reason_delete
                    if (s.company_profile && s.company_profile?.status) {
                        s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                    }

                    s.company_profile_status = s.company_profile?.status ? s.company_profile.status : '-'
                });

                this.setState({data: data});
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: ISymbol) => {
        if (mode === 'delete') {
            this.setState({
                isOpenModal: true,
                symbol: data || null,
                formAction: mode,
                modalTitle: this.modalTitle(mode)
            })
            this.cancelCompanyForm();
        } else if (mode === 'add') {
            this.props.onCallback(mode)
        } else {
            this.props.onCallback(data?.symbol, mode)
        }

    }

    openCompanyModal = (mode: string, data?: ICompanyProfile | null) => {
        this.setState({
            isOpenCompanyModal: true,
            formCompanyData: data || null,
            formCompanyAction: mode,
            modalTitle: this.modalTitle(mode)
        })
        this.closeModal();
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }

    cancelCompanyForm(): void {
        this.setState({isOpenCompanyModal: false});
    }

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
        }
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

    onCallback = async (values: any, step: boolean) => {
        this.getSymbols();
        this.closeModal();
        this.cancelCompanyForm()
    };

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    render() {
        return (

            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        {this.state.data.length ? (
                            <Table columns={columns}
                                   data={this.state.data}
                                   searchPanel={true}
                                   block={this}
                                   editBtn={true}
                                   viewBtn={true}
                                   deleteBtn={false}
                                   filters={tableFilters}
                                   filtersClassName={this.state.filtersClassName}
                                   access={this.props.access}
                                   ref={this.tableRef}
                            />
                        ) : (
                            <NoDataBlock/>
                        )}


                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={this.state.modalTitle}
                        >
                            {(this.state.formAction === 'edit' || this.state.formAction === 'view') && (
                                <div className="modal__navigate">
                                    {(this.state.companyProfileAccess.create ||
                                        this.state.companyProfileAccess.edit ||
                                        this.state.companyProfileAccess.view) && (
                                        <div className="modal__navigate__title">Asset Profile:</div>
                                    )}

                                    {(this.state.companyProfileAccess.create ||
                                        this.state.companyProfileAccess.edit ||
                                        this.state.companyProfileAccess.view) && (
                                        <>
                                            {this.state.symbol?.company_profile ? (
                                                <>
                                                    <div
                                                        className={`table__status table__status-${this.state.symbol?.company_profile?.status.toLowerCase()}`}>{this.state.symbol?.company_profile?.status}</div>
                                                    {this.state.companyProfileAccess.view && (
                                                        <button className={'border-btn ripple'}
                                                                onClick={() => this.openCompanyModal('view', this.state.symbol?.company_profile)}>
                                                            View
                                                        </button>
                                                    )}
                                                    {this.state.companyProfileAccess.edit && (
                                                        <button className={'border-btn ripple'}
                                                                onClick={() => this.openCompanyModal('edit', this.state.symbol?.company_profile)}>
                                                            Edit
                                                        </button>
                                                    )}

                                                </>
                                            ) : (
                                                <>
                                                    {this.state.companyProfileAccess.create && (
                                                        <button className={'border-btn ripple'}
                                                                onClick={() => this.openCompanyModal('add')}>
                                                            Add
                                                        </button>
                                                    )}

                                                </>
                                            )}
                                        </>
                                    )}

                                </div>
                            )}

                            <SymbolForm
                                isAdmin={false}
                                action={this.state.formAction}
                                data={this.state.symbol}
                                onCallback={this.onCallback}
                            />
                        </Modal>


                        <Modal isOpen={this.state.isOpenCompanyModal}
                               className={this.state.formCompanyAction === 'view' ? 'big_modal' : ''}
                               onClose={() => this.cancelCompanyForm()}
                               title={this.modalCompanyTitle(this.state.formCompanyAction)}
                        >
                            <div className="modal__navigate">
                                <button className={'border-btn ripple'} onClick={() => this.setState({
                                    isOpenModal: true,
                                    isOpenCompanyModal: false
                                })}>
                                    Back to Symbol
                                </button>
                            </div>

                            <CompanyProfile action={this.state.formCompanyAction}
                                            data={this.state.formCompanyData}
                                            symbolData={this.state.symbol}
                                            onCallback={this.onCallback}
                                            isAdmin={false}/>

                        </Modal>
                    </>
                )}
            </>

        )
    }
}

export default portalAccessWrapper(SubSymbolBlock, 'SymbolBlock');
