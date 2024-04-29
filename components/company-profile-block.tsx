import React from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import CompanyProfile from "@/components/company-profile-form";
import Modal from "@/components/modal";
import NoDataBlock from "@/components/no-data-block";
import {UsaStates} from "usa-states";
import formatterService from "@/services/formatter/formatter-service";
import {FormFieldOptionType, FormFieldOptionType2} from "@/enums/form-field-option-type";
import fileService from "@/services/file/file-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import formService from "@/services/form/form-service";
import {getYesNoTypeName, YesNoType} from "@/enums/yes-no-type";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import FINRACatRegAForm from "@/components/finra-cat-reg-a-form";
import SECIssuerForm from "@/components/sec-issuer-form";


interface CompanyProfileProps extends ICallback {
    symbol: string;
}

interface CompanyProfileState extends IState, IModalState {
    isLoading: boolean;
    isOpenCompanyModal: boolean;
    formCompanyAction: string;
    formAction: string;
    formType: string;
    errors: string[];
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    finraCatRegAData: IFINRACatRegA[],
    secIssuerData: ISECIssuer[],
    formData: IFINRACatRegA | ISECIssuer | null,
    filtersClassName: 'd-none d-md-flex'
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

const columnFINRARegAHelper = createColumnHelper<any>();
let finraRegAColumns: any[] = [];
let tableFINRARegAFilters: Array<ITableFilter> = []

const columnSECIssuerHelper = createColumnHelper<any>();
let secIssuerColumns: any[] = [];
let tableSECIssuerFilters: Array<ITableFilter> = []

class CompanyProfileBlock extends React.Component<CompanyProfileProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: CompanyProfileState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;
    host = `${window.location.protocol}//${window.location.host}`;

    tableFinraRegARef: React.RefObject<any> = React.createRef();
    tableSECIssuerRef: React.RefObject<any> = React.createRef();

    constructor(props: CompanyProfileProps) {
        super(props);

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.companyProfile = null;

        this.symbol = null;
        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            errors: [],
            isOpenCompanyModal: false,
            formCompanyAction: 'add',
            formType: '',
            formAction: 'add',
            usaStates: usaStatesList,
            finraCatRegAData: [],
            secIssuerData: [],
            formData: null,
            filtersClassName: 'd-none d-md-flex'
        }

        finraRegAColumns = [
            columnFINRARegAHelper.accessor((row) => row.issuer_name, {
                id: "issuer_name",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>Issuer Name</span>,
            }),
            columnFINRARegAHelper.accessor((row) => row.listing, {
                id: "listing",
                cell: (item) => item.getValue(),
                header: () => <span>Listing </span>,
            }),
            columnFINRARegAHelper.accessor((row) => row.ats_and_exchange, {
                id: "ats_and_exchange",
                cell: (item) => item.getValue(),
                header: () => <span>ATS & Exchange </span>,
            }),
            columnFINRARegAHelper.accessor((row) => row.cik, {
                id: "cik",
                cell: (item) => item.getValue(),
                header: () => <span>CIK</span>,
            }),
        ];

        secIssuerColumns = [
            columnSECIssuerHelper.accessor((row) => row.accession_number, {
                id: "accession_number",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>Accession Number</span>,
            }),
            columnSECIssuerHelper.accessor((row) => row.is_primary_issuer, {
                id: "is_primary_issuer",
                cell: (item) => item.getValue(),
                header: () => <span>Primary Issuer </span>,
            }),
            columnSECIssuerHelper.accessor((row) => row.cik, {
                id: "cik",
                cell: (item) => item.getValue(),
                header: () => <span>CIK</span>,
            }),
            columnSECIssuerHelper.accessor((row) => row.entity_name, {
                id: "entity_name",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Entity Name</span>,
            }),
        ];

        tableFINRARegAFilters = []
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
            .then(() => this.getFINRARegA())
            .then(() => this.getSECIssuer())
            .finally(() => this.setState({isLoading: false}))
    }

    getSymbols = () => {
        return new Promise(resolve => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const data = res || [];

                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;

                        if (s.company_profile && s.company_profile?.status) {
                            s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                        }

                        if (typeof s.company_profile?.company_officers_and_contacts === 'string') {
                            try {
                                s.company_profile.company_officers_and_contacts = JSON.parse(s.company_profile.company_officers_and_contacts);
                            } catch (error) {
                                s.company_profile.company_officers_and_contacts = [""];
                            }
                        }

                        if (typeof s.company_profile?.board_of_directors === 'string') {
                            try {
                                s.company_profile.board_of_directors = JSON.parse(s.company_profile.board_of_directors);
                            } catch (error) {
                                s.company_profile.board_of_directors = [""];
                            }
                        }
                    });

                    this.symbols = data;
                    const symbol = this.symbols.find((s: ISymbol) => s.symbol === this.props.symbol);
                    this.symbol = symbol || null;
                    this.companyProfile = symbol?.company_profile || null;
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                    this.props.onCallback(this.companyProfile?.logo);
                });
        })

    }

    getFINRARegA() {
        return new Promise(resolve => {
            formService.getFINRARegA(this.props.symbol)
                .then((res: Array<IFINRACatRegA>) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    });
                    this.setState({finraCatRegAData: data});
                })
                .finally(() => resolve(true))
        })
    }

    getSECIssuer() {
        return new Promise(resolve => {
            formService.getSECIssuer(this.props.symbol)
                .then((res: Array<ISECIssuer>) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                        s.is_primary_issuer = getYesNoTypeName(s.is_primary_issuer as YesNoType)
                    });
                    this.setState({secIssuerData: data});
                })
                .finally(() => resolve(true))
        })
    }

    handleBack = () => {
        const router = useRouter();
        router.push('/asset-profiles');
    }


    openCompanyModal = (mode: string) => {
        this.setState({
            isOpenCompanyModal: true,
            formCompanyAction: mode,
        })
    }

    cancelCompanyForm(): void {
        this.setState({isOpenCompanyModal: false});
    }

    cancelForm(): void {
        this.setState({isOpenModal: false, formData: null});
    }

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        if (typeof values === 'string') {
            if (values === 'finraRegA') {
                await this.getFINRARegA();
            } else if (values === 'secIssuer') {
                await this.getSECIssuer();
            }
        }

        this.cancelCompanyForm()
        this.cancelForm()

        await this.getSymbols();
    };

    openModal = (mode: string, data: IFINRACatRegA | ISECIssuer | null, formType: string) => {
        this.setState({isOpenModal: true, formAction: mode, formType: formType, formData: data})
    }

    getFormName() {
        switch (this.state.formType) {
            case 'finraRegA':
                return 'FINRA CAT Form - REG A';
            case 'secIssuer':
                return 'SEC Issuer';
        }
    }

    modalTitle = (mode: string) => {
        if (mode === 'add') {
            return `Add ${this.getFormName()}`
        } else if (mode === 'edit') {
            return `Edit ${this.getFormName()}`
        } else if (mode === 'delete') {
            return `Do you want to delete this ${this.getFormName()}?`;
        }
        if (mode === 'view') {
            return `View ${this.getFormName()}`
        } else {
            return '';
        }
    }

    getRenderedForm() {
        switch (this.state.formType) {
            case 'finraRegA':
                return (
                    <FINRACatRegAForm action={this.state.formAction}
                                      data={this.state.formData as IFINRACatRegA}
                                      symbolData={this.symbol}
                                      onCallback={this.onCallback}
                                      isAdmin={false}/>
                )
            case 'secIssuer':
                return (
                    <SECIssuerForm action={this.state.formAction}
                                   data={this.state.formData as ISECIssuer}
                                   symbolData={this.symbol}
                                   onCallback={this.onCallback}
                                   isAdmin={false}/>
                )
            default:
                return (<></>)
        }
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {this.symbol ? (
                            <>
                                <div className="flex-panel-box">
                                    {this.companyProfile ? (
                                        <>
                                            <div className="panel">
                                                <div className="content__bottom d-flex justify-content-between">
                                                    <h2 className="view_block_main_title">
                                                        {this.companyProfile.company_name} ({this.symbol.symbol})
                                                    </h2>
                                                    {!this.companyProfile.is_approved && (
                                                        <div
                                                            className="content__title_btns content__filter download-buttons justify-content-end">

                                                            <button
                                                                className={`b-btn ripple`}
                                                                onClick={() => this.openCompanyModal('edit')}
                                                            >Edit
                                                            </button>

                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div id={'asset_type'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Asset Type</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile.asset_type || 'not filled'}</div>
                                                </div>
                                            </div>

                                            {this.companyProfile?.asset_type && this.companyProfile?.asset_type !== '' && (
                                                <div id={'asset_type_additional'} className={'panel'}>
                                                    <div className={'content__top'}>
                                                        <div
                                                            className={'content__title'}>{this.companyProfile?.asset_type} Additional
                                                            Info
                                                        </div>
                                                    </div>
                                                    <div className={'content__bottom'}>
                                                        {this.companyProfile.asset_type_option === FormFieldOptionType.TEXT && (
                                                            <div>{this.companyProfile?.asset_type_description || 'not filled'}</div>
                                                        )}

                                                        {this.companyProfile.asset_type_option === FormFieldOptionType.IMAGE && (
                                                            <img
                                                                src={`${this.host}${this.companyProfile.asset_type_image}`}/>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div id={'total_shares_outstanding'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Total Shares Outstanding</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile?.total_shares_outstanding ? formatterService.numberFormat(Number(this.companyProfile.total_shares_outstanding)) : 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'initial_offering_date'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Initial Offering Date</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile?.initial_offering_date ? formatterService.dateTimeFormat(this.companyProfile?.initial_offering_date, 'dd/MM/yyyy') : 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'price_per_share'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Price Per Share</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile?.price_per_share ? formatterService.numberFormat(Number(this.companyProfile?.price_per_share), decimalPlaces) : 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'asset_type_additional'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div
                                                        className={'content__title'}>Issuer
                                                        Profile
                                                    </div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <>
                                                        {((this.companyProfile.issuer_profile_description || this.companyProfile.issuer_profile_image || this.companyProfile?.issuer_profile_file) && this.companyProfile.issuer_profile_option !== '') ? (
                                                            <>
                                                                {this.companyProfile.issuer_profile_option === FormFieldOptionType2.TEXT && (
                                                                    <div>{this.companyProfile?.issuer_profile_description || 'not filled'}</div>
                                                                )}

                                                                {this.companyProfile.issuer_profile_option === FormFieldOptionType2.IMAGE && (
                                                                    <>
                                                                        {this.companyProfile.issuer_profile_image ? (
                                                                            <img
                                                                                src={`${this.host}${this.companyProfile.issuer_profile_image}`}/>
                                                                        ) : (
                                                                            <div>{'not filled'}</div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {this.companyProfile.issuer_profile_option === FormFieldOptionType2.FILE && (
                                                                    <>
                                                                        {this.companyProfile.issuer_profile_file ? (
                                                                            <Link
                                                                                className={'link info-panel-title-link'}
                                                                                href={`${this.host}${this.companyProfile.issuer_profile_file}`}
                                                                                target={'_blank'}>
                                                                                {fileService.getFileNameFromUrl(this.companyProfile.issuer_profile_file)} {' '}
                                                                                <FontAwesomeIcon className="nav-icon"
                                                                                                 icon={faArrowUpRightFromSquare}/>
                                                                            </Link>
                                                                        ) : (
                                                                            <div>{'not filled'}</div>
                                                                        )}

                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div>{'not filled'}</div>
                                                        )}
                                                    </>

                                                </div>
                                            </div>
                                            <div id={'company_address'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Company Address</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{[this.companyProfile.street_address_1, this.companyProfile.street_address_2, this.companyProfile.city, this.companyProfile.zip_code, this.companyProfile.country].filter(i => i !== '').join(', ') || 'not filled'}</div>
                                                    {this.companyProfile.phone && (
                                                        <div className="mt-2">{this.companyProfile.phone}</div>
                                                    )}
                                                    {this.companyProfile.web_address && (
                                                        <div className="mt-2">
                                                            <Link className={'link'}
                                                                  href={`http://${this.companyProfile.web_address}`}
                                                                  target={'_blank'}>
                                                                {this.companyProfile.web_address}
                                                            </Link>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                            <div id={'business_description'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Business Description</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile.business_description || 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'company_profile_data'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Asset Profile Data</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div className={'view_panel'}>
                                                        <div className="view_block">
                                                            <div className="view_block_body">
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title mt-0">SIC
                                                                        Industry
                                                                        Classification
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.sic_industry_classification || 'not filled'}</div>
                                                                </div>
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Incorporation
                                                                        Information
                                                                    </div>
                                                                    <div
                                                                        className="">
                                                                        {this.companyProfile?.incorporation_information ? (

                                                                            this.state.usaStates.filter(currency => currency.abbreviation === this.companyProfile?.incorporation_information).map(filteredState => (
                                                                                <React.Fragment
                                                                                    key={filteredState.abbreviation}>
                                                                                    {filteredState.name} ({filteredState.abbreviation})
                                                                                </React.Fragment>
                                                                            ))
                                                                        ) : (
                                                                            <>not filled</>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Number of
                                                                        Employees
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.number_of_employees || 'not filled'}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div id={'company_officers_and_contacts'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Company Officers & Contacts</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    {this.companyProfile.company_officers_and_contacts.length > 0 && this.companyProfile.company_officers_and_contacts.every((value) => value !== "") ? (

                                                        this.companyProfile.company_officers_and_contacts.map((officer, index) => (
                                                            <>
                                                                <div>{officer}</div>
                                                            </>
                                                        ))

                                                    ) : (
                                                        <>not filled</>
                                                    )}
                                                </div>
                                            </div>
                                            <div id={'board_of_directors'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Board of Directors</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile.product_and_services || 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'product_and_services'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Product & Services</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile.product_and_services || 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'company_facilities'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Company Facilities</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div>{this.companyProfile.company_facilities || 'not filled'}</div>
                                                </div>
                                            </div>
                                            <div id={'service_providers'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Service Providers</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div className={'view_panel'}>
                                                        <div className="view_block">
                                                            <div className="view_block_body">
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title mt-0">Transfer
                                                                        Agent
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.transfer_agent || 'not filled'}</div>
                                                                </div>
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Accounting /
                                                                        Auditing
                                                                        Firm
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.accounting_auditing_firm || 'not filled'}</div>
                                                                </div>
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Investor
                                                                        Relations
                                                                        /
                                                                        Marketing
                                                                        / Communications
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.investor_relations_marketing_communications || 'not filled'}</div>
                                                                </div>
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Securities
                                                                        Counsel
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.securities_counsel || 'not filled'}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id={'financial_reporting'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>Financial Reporting</div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    <div className={'view_panel'}>
                                                        <div className="view_block">
                                                            <div className="view_block_body">
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title mt-0">US
                                                                        Reporting
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.us_reporting || 'not filled'}</div>
                                                                </div>
                                                                <div className="ver">
                                                                    <div className="view_block_sub_title">Edgar CIK
                                                                    </div>
                                                                    <div
                                                                        className="">{this.companyProfile.edgar_cik || 'not filled'}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id={'sec_issuer'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>SEC Issuer</div>
                                                    <div
                                                        className="content__title_btns content__filter download-buttons justify-content-end">

                                                        <>
                                                            <button className="d-none d-md-block b-btn ripple"
                                                                    disabled={this.state.isLoading}
                                                                    onClick={() => this.openModal('add', null, 'secIssuer')}>
                                                                <div>Add</div>
                                                            </button>
                                                            <Button
                                                                variant="link"
                                                                className="d-md-none admin-table-btn ripple"
                                                                type="button"
                                                                onClick={() => this.openModal('add', null, 'secIssuer')}>
                                                                <FontAwesomeIcon icon={faPlus}/>
                                                            </Button>
                                                        </>
                                                    </div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    {this.state.secIssuerData.length ? (
                                                        <Table columns={secIssuerColumns}
                                                               data={this.state.secIssuerData}
                                                               searchPanel={true}
                                                               block={this}
                                                               editBtn={true}
                                                               viewBtn={true}
                                                               deleteBtn={true}
                                                               filters={tableSECIssuerFilters}
                                                               filtersClassName={this.state.filtersClassName}
                                                               ref={this.tableSECIssuerRef}
                                                               options={{type: 'secIssuer'}}
                                                        />
                                                    ) : (
                                                        <NoDataBlock/>
                                                    )}
                                                </div>
                                            </div>
                                            <div id={'finra_cat'} className={'panel'}>
                                                <div className={'content__top'}>
                                                    <div className={'content__title'}>FINRA CAT
                                                    </div>
                                                    <div
                                                        className="content__title_btns content__filter download-buttons justify-content-end">

                                                        <>
                                                            <button className="d-none d-md-block b-btn ripple"
                                                                    disabled={this.state.isLoading}
                                                                    onClick={() => this.openModal('add', null, 'finraRegA')}>
                                                                <div>Add</div>
                                                            </button>
                                                            <Button
                                                                variant="link"
                                                                className="d-md-none admin-table-btn ripple"
                                                                type="button"
                                                                onClick={() => this.openModal('add', null, 'finraRegA')}>
                                                                <FontAwesomeIcon icon={faPlus}/>
                                                            </Button>
                                                        </>
                                                    </div>
                                                </div>
                                                <div className={'content__bottom'}>
                                                    {this.state.finraCatRegAData.length ? (
                                                        <Table columns={finraRegAColumns}
                                                               data={this.state.finraCatRegAData}
                                                               searchPanel={true}
                                                               block={this}
                                                               editBtn={true}
                                                               viewBtn={true}
                                                               deleteBtn={true}
                                                               filters={tableFINRARegAFilters}
                                                               filtersClassName={this.state.filtersClassName}
                                                               ref={this.tableFinraRegARef}
                                                               options={{type: 'finraRegA'}}
                                                        />
                                                    ) : (
                                                        <NoDataBlock/>
                                                    )}
                                                </div>
                                            </div>
                                        </>

                                    ) : (
                                        <div className={'panel'}>
                                            <div
                                                className={'content__bottom flex flex-1 justify-content-center text-center'}>
                                                <div className="mb-24 w-100">This is Asset Profile
                                                    for {this.symbol?.symbol}</div>
                                                <button
                                                    className={`b-btn ripple`}
                                                    onClick={() => this.openCompanyModal('add')}
                                                >Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={'flex-panel-box'}>
                                <div className={'panel'}>
                                    <div className={'content__bottom'}>
                                        <NoDataBlock/>
                                    </div>
                                </div>
                            </div>

                        )}


                        <Modal isOpen={this.state.isOpenCompanyModal}
                               className={this.state.formCompanyAction === 'view' ? 'big_modal' : ''}
                               onClose={() => this.cancelCompanyForm()}
                               title={this.modalCompanyTitle(this.state.formCompanyAction)}
                        >
                            <CompanyProfile action={this.state.formCompanyAction}
                                            data={this.companyProfile}
                                            symbolData={this.symbol}
                                            onCallback={this.onCallback}
                                            isAdmin={false}/>

                        </Modal>

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.cancelForm()}
                               title={this.modalTitle(this.state.formAction)}
                        >
                            {this.getRenderedForm()}

                        </Modal>

                    </>
                )}
            </>
        );
    }

}

export default CompanyProfileBlock;
