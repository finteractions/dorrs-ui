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
import {FormFieldOptionType} from "@/enums/form-field-option-type";


interface CompanyProfileProps extends ICallback {
    symbol: string;
}

interface CompanyProfileState extends IState, IModalState {
    isLoading: boolean;
    isOpenCompanyModal: boolean;
    formCompanyAction: string;
    errors: string[];
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class CompanyProfileBlock extends React.Component<CompanyProfileProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: CompanyProfileState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;
    host = `${window.location.protocol}//${window.location.host}`;

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
            usaStates: usaStatesList,
        }
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols();
    }

    getSymbols = () => {
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
                this.setState({isLoading: false}, () => {
                    this.props.onCallback(this.companyProfile?.logo)
                })
            });
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

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.getSymbols();
        this.cancelCompanyForm()
    };

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
                            <div className={'content__bottom'}>
                                <NoDataBlock/>
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

                    </>
                )}
            </>
        );
    }

}

export default CompanyProfileBlock;
