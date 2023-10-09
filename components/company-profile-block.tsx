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


interface CompanyProfileProps {
    symbol: string;
}

interface CompanyProfileState extends IState, IModalState {
    isLoading: boolean;
    isOpenCompanyModal: boolean;
    formCompanyAction: string;
    errors: string[];
}

class CompanyProfileBlock extends React.Component<CompanyProfileProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: CompanyProfileState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;

    constructor(props: CompanyProfileProps) {
        super(props);

        this.companyProfile = null;
        this.symbol = null;
        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            errors: [],
            isOpenCompanyModal: false,
            formCompanyAction: 'add',
        }
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols();
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
                });

                this.symbols = data;
                const symbol = this.symbols.find((s: ISymbol) => s.symbol === this.props.symbol);
                this.symbol = symbol || null;
                this.companyProfile = symbol?.company_profile || null;
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
            return 'View Company Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Company Profile`;
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

                        <div className="d-flex align-items-center justify-content-between flex-1">
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/> <Link
                                    className="login__link"
                                    href="/symbols"

                                >Back
                                </Link>
                                </p>
                            </div>
                            {this.companyProfile && !this.companyProfile.is_approved && (
                                <button
                                    className={`b-btn ripple`}
                                    onClick={() => this.openCompanyModal('edit')}
                                >Edit
                                </button>
                            )}

                        </div>
                        <div className={'panel'}>
                            {this.symbol ? (
                                <>
                                    {this.companyProfile ? (
                                        <div className={'content__bottom'}>
                                            <h2 className={'view_block_main_title'}>
                                                {this.companyProfile.logo && (
                                                    <div className={"company-profile-logo"}>
                                                        <img src={this.companyProfile.logo} alt="Logo"/>
                                                    </div>
                                                )}

                                                {this.companyProfile.company_name} ({this.companyProfile.security_name})
                                            </h2>

                                            <div className='view_panel'>
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Company Address</div>
                                                        <div>{[this.companyProfile.street_address_1, this.companyProfile.street_address_2, this.companyProfile.city, this.companyProfile.zip_code, this.companyProfile.country].filter(i => i !== '').join(', ') || 'not filled'}</div>
                                                        <div className="mt-2">{this.companyProfile.phone}</div>
                                                        <div className="mt-2">{this.companyProfile.web_address}</div>
                                                    </div>
                                                </div>
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Business Description</div>
                                                        <div>{this.companyProfile.business_description || 'not filled'}</div>
                                                    </div>
                                                </div>
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Company Profile Data</div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">SIC Industry
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
                                                                className="">{this.companyProfile.incorporation_information || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Number of Employees
                                                            </div>
                                                            <div
                                                                className="">{this.companyProfile.number_of_employees || 'not filled'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Company Officers & Contacts
                                                        </div>
                                                        <div>{this.companyProfile.company_officers_and_contacts || 'not filled'}</div>
                                                    </div>
                                                </div>
                                                <div className="view_block full_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Board of Directors</div>
                                                        <div>{this.companyProfile.board_of_directors || 'not filled'}</div>
                                                    </div>
                                                </div>
                                                <div className="view_block full_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Product & Services</div>
                                                        <div>{this.companyProfile.product_and_services || 'not filled'}</div>
                                                    </div>
                                                </div>
                                                <div className="view_block full_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Company Facilities</div>
                                                        <div>{this.companyProfile.company_facilities || 'not filled'}</div>
                                                    </div>
                                                </div>

                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Service Providers</div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Transfer Agent</div>
                                                            <div
                                                                className="">{this.companyProfile.transfer_agent || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Accounting / Auditing
                                                                Firm
                                                            </div>
                                                            <div
                                                                className="">{this.companyProfile.accounting_auditing_firm || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Investor Relations /
                                                                Marketing
                                                                / Communications
                                                            </div>
                                                            <div
                                                                className="">{this.companyProfile.investor_relations_marketing_communications || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Securities Counsel
                                                            </div>
                                                            <div
                                                                className="">{this.companyProfile.securities_counsel || 'not filled'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="view_block_title">Financial Reporting</div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">US Reporting</div>
                                                            <div
                                                                className="">{this.companyProfile.us_reporting || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Edgar CIK</div>
                                                            <div
                                                                className="">{this.companyProfile.edgar_cik || 'not filled'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={'content__bottom flex flex-1 justify-content-center text-center'}>
                                            <div className="mb-24">This is Company Profile
                                                for {this.symbol?.symbol}</div>
                                            <button
                                                className={`b-btn ripple`}
                                                onClick={() => this.openCompanyModal('add')}
                                            >Add
                                            </button>
                                        </div>
                                    )}</>
                            ) : (
                                <div className={'content__bottom'}>
                                    <NoDataBlock/>
                                </div>
                            )}


                        </div>

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
