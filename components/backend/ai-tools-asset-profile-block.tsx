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

interface AIToolsAssetProfileState {
    isLoading: boolean;
    symbols: ISymbol[];
    aiToolGeneratorSymbols: Array<string>,
    errors: string[];
    formInitialValues: {},
    result: any;
    isResultLoader: boolean;
}

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required').label('Symbol'),
    prompt: Yup.string().required('Required').label('Prompt'),
});


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
            aiToolGeneratorSymbols: [],
            result: '',
            isResultLoader: false
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
                    data = data.filter(s => s.is_approved).filter(s => !this.state.aiToolGeneratorSymbols.includes(s.symbol))

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
        this.setState({isResultLoader: true, result: '', errors: []});
        setSubmitting(true)
        const body = {
            symbol: values.symbol,
            prompt: values.prompt
        }
        await adminService.aiToolsAssetProfile(body)
            .then((res: any) => {
                const result = res?.[0] ?? '';
                this.setState({result: result});
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
                                                            onChange={(selectedOption: any) => {
                                                                const value = selectedOption?.value || null
                                                                setFieldValue('symbol', value);
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
                                                            rows="10"
                                                            className="input__textarea"
                                                            placeholder="Type Prompt"
                                                            disabled={isSubmitting}
                                                        />
                                                        <ErrorMessage name="prompt" component="div"
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
                                <div className="input__title">Result:</div>
                                <div className="input__wrap">
                                    {this.state.isResultLoader ? (
                                        <LoaderBlock/>
                                    ) : (
                                        <>
                                            {this.state.result}
                                            {this.state.errors.length > 0 && (
                                                <AlertBlock type={"error"} messages={this.state.errors}/>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/*<CompanyProfileForm*/}
                                {/*    data={null}*/}
                                {/*    action={'add'}*/}
                                {/*    isAdmin={true}*/}
                                {/*    onCallback={() => console.log('123')}*/}
                                {/*    symbolData={null}*/}
                                {/*/>*/}
                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default AIToolsAssetProfileBlock
