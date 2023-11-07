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
import formatterService from "@/services/formatter/formatter-service";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import CompanyProfile from "@/components/company-profile-form";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import AssetImage from "@/components/asset-image";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import UserPermissionService from "@/services/user/user-permission-service";
import Select from "react-select";
import filterService from "@/services/filter/filter";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import downloadFile from "@/services/download-file/download-file";


interface SymbolBlockState extends IState, IModalState {
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
    dataFull: ISymbol[];
    filterData: any;
}

interface SymbolBlockProps extends ICallback {
    isDashboard: boolean;
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

let isDashboard = false;
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class SymbolBlock extends React.Component<SymbolBlockProps, SymbolBlockState> {

    state: SymbolBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: SymbolBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        const companyProfileAccess = UserPermissionService.getAccessRulesByComponent(
            'CompanyProfile',
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
            dataFull: [],
            filterData: [],
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        isDashboard = this.props?.isDashboard ?? true;


        columns = [
            columnHelper.accessor((row) => row.cusip, {
                id: "cusip",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
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
                    <>
                        {companyProfileAccess.view && (
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
                        )}
                        {!companyProfileAccess.view && (
                            <div className={`table-image`}
                            >
                                <div className="table-image-container">
                                    <AssetImage alt=''
                                                src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                                width={28} height={28}/>
                                </div>
                                {item.getValue().symbol}
                            </div>
                        )}
                    </>


                ,
                header: () => <span>Symbol</span>,
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
            columnHelper.accessor((row) => row.mvp, {
                id: "mvp",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>MPV </span>,
            }),
            columnHelper.accessor((row) => row.security_type, {
                id: "security_type",
                cell: (item) => item.getValue(),
                header: () => <span>Security Type </span>,
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
        this.setState({isLoading: true});
        this.getSymbols();
        // this.startAutoUpdate();
    }

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getSymbolsInterval = setInterval(this.getSymbols, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getSymbolsInterval) clearInterval(this.getSymbolsInterval);
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;

                    if (s.company_profile && s.company_profile?.status) {
                        s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                    }

                    s.company_profile_status = s.company_profile?.status ? s.company_profile.status : '-'
                });

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: ISymbol) => {
        this.setState({isOpenModal: true, symbol: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
        this.cancelCompanyForm();
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
            return 'View Company Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Company Profile`;
        }
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

    onCallback = async (values: any, step: boolean) => {
        this.getSymbols();
        this.closeModal();
        this.cancelCompanyForm()
    };

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

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }

    downloadSymbolsCSV = () => {
        symbolService.downloadSymbols(this.state.filterData).then((res) => {
            downloadFile.CSV('symbols', res);
        })
    }

    downloadSymbolsXLSX = () => {
        symbolService.downloadSymbols(this.state.filterData).then((res) => {
            downloadFile.XLSX('symbols', res);
        })
    }

    render() {
        return (

            <>
                <div className="panel">
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

                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('add')}>Add Symbol
                                </button>
                            )}

                            {isDashboard && (
                                <Link href="/symbols" className="b-link">View all</Link>
                            )}
                        </div>

                    </div>


                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__bottom">
                                <div className="content__filter mb-3">
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
                                           editBtn={true}
                                           viewBtn={true}
                                           access={this.props.access}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>

                            <Modal isOpen={this.state.isOpenModal}
                                   onClose={() => this.closeModal()}
                                   title={this.state.modalTitle}
                            >
                                {(this.state.formAction === 'edit' || this.state.formAction === 'view') && (
                                    <div className="modal__navigate">
                                        {(this.state.companyProfileAccess.create ||
                                            this.state.companyProfileAccess.edit ||
                                            this.state.companyProfileAccess.view) && (
                                            <div className="modal__navigate__title">Company Profile:</div>
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
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(SymbolBlock, 'SymbolBlock');
