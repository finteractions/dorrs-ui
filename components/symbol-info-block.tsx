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
import {UnderpinningAssetValue} from "@/enums/underpinning-asset-value";
import {RedeemabilityType} from "@/enums/redeemability-type";
import formatterService from "@/services/formatter/formatter-service";


interface SymbolInfoProps {
    symbol: string;
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
}

class SymbolInfoBlock extends React.Component<SymbolInfoProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: SymbolInfoState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;

    constructor(props: SymbolInfoProps) {
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
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

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
                        {this.symbol ? (
                            <>
                                <div className="flex-panel-box">

                                    <div className="panel">
                                        <div className="content__bottom d-flex justify-content-between">
                                            <h2 className="view_block_main_title">
                                                {this.symbol.security_name} ({this.symbol.symbol})
                                            </h2>
                                        </div>
                                    </div>

                                    <div id={'reason_for_entry'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Reason for Entry</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.reason_for_entry || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'security_name'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Security Name</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.security_name || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'symbol'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Symbol</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.symbol || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="cusip" className="panel">
                                        <div className="content__top">
                                            <div className="content__title">CUSIP</div>
                                        </div>
                                        <div className="content__bottom">
                                            <div className="view_panel">
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="ver">
                                                            <div className="view_block_sub_title mt-0">Does it have
                                                                cusip number?
                                                            </div>
                                                            <div
                                                                className="">{this.symbol.is_cusip ? 'Yes' : 'No' || 'not filled'}</div>
                                                        </div>
                                                        {this.symbol?.is_cusip && this.symbol.is_cusip && (
                                                            <div className="ver">
                                                                <div className="view_block_sub_title">CUSIP Number
                                                                </div>
                                                                <div
                                                                    className="">{this.symbol.cusip || 'not filled'}</div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'dsin'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Digital Security Identifier Number -
                                                DSIN
                                            </div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div className="input">
                                                <div className="input__wrap">
                                                    <input name="dsin"
                                                           id="dsin"
                                                           type="text"
                                                           className="input__text dsin no-bg"
                                                           disabled
                                                           value={this.symbol.dsin}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'primary_ats'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Primary ATS</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.primary_ats || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'transfer_agent'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Transfer Agent</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.transfer_agent || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'custodian'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Custodian</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.custodian || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'custodian'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Custodian</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.custodian || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'market_sector'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Market Sector</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.market_sector || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'lot_size'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Lot Size</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol?.lot_size ? formatterService.toPlainString(this.symbol.lot_size.toString()) : 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'fractional_lot_size'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Fractional Lot Size</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol?.fractional_lot_size ? formatterService.toPlainString(this.symbol.fractional_lot_size.toString()) : 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'mvp'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Minimum Price Variation</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol?.mvp ? formatterService.toPlainString(this.symbol.mvp.toString()) : 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'fifth_character_identifier'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Fifth Character Identifiers</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.fifth_character_identifier || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="digital_asset" className="panel">
                                        <div className="content__top">
                                            <div className="content__title">Digital Asset</div>
                                        </div>
                                        <div className="content__bottom">
                                            <div className="view_panel">
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="ver">
                                                            <div className="view_block_sub_title mt-0">Category
                                                            </div>
                                                            <div
                                                                className="">{this.symbol.digital_asset_category || 'not filled'}</div>
                                                        </div>
                                                        <div className="ver">
                                                            <div className="view_block_sub_title">Instrument
                                                                Type
                                                            </div>
                                                            <div
                                                                className="">{this.symbol.instrument_type || 'not filled'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'issuer_name'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Issuer Name</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.issuer_name || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'issuer_type'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Issuer Type</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.issuer_type || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="underpinning_asset_value" className="panel">
                                        <div className="content__top">
                                            <div className="content__title">Underpinning Asset Value</div>
                                        </div>
                                        <div className="content__bottom">
                                            <div className="view_panel">
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="ver">
                                                            <div
                                                                className="">{this.symbol.underpinning_asset_value || 'not filled'}</div>
                                                        </div>
                                                        {this.symbol.underpinning_asset_value === UnderpinningAssetValue.PEGGED && (
                                                            <div className="ver">
                                                                <div className="view_block_sub_title">Reference
                                                                    Asset
                                                                </div>
                                                                <div
                                                                    className="">{this.symbol.reference_asset || 'not filled'}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'rights_type'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Rights Type</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.rights_type || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'rights_type'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Enforceability</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.enforceability_type || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'fungibility_type'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Fungibility Type</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.fungibility_type || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="underpinning_asset_value" className="panel">
                                        <div className="content__top">
                                            <div className="content__title">Redeemability Type</div>
                                        </div>
                                        <div className="content__bottom">
                                            <div className="view_panel">
                                                <div className="view_block">
                                                    <div className="view_block_body">
                                                        <div className="ver">
                                                            <div
                                                                className="">{this.symbol.redeemability_type || 'not filled'}</div>
                                                        </div>
                                                        {this.symbol.underpinning_asset_value === RedeemabilityType.REDEEMABLE && (
                                                            <div className="ver">
                                                                <div
                                                                    className="view_block_sub_title">Redemption
                                                                    Asset Type
                                                                </div>
                                                                <div
                                                                    className="">{this.symbol.redemption_asset_type || 'not filled'}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id={'nature_of_record'} className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Nature of record</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            <div>
                                                <div>{this.symbol.nature_of_record || 'not filled'}</div>
                                            </div>
                                        </div>
                                    </div>
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
                )
                }
            </>
        )
            ;
    }

}

export default SymbolInfoBlock;
