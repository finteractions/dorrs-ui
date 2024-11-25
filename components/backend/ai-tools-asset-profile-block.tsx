import React, {RefObject} from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {ISymbol} from "@/interfaces/i-symbol";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Select from "react-select";
import {IAiToolGenerator} from "@/interfaces/i-ai-tool-generator";
import CompanyProfileForm from "@/components/company-profile-form";
import AssetImage from "@/components/asset-image";
import DoughnutChartPercentage from "@/components/chart/doughnut-chart-percentage";
import {ICompanyProfile} from "@/interfaces/i-company-profile";

interface AIToolsAssetProfileState {
    isLoading: boolean;
    symbols: ISymbol[];
    errors: string[];
    formInitialValues: {},
    symbol: ISymbol | null;
    companyProfile: ICompanyProfile | null;
    isResultLoader: boolean;
}

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required').label('Symbol'),
    prompt: Yup.string().required('Required').label('Prompt'),
    is_enable: Yup.boolean()
});


const prompt = `
Provide the following company "{{__security__name__}}" information (Market Sector is {{__market_sector__}})::
Total Equity Funding Amount, Founded Date, Company Name, Business Description, Last Funding Amount, Last Funding Date, Last Market Valuation of Company, Last Sale Price of Company Stock, Company Address (Street, City, State, Zip Code, Country), Email, Phone, Web Address, SIC Industry Classification, Incorporation State Information, Number of Employees, Company Officers & Contacts, Board of Directors, Product & Services, Company Facilities, Service Providers (Transfer Agent, Accounting / Auditing Firm, Investor Relations / Marketing / Communications, Securities Counsel), Financial Reporting Information, US Reporting Status, SEC CIK Number.

Requirements:
1 JSON-format
2 add "company_name". Set the Company Name
3 add "logo" attribute to JSON-response. Use the following URL format to retrieve the logo: 'https://logo.clearbit.com/{{__domain_name__}}?size=500&format=png'. Replace '{{__domain_name__}}' with the company's domain name. The logo should be visually appealing, square-shaped, minimalistic, and suitable for web use. If no domain name the value is empty.
4 date format is YYYY-MM-DD
5 dollar values without commas and $
6 if no public information the value is empty
7 Company Officers & Contacts and Board of Directors is array of string values
8 Product & Services and Company Facilities are string value
9 Last Funding Amount based on 2 arrays of 
- price_per_share_date - array of string dates in format YYYY-MM-DD
- price_per_share_value - array of string values
These 2 array associated - each value of price_per_share_date is for index of price_per_share_value
10 Company Address fields are not company_address. Fields only
11 be ensure the data is valid. If the value is incorrect set is empty. Try to find all information
12 if no information about the company return response {}

Associated fields to JSON-format response:
Total Equity Funding Amount: total_shares_outstanding
Founded Date: initial_offering_date
Company Name: company_name
Business Description: business_description
Last Funding Date: price_per_share_date
Last Funding Amount: price_per_share_value
Last Market Valuation of Company: last_market_valuation
Last Sale Price of Company Stock: last_sale_price
Company Address (Street): street_address_1
Company Address (City): city
Company Address (State): state
Company Address (Zip Code): zip_code
Company Address (Country): country
Email: email
Phone: phone
Web Address: web_address
SIC Industry Classification: sic_industry_classification
Incorporation State Information: incorporation_information
Number of Employees: number_of_employees
Company Officers & Contacts: company_officers_and_contacts
Board of Directors: board_of_directors
Product & Services: product_and_services
Company Facilities: company_facilities
Service Providers (Transfer Agent): transfer_agent
Service Providers (Accounting / Auditing Firm): accounting_auditing_firm
Service Providers (Investor Relations / Marketing / Communications): investor_relations_marketing_communications
Service Providers (Securities Counsel): securities_counsel
Financial Reporting Information (US Reporting Status): us_reporting
Financial Reporting Information (SEC CIK Number): edgar_cik
`;


class AIToolsAssetProfileBlock extends React.Component<{}> {
    state: AIToolsAssetProfileState;
    formRef: RefObject<any>;
    host: string = '';

    constructor(props: {}) {
        super(props);

        const initialValues: IAiToolGenerator = {
            symbol: '',
            is_enable: false,
            symbol_tmp: '',
            prompt: '',
        }

        this.state = {
            isLoading: true,
            symbols: [],
            errors: [],
            formInitialValues: initialValues,
            isResultLoader: false,
            symbol: null,
            companyProfile: null
        }

        this.formRef = React.createRef();
    }

    async componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
        await this.load()
    }

    async load() {
        await this.getSymbols()
            .finally(async () => {
                if (this.formRef.current) {
                    await this.formRef.current.resetForm();
                    this.setState({isLoading: false});
                }

                this.setState({isLoading: false})
            })
    }

    getSymbols = () => {
        return new Promise(resolve => {
            adminService.getAssets()
                .then((res: ISymbol[]) => {
                    let data = res || [];
                    this.setState({symbols: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    handleSubmit = async (values: IAiToolGenerator, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({isResultLoader: true, result: '', errors: [], companyProfile: null});
        setSubmitting(true)
        const body = {
            prompt: values.prompt
        }
        await adminService.aiToolsAssetProfile(body)
            .then((res: any) => {
                const result = res?.[0] ?? '';
                // this.setState({result: result});
                const companyProfile = result as ICompanyProfile;
                this.setState({companyProfile: companyProfile});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(async () => {
                this.setState({isResultLoader: false}, () => {
                    setSubmitting(false);
                })
            });
    }

    renderOption = (item: ISymbol) => (
        {
            value: item.symbol,
            id: item.id,
            label: (
                <div
                    className={'flex-panel-box'}>
                    <div
                        className={'panel'}>
                        <div
                            className={'content__bottom d-flex justify-content-between font-size-18'}>
                            <div
                                className={'view_block_main_title'}>
                                <AssetImage
                                    alt=''
                                    src={item.company_profile?.logo ? `${this.host}${item.company_profile?.logo}` : ''}
                                    width={28}
                                    height={28}/>
                                {item.security_name} ({item.symbol})
                            </div>
                        </div>
                    </div>
                </div>
            ),
        }
    );

    fillAssetProfileForm = async (
        selectedOption: any,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
        setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
    ) => {
        const symbol = selectedOption?.value || null;
        const symbolData = selectedOption?.data || null;
        const securityName = selectedOption?.data?.security_name ?? '';
        const marketSector = selectedOption?.data?.market_sector ?? '';
        const promptValue = prompt.replace('{{__security__name__}}', securityName).replace('{{__market_sector__}}', marketSector);

        this.setState({symbol: symbolData});

        await Promise.all([
            setFieldValue('symbol', symbol),
            setFieldValue('prompt', promptValue),
        ]);

        setTimeout(() => {
            setFieldTouched('symbol', true, true);
            setFieldTouched('prompt', true, true);
        }, 0);
    }


    render() {
        return (

            <>
                <div className="user section">
                    <div className={'approve-form'}>
                        <div className={'approve-form-text'}>
                            AI Asset Profile
                        </div>
                    </div>

                    {this.state.isLoading && (
                        <LoaderBlock/>
                    )}
                    <div className={`w-100 ${this.state.isLoading ? 'd-none' : ''}`}>
                        <div className={'form-panel'}>
                            <div>
                                <Formik<IAiToolGenerator>
                                    initialValues={this.state.formInitialValues as IAiToolGenerator}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({
                                          isSubmitting,
                                          setSubmitting,
                                          setFieldValue,
                                          setFieldTouched,
                                          isValid,
                                          dirty,
                                          values,
                                          resetForm,
                                          errors
                                      }) => {
                                        return (
                                            <Form>
                                                <div className="input">
                                                    <div className="input__title">Symbol <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                        <Field
                                                            name="symbol"
                                                            id="symbol"
                                                            as={Select}
                                                            className="b-select-search"
                                                            placeholder="Select Symbol"
                                                            classNamePrefix="select__react"
                                                            isDisabled={isSubmitting}
                                                            options={Object.values(this.state.symbols).map((item) => ({
                                                                value: item.symbol,
                                                                data: item,
                                                                label: (
                                                                    <div className={'flex-panel-box'}>
                                                                        <div className={'panel'}>
                                                                            <div
                                                                                className={'content__bottom d-flex justify-content-between font-size-18'}>
                                                                                <div
                                                                                    className={'view_block_main_title'}>
                                                                                    <AssetImage alt=''
                                                                                                src={item.company_profile?.logo ? `${this.host}${item.company_profile?.logo}` : ''}
                                                                                                width={75} height={75}/>
                                                                                    {item.company_profile?.company_name || item.security_name} ({item.symbol})
                                                                                </div>
                                                                                <DoughnutChartPercentage
                                                                                    percentage={Number(item.company_profile?.fill_out_percentage || 0)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            }))}
                                                            onChange={async (selectedOption: any) => {
                                                                await this.fillAssetProfileForm(selectedOption, setFieldValue, setFieldTouched);
                                                            }}
                                                            value={
                                                                Object.values(this.state.symbols).filter(i => i.symbol === values.symbol).map((item) => (this.renderOption(item)))?.[0] || null
                                                            }
                                                        />
                                                        <ErrorMessage name="symbol" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Prompt <i>*</i></div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="prompt"
                                                            id="prompt"
                                                            as="textarea"
                                                            rows="20"
                                                            className="input__textarea"
                                                            placeholder="Type Prompt"
                                                            disabled={isSubmitting}
                                                            aria-readonly={!values.is_enable}
                                                            readOnly={!values.is_enable}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div
                                                        className={`b-checkbox b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="is_enable"
                                                            id="is_enable_ai_asset_profiler"
                                                            disabled={isSubmitting}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const isChecked = e.target.checked;
                                                                setFieldValue("is_enable", isChecked);
                                                            }}
                                                        />
                                                        <label htmlFor="is_enable_ai_asset_profiler">
                                                            <span></span><i> Edit prompt</i>
                                                        </label>
                                                        <ErrorMessage name="is_enable" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                <button id="add-bank-acc"
                                                        className={`mt-2 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                    Submit
                                                </button>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>

                            <div className="input">
                                {this.state.isResultLoader ? (
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        {this.state.companyProfile && (
                                            <>
                                                <AlertBlock type={'info'} messages={["This form is readonly"]}/>

                                                <CompanyProfileForm
                                                    data={this.state.companyProfile}
                                                    symbolData={this.state.symbol}
                                                    action={'add'}
                                                    isAdmin={true}
                                                    onCallback={() => {
                                                    }}
                                                    readonly={true}
                                                    isAIGeneration={true}
                                                />
                                            </>
                                        )}
                                        {this.state.errors && (
                                            <AlertBlock type={"error"} messages={this.state.errors}/>
                                        )}
                                    </>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default AIToolsAssetProfileBlock
