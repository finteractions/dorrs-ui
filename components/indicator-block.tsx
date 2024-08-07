import React from 'react';
import LoaderBlock from "@/components/loader-block";
import statisticsService from "@/services/statistics/statistics-service";
import {IIndicator, IIndicatorBlock} from "@/interfaces/i-indicator";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import CompanyProfile from "@/components/company-profile-form";
import Modal from "@/components/modal";
import {ISymbol} from "@/interfaces/i-symbol";
import SymbolForm from "@/components/symbol-form";
import LastSaleReportingForm from "@/components/last-sale-reporting-form";
import symbolService from "@/services/symbol/symbol-service";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Select from "react-select";
import AreaChart from "@/components/chart/area-chart";
import BestBidAndBestOfferForm from "@/components/best-bid-and-best-offer-form";
import {IDataContext} from "@/interfaces/i-data-context";
import {DataContext} from "@/contextes/data-context";
import DepthOfBookForm from "@/components/depth-of-book-form";
import userPermissionService from "@/services/user/user-permission-service";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import AssetImage from "@/components/asset-image";
import DoughnutChartPercentage from "@/components/chart/doughnut-chart-percentage";
import CompanyProfileForm from "@/components/company-profile-form";


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
    companyProfile: ICompanyProfile | null;
    isOverrideComponent: boolean;
    statistics: Map<string, IIndicatorBlock>;
    isClose: boolean;
}

interface IndicatorBlockProps extends ICallback {

}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class IndicatorBlock extends React.Component<IndicatorBlockProps> {
    host = `${window.location.protocol}//${window.location.host}`;
    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    symbols: Array<ISymbol> = new Array<ISymbol>();

    state: IndicatorBlockState;

    getStatisticsInterval: NodeJS.Timer | number | undefined;

    access = {
        symbols: false,
        companyProfile: false,
        lastSale: false,
        bestBidAndBestOffer: false,
        depthOfBook: false,
    }

    constructor(props: IndicatorBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            companyProfile: null,
            formType: '',
            symbol: null,
            isOverrideComponent: true,
            statistics: new Map<string, IIndicatorBlock>(),
            isClose: false
        }

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
        if (this.getStatisticsInterval) clearInterval(this.getStatisticsInterval as number);
    }

    getStatistics = () => {
        statisticsService.getIndicators()
            .then((res: Array<IIndicator>) => {
                this.prepareStatistics(res)
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    prepareStatistics = (data: Array<IIndicator>) => {
        data.forEach(s => {
            const access = userPermissionService.getAccessRulesByKey(
                s.type,
                this.context.userProfile.access
            )
            const item: IIndicatorBlock = {
                ...s,
                name: access.name,
                access: access.values.create
            }

            const statistics = this.state.statistics
            statistics.set(s.type, item)

            this.setState({
                statistics: statistics
            })

        })
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];
                this.symbols = data.filter(s => s.is_approved)

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
        if (form === 'security') {
            this.props.onCallback('symbol', 'add')
        } else {
            this.setState({isOpenModal: true, formType: form});
        }

    }

    closeModal(): void {
        if (!this.state.isClose) {
            this.setState({isClose: !this.state.isClose}, () => {
                this.state.isClose
            })
        } else {
            this.cancel();
        }

    }

    cancel = () => {
        this.setState({
            isOpenModal: false,
            formType: '',
            symbol: null,
            isOverrideComponent: true,
            formAction: 'add',
            isClose: false
        });
    }

    onCallback = async (values: any, step: boolean) => {
        this.getStatistics();
        this.getSymbols();
        this.closeModal();
    };

    handleSubmit = async (values: ISymbol, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.context.setSharedData({symbol: values.symbol})
        this.props.onCallback('asset_profile', 'add')
    };

    renderFormBasedOnType(formType: string) {
        switch (formType) {
            case 'security':
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
                    this.state.isOverrideComponent ? (
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
                                  values,
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
                                                        value: item.symbol,
                                                        label: (
                                                            <div className={'flex-panel-box'}>
                                                                <div className={'panel'}>
                                                                    <div
                                                                        className={'content__bottom d-flex justify-content-between font-size-18'}>
                                                                        <div className={'view_block_main_title'}>
                                                                            <AssetImage alt=''
                                                                                        src={item.company_profile?.logo ? `${this.host}${item.company_profile?.logo}` : ''}
                                                                                        width={75} height={75}/>
                                                                            {item.company_profile?.company_name || item.security_name} ({item.symbol})
                                                                        </div>
                                                                        <DoughnutChartPercentage
                                                                            percentage={item.fill_out_percentage}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    }))}
                                                    onChange={(selectedOption: any) => {
                                                        setFieldValue('symbol', selectedOption.value);
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
                    ) : (
                        <CompanyProfileForm
                            action={this.state.formAction}
                            data={this.state.companyProfile}
                            symbolData={this.state.symbol}
                            onCallback={this.onCallback}
                            isAdmin={false}
                        />
                    )
                );
            case 'last_sale_reporting':
                return (
                    <LastSaleReportingForm
                        action={this.state.formAction}
                        data={null}
                        isClose={this.state.isClose}
                        onCallback={this.onCallback}
                        onCancel={this.cancel}
                    />
                );
            case 'bbo':
                return (
                    <BestBidAndBestOfferForm
                        action={this.state.formAction}
                        data={null}
                        isClose={this.state.isClose}
                        onCallback={this.onCallback}
                        onCancel={this.cancel}
                    />
                );
            case 'dob':
                return (
                    <DepthOfBookForm
                        action={'new'}
                        data={null}
                        isClose={this.state.isClose}
                        onCallback={this.onCallback}
                        onCancel={this.cancel}
                    />
                );
            default:
                return null;
        }
    }

    modalTitle = () => {
        const add = 'Add';
        switch (this.state.formType) {
            case 'security':
                return `${add} View`;
            case 'company_profile':
                return `${add} Asset Profile`;
            case 'last_sale_reporting':
                return `${add} Last Sale`;
            case 'bbo':
                return `${add} BBO`;
            case 'dob':
                return `${add} Order`;
            default:
                return '';
        }
    }

    blockTitle = (key: string, name: string) => {
        switch (key) {
            case 'last_sale_reporting':
                return `Last Sale`;
            default:
                return name;
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
                            {Array.from(this.state.statistics).map(([key, value]) => (

                                <div key={key} className={'indicator__item dashboard'}>
                                    <div className={''}>
                                        <div
                                            dangerouslySetInnerHTML={{__html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="part-blue-bolder" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM14.5 4.5C10.4 4.5 7 7.9 7 12C7 16.1 10.4 19.5 14.5 19.5C18.6 19.5 22 16.1 22 12C22 7.9 18.6 4.5 14.5 4.5Z" fill="#718494"/><path opacity="0.3" d="M22 12C22 16.1 18.6 19.5 14.5 19.5C10.4 19.5 7 16.1 7 12C7 7.9 10.4 4.5 14.5 4.5C18.6 4.5 22 7.9 22 12ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="#718494"/></svg>'}}/>
                                        <div>{this.blockTitle(key, value?.name)}</div>
                                    </div>
                                    <div>
                                        <div>
                                            <div>{value?.total || '-'}</div>
                                            <div
                                                className={value?.new ? this.getIndicatorType(value?.new) : ''}>{value?.new}</div>
                                        </div>

                                        {value?.access && (
                                            <button
                                                type="button"
                                                className='b-btn ripple'
                                                onClick={() => this.openModal(key)}
                                            >
                                                <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                            </button>
                                        )}

                                    </div>
                                    <div className={'indicator__item__graph'}>
                                        <AreaChart
                                            key={value.new}
                                            labels={Object.values(value?.points.map(s => s.time) || [])}
                                            data={Object.values(value?.points.map(s => s.volume) || [])}
                                            title={''}/>
                                    </div>
                                </div>

                            ))}
                        </div>

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.closeModal()}
                               title={this.modalTitle()}
                               className={`${['dob', 'bbo', 'last_sale_reporting'].includes(this.state.formType) && !this.state.isClose ? 'big_modal' : ''}`}
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
