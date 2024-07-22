import React from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import {useRouter} from "next/router";
import CompanyProfile from "@/components/company-profile-form";
import Modal from "@/components/modal";
import NoDataBlock from "@/components/no-data-block";
import {UsaStates} from "usa-states";
import {UnderpinningAssetValue} from "@/enums/underpinning-asset-value";
import {RedeemabilityType} from "@/enums/redeemability-type";
import formatterService from "@/services/formatter/formatter-service";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faEdit, faEye} from "@fortawesome/free-solid-svg-icons";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import SymbolForm from "@/components/symbol-form";
import {DataContext} from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";
import {IDataContext} from "@/interfaces/i-data-context";
import AssetImage from "@/components/asset-image";
import Link from "next/link";
import SubSymbolBlock from "@/components/sub-symbol-block";


interface SymbolInfoProps extends ICallback {
    symbol: string;
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

interface SymbolInfoState extends IState, IModalState {
    isLoading: boolean;
    isOpenCompanyModal: boolean;
    formCompanyAction: string;
    errors: string[];
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    companyProfileAccess: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    };
    quoteBoardAccess: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    };
    algorandDataFeedAccess: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    };
    modalTitle: string;
    formAction: string;
    symbol: ISymbol | null;
    formCompanyData: ICompanyProfile | null;
}

class SymbolInfoBlock extends React.Component<SymbolInfoProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    masterSymbols: Array<ISymbol> = new Array<ISymbol>();
    state: SymbolInfoState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;
    host: string = '';

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: SymbolInfoProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        const companyProfileAccess = UserPermissionService.getAccessRulesByComponent(
            'CompanyProfileBlock',
            this.context.userProfile.access
        );

        const quoteBoardAccess = UserPermissionService.getAccessRulesByComponent(
            'QuoteBoardBlock',
            this.context.userProfile.access
        );

        const algorandDataFeedAccess = UserPermissionService.getAccessRulesByComponent(
            'AlgorandDataFeedBlock',
            this.context.userProfile.access
        );


        this.companyProfile = null;
        this.symbol = null;
        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            errors: [],
            isOpenCompanyModal: false,
            formCompanyAction: 'add',
            usaStates: usaStatesList,
            companyProfileAccess: companyProfileAccess,
            quoteBoardAccess: quoteBoardAccess,
            algorandDataFeedAccess: algorandDataFeedAccess,
            modalTitle: '',
            formAction: 'edit',
            symbol: null,
            formCompanyData: null,
        }
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
        this.setState({isLoading: true});
        this.getSymbols();
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];
                data = data.filter(s => !s.symbol_id)

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

                    if (typeof s.sec_description === 'string') {
                        try {
                            s.sec_description = JSON.parse(s.sec_description);
                        } catch (error) {
                            s.sec_description = [""];
                        }
                    }

                    if (typeof s.sec_images === 'string') {
                        try {
                            s.sec_images = JSON.parse((s.sec_images as string).replace(/'/g, '"'));
                        } catch (error) {
                            s.sec_images = [];
                        }
                    }

                    if (typeof s.sec_files === 'string') {
                        try {
                            s.sec_files = JSON.parse((s.sec_files as string).replace(/'/g, '"'));
                        } catch (error) {
                            s.sec_files = [];
                        }
                    }


                });

                this.symbols = data;
                let symbol = this.symbols.find((s: ISymbol) => s.symbol === this.props.symbol);
                const masterSymbol = this.symbols.find(s => s.id === symbol?.symbol_id!);

                if (symbol && masterSymbol) {
                    symbol.master_symbol_name = `${masterSymbol?.company_profile?.company_name || ''} ${masterSymbol?.symbol}` ?? null;
                }

                this.symbol = symbol || null;
                this.masterSymbols = this.symbols.filter(s => !s.symbol)
                this.companyProfile = symbol?.company_profile || null;

                this.setState({symbol: this.symbol})
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }
    handleBack = () => {
        const router = useRouter();
        router.push('/symbols');
    }


    openModal = (mode: string) => {
        if (mode === 'edit') {
            this.navigate('symbols', 'edit')
        } else {
            this.setState({isOpenModal: true, formAction: mode, modalTitle: this.modalTitle(mode)})
            this.cancelCompanyForm();
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
        this.closeModal();
        this.cancelCompanyForm()

        if (values?.symbol && values.symbol !== this.props.symbol) {
            this.props.onCallback(values.symbol);
        } else {
            this.getSymbols();
        }

    };

    navigate = (mode: string, option?: string) => {
        this.props.onCallback(this.props.symbol, mode, option);
    }

    onCallbackSubSymbol = (symbol: any, mode: string) => {
        this.props.onCallback(symbol, 'symbols', mode);
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        {this.symbol ? (
                            <div className="flex-panel-box">
                                <div className={'panel d-flex justify-content-between align-items-center'}>
                                    <div
                                        className={'content__bottom d-flex align-items-center justify-content-between w-100'}>
                                        <div className={'d-flex gap-10 '}>
                                            <div
                                                className={'cursor-pointer title d-flex align-items-center gap-10'}>
                                                <h2 className={'view_block_main_title mb-0'}>
                                                    <div className={"company-profile-logo"}>
                                                        <AssetImage alt=''
                                                                    src={this.companyProfile?.logo}
                                                                    width={60}
                                                                    height={60}/>
                                                    </div>
                                                    {this.symbol.security_name} ({this.symbol.symbol})
                                                </h2>


                                                {this.state.companyProfileAccess.view && this.state.companyProfileAccess.view && this.symbol?.company_profile && (
                                                    <span title={'Asset Profile'}
                                                          className={'indicator-item'}
                                                          onClick={() => this.navigate('asset-profiles', 'view')}>
                                                       P
                                                    </span>
                                                )}

                                                {this.state.quoteBoardAccess.view && this.state.quoteBoardAccess.view && (
                                                    <span title={'Quote Board Profile'}
                                                          className={'indicator-item'}
                                                          onClick={() => this.navigate('quote-board')}>
                                                       Q
                                                    </span>
                                                )}

                                                {this.state.algorandDataFeedAccess.view && this.state.algorandDataFeedAccess.view && this.symbol?.algorand_last_sale_application_id && (
                                                    <span title={'Algorand Data Feed - Last Sale Profile'}
                                                          className={'indicator-item'}
                                                          onClick={() => this.navigate('algorand-data-feed/last-sale')}>
                                                       ALG-LS
                                                    </span>
                                                )}


                                                {this.state.algorandDataFeedAccess.view && this.state.algorandDataFeedAccess.view && this.symbol?.algorand_best_bid_and_best_offer_application_id && (
                                                    <span title={'Algorand Data Feed - Best Bid And Best Offer Profile'}
                                                          className={'indicator-item'}
                                                          onClick={() => this.navigate('algorand-data-feed/best-bid-and-best-offer')}>
                                                       ALG-BBO
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={'justify-content-end d-flex align-items-center gap-10'}>
                                            {this.symbol?.company_profile && (
                                                <>
                                                    <div className="d-flex gap-10">
                                                        <div className={'d-flex bold'}>Asset Profile:</div>
                                                        <div
                                                            className={`font-weight-normal d-flex table__status table__status-${this.symbol?.company_profile?.status.toLowerCase()}`}>{this.symbol?.company_profile?.status}</div>
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                {this.props.access.edit && (
                                                    <>
                                                        <button className="d-none d-md-block b-btn ripple"
                                                                disabled={this.state.isLoading}
                                                                onClick={() => this.openModal('edit')}>Edit
                                                        </button>
                                                        <Button
                                                            variant="link"
                                                            className="d-md-none admin-table-btn ripple"
                                                            type="button"
                                                            onClick={() => this.openModal('edit')}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit}/>
                                                        </Button>
                                                    </>

                                                )}
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                <div className={'profile__right'}>
                                    <>
                                        <div className={'profile__right-wrap-full'}>
                                            <div className={'profile__panel'}>
                                                <div className={'profile__info__panel view__input__box'}>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Reason for Entry</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.reason_for_entry || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Underlying Symbol</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.master_symbol_name || 'not filled'}</div>
                                                    </div>


                                                    <div className={'input__box full'}>
                                                        <h4 className={''}>Details</h4>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>SPV Name</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.spv_name || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Fund Manager</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.fund_manager || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Investment Objective</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.investment_objective || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>SEC Filing</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.sec_filing || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box full'}>
                                                        <h4 className={''}>SEC Documents</h4>
                                                    </div>

                                                    <div className={'content__bottom'}>
                                                        {this.symbol?.sec_description ? (
                                                            <>
                                                                {this.symbol.sec_description.map((description, index) => (
                                                                    <>
                                                                        <div
                                                                            className={'d-flex gap-20 flex-wrap flex-md-nowrap'}
                                                                            key={index}>
                                                                            {this.symbol?.sec_images && this.symbol?.sec_images[index] && (
                                                                                <div
                                                                                    className={'profile__left bg-transparent flex-panel-box pt-0 content-box'}>
                                                                                    <div
                                                                                        className={'logo p-0 align-items-baseline '}>
                                                                                        <img
                                                                                            src={this.symbol?.sec_images[index]}/>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className={'d-flex mb-2 flex-column'}>
                                                                                <p className={'w-100 mb-1'}>{description}</p>
                                                                                {this.symbol?.sec_files && this.symbol?.sec_files[index] && (
                                                                                    <p className={'w-100 mb-1'}><Link
                                                                                        className={'link info-panel-title-link'}
                                                                                        href={`${this.host}${this.symbol?.sec_files[index]}`}
                                                                                        target={'_blank'}>
                                                                                        File {' '}
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faArrowUpRightFromSquare}/>
                                                                                    </Link></p>
                                                                                )}

                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <>not filled</>
                                                        )}
                                                    </div>
                                                    {/*------------------*/}
                                                    <div className={'input__box full'}>
                                                        <h4 className={''}>Symbol Information</h4>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Security Name</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.security_name || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Symbol</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.symbol || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Does it have cusip number?</div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.is_cusip ? 'Yes' : 'No' || 'not filled'}</div>
                                                    </div>
                                                    {this.symbol?.is_cusip && this.symbol.is_cusip && (
                                                        <div className={'input__box'}>
                                                            <div className={'input__title'}>CUSIP Number
                                                            </div>
                                                            <div
                                                                className={'input__wrap'}>{this.symbol.cusip || 'not filled'}</div>
                                                        </div>
                                                    )}
                                                    <div className={'input__box px-0 mx-0'}>
                                                        <div className={'input__title'}>Digital Security Identifier
                                                            Number - DSIN
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}><input name="dsin"
                                                                                             id="dsin"
                                                                                             type="text"
                                                                                             className="input__text dsin no-bg dsin-view"
                                                                                             disabled
                                                                                             value={this.symbol.dsin}/>
                                                        </div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Fifth Character Identifiers
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.fifth_character_identifier || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Alternative Asset
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.alternative_asset_category || 'not filled'} {this.symbol.alternative_asset_subcategory ? ` / ${this.symbol.alternative_asset_subcategory}` : ''}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Exempted Offerings
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.exempted_offerings || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Market Sector
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.market_sector || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Lot Size
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol?.lot_size ? formatterService.toPlainString(this.symbol.lot_size.toString()) : 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Fractional Lot Size
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol?.fractional_lot_size ? formatterService.toPlainString(this.symbol.fractional_lot_size.toString()) : 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Minimum Price Variation
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol?.mvp ? formatterService.toPlainString(this.symbol.mvp.toString()) : 'not filled'}</div>
                                                    </div>


                                                    <div className={'input__box full'}>
                                                        <h4 className={''}>Symbol Trading Information</h4>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Primary ATS
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.primary_ats || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Transfer Agent
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.transfer_agent || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Custodian
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.custodian || 'not filled'}</div>
                                                    </div>

                                                    <div className={'input__box full'}>
                                                        <h4 className={''}>Digital Asset</h4>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Digital Asset Category
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.digital_asset_category || 'not filled'} {this.symbol.instrument_type ? ` / ${this.symbol.instrument_type}` : ''}</div>
                                                    </div>

                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Issuer Name
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.issuer_name || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Issuer Type
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.issuer_type || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Underpinning Asset Value
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.underpinning_asset_value || 'not filled'} {(this.symbol.underpinning_asset_value === UnderpinningAssetValue.PEGGED && this.symbol.reference_asset) ? ` / ${this.symbol.reference_asset || 'not filled'}` : ''}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Rights Type
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.rights_type || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Enforceability
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.enforceability_type || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Fungibility Type
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.fungibility_type || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Redeemability Type
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.redeemability_type || 'not filled'} {(this.symbol.redeemability_type === RedeemabilityType.REDEEMABLE && this.symbol.redemption_asset_type) ? ` / ${this.symbol.redemption_asset_type || 'not filled'}` : ''}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Nature of record
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.nature_of_record || 'not filled'}</div>
                                                    </div>
                                                    <div className={'input__box'}>
                                                        <div className={'input__title'}>Edgar CIK
                                                        </div>
                                                        <div
                                                            className={'input__wrap'}>{this.symbol.edgar_cik || 'not filled'}</div>
                                                    </div>

                                                    {!this.symbol?.symbol_id && (
                                                        <>
                                                            <div className={'input__box full'}>
                                                                <h4 className={''}>Symbols</h4>
                                                            </div>
                                                            <div className={'input__box full'}>
                                                                <SubSymbolBlock
                                                                    isDashboard={false}
                                                                    symbol={this.props.symbol}
                                                                    onCallback={this.onCallbackSubSymbol}
                                                                />
                                                            </div>
                                                        </>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    </>
                                </div>
                            </div>

                        ) : (
                            <div className="flex-panel-box">
                                <div className={'profile__right'}>
                                    <NoDataBlock/>
                                </div>
                            </div>
                        )}

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={this.state.modalTitle}
                        >
                            {(this.state.formAction === 'edit' || this.state.formAction === 'view') && (
                                <div className="modal__navigate">
                                    {(this.state.companyProfileAccess.create ||
                                        this.state.companyProfileAccess.edit ||
                                        this.state.companyProfileAccess.view) && !this.state.symbol?.symbol_id && (
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
        );
    }

}

export default portalAccessWrapper(SymbolInfoBlock, 'SymbolBlock');
