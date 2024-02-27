import React from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import {UsaStates} from "usa-states";
import {createColumnHelper} from "@tanstack/react-table";
import AssetImage from "@/components/asset-image";
import Select from "react-select";
import filterService from "@/services/filter/filter";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import UserPermissionService from "@/services/user/user-permission-service";
import {countries} from "countries-list";
import formatterService from "@/services/formatter/formatter-service";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {IFees} from "@/interfaces/i-fees";
import adminService from "@/services/admin/admin-service";
import feesService from "@/services/fee/reports-service";
import CompanyProfile from "@/components/company-profile-form";
import Modal from "@/components/modal";
import {ISymbol} from "@/interfaces/i-symbol";
import {FormStatus, getApprovedFormStatus} from "@/enums/form-status";

interface CompanyProfilesBlockState extends IState {
    isLoading: boolean;
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    data: ICompanyProfile[];
    dataFull: ICompanyProfile[];
    filterData: any;
    isAdmin: boolean,
    isOpenCompanyModal: boolean;
    formCompanyData: ICompanyProfile | null;
    formCompanyAction: string;
}

interface CompanyProfilesBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    },
    isAdmin?: boolean;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class CompanyProfilesBlock extends React.Component<CompanyProfilesBlockProps, CompanyProfilesBlockState> {

    state: CompanyProfilesBlockState;

    constructor(props: CompanyProfilesBlockProps) {
        super(props);

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            isLoading: true,
            usaStates: usaStatesList,
            data: [],
            dataFull: [],
            filterData: [],
            isAdmin: props.isAdmin ?? false,
            isOpenCompanyModal: false,
            formCompanyData: null,
            formCompanyAction: 'add',
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                company_name: row.company_name,
                symbol_name: row.symbol_name,
                image: row.logo
            }), {
                id: "company_name",
                cell: (item) =>
                    <div onClick={() => {
                        this.navigate(item.getValue().symbol_name)
                    }}
                         className={`table-image ${!this.state.isAdmin ? 'cursor-pointer link' : ''}`}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().company_name}
                    </div>
                ,
                header: () => <span>Company Name</span>,
            }),

            columnHelper.accessor((row) => row.business_description, {
                id: "business_description",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Business Description </span>,
            }),

            columnHelper.accessor((row) => row.sic_industry_classification, {
                id: "sic_industry_classification",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>SIC Industry Classification </span>,
            }),

            columnHelper.accessor((row) => row.incorporation_information, {
                id: "incorporation_information",
                cell: (item) => this.state.usaStates.filter(currency => currency.abbreviation === item.getValue()).map(filteredState => (
                    <React.Fragment key={filteredState.abbreviation}>
                        {filteredState.name} ({filteredState.abbreviation})
                    </React.Fragment>
                )),
                header: () => <span>Incorporation Information </span>,
            }),

            columnHelper.accessor((row) => row.number_of_employees, {
                id: "number_of_employees",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 0)}</span>,
                header: () => <span>Number of Employees </span>,
            }),

            columnHelper.accessor((row) => row.country, {
                id: "country",
                cell: (item) => countries[item.getValue() as keyof typeof countries]?.name,
                header: () => <span>Country </span>,
            }),
            columnHelper.accessor((row) => row.state, {
                id: "state",
                cell: (item) => this.state.usaStates.filter(currency => currency.abbreviation === item.getValue()).map(filteredState => (
                    <React.Fragment key={filteredState.abbreviation}>
                        {filteredState.name} ({filteredState.abbreviation})
                    </React.Fragment>
                )),
                header: () => <span>State </span>,
            }),
            columnHelper.accessor((row) => row.state, {
                id: "city",
                cell: (item) => item.getValue(),
                header: () => <span>City </span>,
            }),
        ];

        if (this.state.isAdmin) {
            columns.push(
                columnHelper.accessor((row) => row.company_profile_status, {
                    id: "company_profile_status",
                    cell: (item) =>
                        <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                            {item.getValue()}
                        </div>
                    ,
                    header: () => <span>Company Profile Status</span>,
                })
            )
        }
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getCompanyProfiles();
    }

    getCompanyProfiles = () => {
        const request: Promise<Array<ICompanyProfile>> = this.props.isAdmin ? adminService.getCompanyProfile() : symbolService.getCompanyProfile();

        request
            .then((res: Array<ICompanyProfile>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.company_profile_status = s.status ? s.status : '-'
                })

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

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    onCallback = async (values: any, step: boolean) => {
        this.getCompanyProfiles();
        this.cancelCompanyForm()
    };

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
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

    openModal = (mode: string, data?: ICompanyProfile) => {
        this.setState({isOpenCompanyModal: true, formCompanyData: data || null, formCompanyAction: mode})
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

    render() {
        return (
            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Company Profile</div>
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
                                            value={filterService.setValue('company_name', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('company_name', item)}
                                            options={filterService.buildOptions('company_name', this.state.dataFull)}
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('sic_industry_classification', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('sic_industry_classification', item)}
                                            options={filterService.buildOptions('sic_industry_classification', this.state.dataFull)}
                                            placeholder="SIC Industry Classification"
                                        />
                                    </div>
                                    {this.state.isAdmin && (
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
                                    )}
                                    <button
                                        className="content__filter-clear ripple"
                                        onClick={this.handleResetButtonClick}>
                                        <FontAwesomeIcon className="nav-icon"
                                                         icon={filterService.getFilterResetIcon()}/>
                                    </button>
                                </div>
                                {this.state.data.length ? (
                                    <Table columns={columns}
                                           pageLength={this.state.isAdmin ? pageLength : undefined}
                                           data={this.state.data}
                                           searchPanel={true}
                                           block={this}
                                           viewBtn={this.state.isAdmin}
                                           editBtn={this.state.isAdmin}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}

                                <Modal isOpen={this.state.isOpenCompanyModal}
                                       className={this.state.formCompanyAction === 'view' ? 'big_modal' : ''}
                                       onClose={() => this.cancelCompanyForm()}
                                       title={this.modalCompanyTitle(this.state.formCompanyAction)}
                                >
                                    {!this.state.isAdmin && (
                                        <div className="modal__navigate">
                                            <button className={'border-btn ripple'} onClick={() => this.setState({
                                                isOpenCompanyModal: true,
                                            })}>
                                                Back to Symbol
                                            </button>
                                        </div>
                                    )}


                                    <CompanyProfile action={this.state.formCompanyAction}
                                                    data={this.state.formCompanyData}
                                                    symbolData={this.state.formCompanyData?.symbol_data || null}
                                                    onCallback={this.onCallback}
                                                    isAdmin={this.state.isAdmin}/>

                                </Modal>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }

}

export default CompanyProfilesBlock;
