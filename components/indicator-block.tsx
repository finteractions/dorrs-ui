import React from 'react';
import LoaderBlock from "@/components/loader-block";
import statisticsService from "@/services/statistics/statistics-service";
import {IIndicator} from "@/interfaces/i-indicator";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import CompanyProfile from "@/components/company-profile-form";
import Modal from "@/components/modal";
import {ISymbol} from "@/interfaces/i-symbol";
import SymbolForm from "@/components/symbol-form";
import LastSaleReportForm from "@/components/last-sale-reporting-form";
import symbolService from "@/services/symbol/symbol-service";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Select from "react-select";
import AreaChart from "@/components/chart/area-chart";


const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required'),
});

let initialValues = {} as ISymbol;

interface IndicatorBlockState extends IState {
    isLoading: boolean;
    isOpenModal: boolean;
    formAction: string;
    formType: string;
    symbol: ISymbol | null;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class IndicatorBlock extends React.Component {

    symbols: Array<ISymbol> = new Array<ISymbol>();

    state: IndicatorBlockState;

    getStatisticsInterval!: NodeJS.Timer;

    statisticsSymbol: IIndicator | null;
    statisticsCompanyProfile: IIndicator | null;
    statisticsLastSale: IIndicator | null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            formType: '',
            symbol: null,
        }

        this.statisticsSymbol = null;
        this.statisticsCompanyProfile = null;
        this.statisticsLastSale = null;
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getSymbols();
        this.getStatistics();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getStatisticsInterval = setInterval(() => {
            this.getStatistics();
            this.getSymbols();
        }, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getStatisticsInterval) clearInterval(this.getStatisticsInterval);
    }

    getStatistics = () => {
        statisticsService.getIndicators()
            .then((res: Array<IIndicator>) => {
                this.statisticsSymbol = res.find(s => s.type === 'symbol') || null;
                this.statisticsCompanyProfile = res.find(s => s.type === 'company_profile') || null;
                this.statisticsLastSale = res.find(s => s.type === 'last_sale') || null;
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];
                this.symbols = data.filter(s => !s.company_profile)

            })
            .catch((errors: IError) => {

            })
            .finally(() => {
            });
    }

    getIndicatorType(value: number): any {
        const numericValue = parseFloat(value.toString());

        switch (true) {
            case numericValue > 0:
                return 'up';
            case numericValue < 0:
                return 'down';
            default:
                return '';
        }
    }

    openModal = (form: string) => {
        this.setState({isOpenModal: true, formType: form});
    }

    closeModal(): void {
        this.setState({isOpenModal: false, formType: '', symbol: null});
    }

    modalTitle = (form: string) => {
        const add = 'Add';
        switch (form) {
            case 'symbol':
                return `${add} Symbol`;
            case 'company_profile':
                return `${add} Company Profile`;
            case 'last_sale':
                return `${add} Last Sale`;
            case 'symbol_list':
                return `Select Symbol`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.getStatistics();
        this.getSymbols();
        this.closeModal();
    };

    handleSubmit = async (values: ISymbol, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        const symbol = this.symbols.find(s => s.symbol === values.symbol);
        this.setState({isOpenModal: true, formType: 'company_profile', symbol: symbol});
    };

    renderFormBasedOnType(formType: string) {
        switch (formType) {
            case 'symbol':
                return (
                    <SymbolForm
                        isAdmin={false}
                        action={this.state.formAction}
                        data={null}
                        onCallback={this.onCallback}
                    />
                );
            case 'company_profile':
                return (
                    <CompanyProfile
                        action={this.state.formAction}
                        data={null}
                        symbolData={this.state.symbol}
                        onCallback={this.onCallback}
                        isAdmin={false}
                    />
                );
            case 'last_sale':
                return (
                    <LastSaleReportForm
                        action={this.state.formAction}
                        data={null}
                        onCallback={this.onCallback}
                    />
                );
            case 'symbol_list':
                return (
                    <Formik<ISymbol>
                        initialValues={initialValues}
                        validationSchema={formSchema}
                        onSubmit={this.handleSubmit}
                    >
                        {({
                              isSubmitting,
                              setFieldValue,
                              isValid,
                              dirty,
                              errors
                          }) => {
                            return (
                                <Form>
                                    <div className="input">
                                        <div className="input__title">Symbol <i>*</i></div>
                                        <div
                                            className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                            <Field
                                                name="symbol_tmp"
                                                id="symbol_tmp"
                                                as={Select}
                                                className="b-select-search"
                                                placeholder="Select Symbol"
                                                classNamePrefix="select__react"
                                                isDisabled={isSubmitting}
                                                options={Object.values(this.symbols).map((item) => ({
                                                    value: item,
                                                    label: item.symbol,
                                                }))}
                                                onChange={(selectedOption: any) => {
                                                    console.log(selectedOption)
                                                    setFieldValue('symbol', selectedOption.value.symbol);
                                                }}
                                            />
                                            <Field type="hidden" name="symbol" id="symbol"/>
                                            <ErrorMessage name="symbol" component="div"
                                                          className="error-message"/>
                                        </div>
                                    </div>
                                    <button
                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                        Next
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>
                );
            default:
                return null;
        }
    }


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock width={75} height={75}/>
                ) : (
                    <>
                        <div className="indicators content__bottom">

                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>'}}/>
                                    <div>Symbols</div>
                                </div>
                                <div>
                                    <div>
                                        <div>{this.statisticsSymbol?.total || '-'}</div>
                                        <div
                                            className={this.statisticsSymbol?.new ? this.getIndicatorType(this.statisticsSymbol.new) : ''}>{this.statisticsSymbol?.new}</div>
                                    </div>

                                    <button
                                        type="button"
                                        className='b-btn ripple'
                                        onClick={() => this.openModal('symbol')}
                                    >
                                        <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                    </button>
                                </div>
                                <div className={'indicator__item__graph'}>
                                    <AreaChart
                                        key={this.statisticsSymbol?.new}
                                        labels={Object.values(this.statisticsSymbol?.points.map(s => s.time) || [])}
                                        data={Object.values(this.statisticsSymbol?.points.map(s => s.volume) || [])}
                                        title={''}/>
                                </div>
                            </div>
                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>'}}/>
                                    <div>Company Profile</div>
                                </div>
                                <div>
                                    <div>
                                        <div>{this.statisticsCompanyProfile?.total || '-'}</div>
                                        <div
                                            className={this.statisticsCompanyProfile?.new ? this.getIndicatorType(this.statisticsCompanyProfile.new) : ''}>{this.statisticsCompanyProfile?.new}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className='b-btn ripple'
                                        onClick={() => this.openModal('symbol_list')}
                                    >
                                        <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                    </button>
                                </div>
                                <div className={'indicator__item__graph'}>
                                    <AreaChart
                                        key={this.statisticsCompanyProfile?.new}
                                        labels={Object.values(this.statisticsCompanyProfile?.points.map(s => s.time) || [])}
                                        data={Object.values(this.statisticsCompanyProfile?.points.map(s => s.volume) || [])}
                                        title={''}/>
                                </div>
                            </div>
                            <div className={'indicator__item'}>
                                <div className={''}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.3" x="13" y="4" width="3" height="16" rx="1.5" fill="#718494"/><rect x="8" y="9" width="3" height="11" rx="1.5" fill="#718494"/><rect x="18" y="11" width="3" height="9" rx="1.5" fill="#718494"/><rect x="3" y="13" width="3" height="7" rx="1.5" fill="#718494"/></svg>'}}/>
                                    <div>Last Sale</div>
                                </div>
                                <div>
                                    <div>
                                        <div>{this.statisticsLastSale?.total || '-'}</div>
                                        <div
                                            className={this.statisticsLastSale?.new ? this.getIndicatorType(this.statisticsLastSale.new) : ''}>{this.statisticsLastSale?.new}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className='b-btn ripple'
                                        onClick={() => this.openModal('last_sale')}
                                    >
                                        <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                    </button>
                                </div>
                                <div className={'indicator__item__graph'}>
                                    <AreaChart
                                        key={this.statisticsLastSale?.new}
                                        labels={Object.values(this.statisticsLastSale?.points.map(s => s.time) || [])}
                                        data={Object.values(this.statisticsLastSale?.points.map(s => s.volume) || [])}
                                        title={''}/>
                                </div>
                            </div>
                        </div>

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={this.modalTitle(this.state.formType)}
                        >

                            {this.renderFormBasedOnType(this.state.formType)}

                        </Modal>
                    </>
                )}
            </>
        );
    }

}

export default IndicatorBlock;
