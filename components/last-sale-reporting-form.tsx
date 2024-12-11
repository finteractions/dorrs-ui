import React, {RefObject} from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {ILastSale} from "@/interfaces/i-last-sale";
import lastSaleService from "@/services/last-sale/last-sale-service";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {TickIndication} from "@/enums/tick-indication";
import {Condition} from "@/enums/condition";
import NumericInputField from "@/components/numeric-input-field";
import Select from "react-select";
import {SingleDatePicker} from "react-dates";
import moment from "moment";
import {FormStatus, getApprovedFormStatus} from "@/enums/form-status";
import ModalLastSaleReportingHistoryBlock from "@/components/modal-last-sale-reporting-history-block";
import InputMPIDField from "@/components/mpid-field";
import converterService from "@/services/converter/converter-service";
import {getGlobalConfig} from "@/utils/global-config";
import {faBroom} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import formatterService from "@/services/formatter/formatter-service";
import formValidator from "@/services/form-validator/form-validator";
import AssetImage from "@/components/asset-image";


const formSchema = Yup.object().shape({
    origin: Yup.string().min(3).max(8).required('Required').label('Origin'),
    symbol: Yup.string().required('Required').label('Symbol'),
    symbol_suffix: Yup.string().min(2).max(3).label('Symbol suffix'),
    condition: Yup.string().required('Required').label('Condition'),
    mpid: Yup.string().min(3).max(12).required('Required').label('MPID'),
    tick_indication: Yup.string().required('Required').label('Tick Indication'),
    quantity: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid price').min(0).required('Required').label('Quantity'),
    price: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).min(0).required('Required').label('Price'),
    time: Yup.string().required('Required').label('Time'),
    date: Yup.string().required('Required').label('Date'),
});

interface LastSaleReportingState extends IState {
    formInitialValues: {};
    isLoadingForm: boolean;
    isLoadingHistory: boolean;
    isLoading: boolean;
    focusedInput: any;
}

interface LastSaleReportingProps extends ICallback {
    action: string;
    data: ILastSale | null;
    onCancel: () => void;
    isClose: boolean;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const PATH = `${getGlobalConfig().host}-last-sale-reporting-form`;

class LastSaleReportingForm extends React.Component<LastSaleReportingProps, LastSaleReportingState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: LastSaleReportingState;
    formRef: RefObject<any>;
    host: string = '';

    constructor(props: LastSaleReportingProps) {
        super(props);

        this.formRef = React.createRef();

        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
        const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
        const initialTime = `${currentHour}:${currentMinute}`;
        const initialDate = moment().format('YYYY-MM-DD').toString();

        const initialData = this.props.data || {} as ILastSale;

        const initialValues: {
            origin: string;
            symbol: string;
            symbol_suffix: string;
            condition: string;
            mpid: string;
            tick_indication: string;
            quantity: string;
            price: string;
            time: string;
            date: string;
            uti: string;
        } = {
            origin: initialData?.origin || '',
            symbol: initialData?.symbol_name || '',
            symbol_suffix: initialData?.symbol_suffix || '',
            condition: (initialData?.condition || '').toLowerCase(),
            mpid: initialData?.mpid || '',
            tick_indication: initialData?.tick_indication || '',
            quantity: (initialData?.quantity || '').toString(),
            price: (initialData?.price || '').toString(),
            time: (initialData?.time || initialTime).toString(),
            date: (initialData?.date || initialDate).toString(),
            uti: initialData?.uti || '',
        };


        this.state = {
            success: false,
            formInitialValues: initialValues,
            isLoadingForm: true,
            isLoadingHistory: true,
            isLoading: true,
            focusedInput: null,
        };

    }

    restoreForm = async () => {
        let storedData: any = localStorage.getItem(PATH);

        if (storedData) {
            try {
                storedData = JSON.parse(storedData) as ILastSale
                await this.fillForm(storedData)
            } catch (ignored) {
            }
        }
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];

                this.symbols = data.filter(s => getApprovedFormStatus().includes(s.status.toLowerCase() as FormStatus));
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                !this.isAdd()
                    ?
                    this.setState({isLoadingForm: false, isLoadingHistory: false, isLoading: false})
                    :
                    this.setState({isLoadingForm: false}, () => this.setLoading());
            });
    }

    setLoading = () => {
        this.setState({isLoading: !(!this.state.isLoadingForm && !this.state.isLoadingHistory)}, async () => {
            if (!this.state.isLoading) {
                await this.restoreForm();
            }
        })
    }

    handleSymbolSuffix(value: any, values: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
        const alphanumericValue = value.slice(0, 3).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setFieldValue('symbol_suffix', alphanumericValue);
    }

    handleSubmit = async (values: ILastSale, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        let data = {...values};
        data = formValidator.castFormValues(data, formSchema);

        const request: Promise<any> = this.props.action == 'edit' ?
            lastSaleService.updateLastSaleReporting(data, this.props.data?.id || 0) :
            lastSaleService.createLastSaleReporting(data);

        await request
            .then(((res: any) => {
                this.props.onCallback(res[0], this.isAdd());
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                localStorage.removeItem(PATH)
            });
    };

    isShow(): boolean {
        return this.props.action === 'view';
    }

    isAdd(): boolean {
        return ['add', 'edit'].includes(this.props.action);
    }

    isEdit(): boolean {
        return ['edit'].includes(this.props.action);
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
        this.getSymbols();
    }

    onCallback = () => {
        this.setState({isLoadingHistory: false}, () => {
            this.setLoading();
        })
    }

    fillForm = async (lastSale: ILastSale) => {
        if (this.formRef?.current) {
            const {setFieldValue, setFieldTouched} = this.formRef.current;

            await Promise.all([
                setFieldValue('symbol', lastSale.symbol_name || lastSale.symbol, true),
                setFieldValue('symbol_suffix', lastSale.symbol_suffix ?? '', true),
                setFieldValue('condition', lastSale.condition.toLowerCase(), true),
                setFieldValue('tick_indication', lastSale.tick_indication, true),
                setFieldValue('quantity', lastSale.quantity ?? '', true),
                setFieldValue('price', lastSale.price ?? '', true),
                setFieldValue('mpid', lastSale.mpid, true),
                setFieldValue('origin', lastSale.origin, true),
            ]);

            await Promise.all([
                setFieldTouched('symbol', true, true),
                setFieldTouched('symbol_suffix', true, true),
                setFieldTouched('condition', true, true),
                setFieldTouched('tick_indication', true, true),
                setFieldTouched('quantity', true, true),
                setFieldTouched('price', true, true),
                setFieldTouched('mpid', true, true),
                setFieldTouched('origin', true, true),
            ]);
        }
    }

    clear = () => {
        if (this.formRef?.current) {
            this.formRef?.current.resetForm()
        }
    }

    save = (save: boolean = false) => {

        if (save) {
            const values = this.formRef.current?.values;
            const keys = this.formRef.current?.touched || {}

            if (Object.keys(keys).length > 0 && values) {
                let data = {...values};
                data = formValidator.castFormValues(data, formSchema)
                localStorage.setItem(PATH, JSON.stringify(data))
            }
        } else {
            localStorage.removeItem(PATH)
        }

        this.props.onCancel();

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
                                {item.company_profile?.company_name || item.security_name} ({item.symbol})
                            </div>
                        </div>
                    </div>
                </div>
            ),
        }
    );


    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
            case 'view':
                return (
                    <>
                        {this.state.isLoading && (
                            <LoaderBlock/>
                        )}
                        <div className={`column-block ${this.state.isLoading || this.props.isClose ? 'd-none' : ''}`}>
                            <div className={'column-block__item'}>
                                {!this.state.isLoadingForm && (
                                    <Formik<ILastSale>
                                        initialValues={this.state.formInitialValues as ILastSale}
                                        validationSchema={formSchema}
                                        onSubmit={this.handleSubmit}
                                        innerRef={this.formRef}
                                    >
                                        {({
                                              isSubmitting,
                                              setFieldValue,
                                              isValid,
                                              dirty,
                                              values,
                                              errors,
                                              touched,
                                              setTouched
                                          }) => {
                                            const symbol = this.symbols.find(s => s.symbol === values.symbol);
                                            formValidator.requiredFields(formSchema, values, errors);
                                            return (
                                                <Form className={'w-100'}>
                                                    <div className="input">
                                                        {!this.isShow() && (
                                                            <div className="d-flex justify-content-end input__btns ">
                                                                <button
                                                                    onClick={this.clear}
                                                                    type="button"
                                                                    title={'Clear form'}
                                                                    className={'border-grey-btn ripple'}>
                                                                    <FontAwesomeIcon className="nav-icon"
                                                                                     icon={faBroom}/>
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="input__title">Origin <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="origin"
                                                                id="origin"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Origin"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="origin" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Symbol <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="symbol_tmp"
                                                                id="symbol_tmp"
                                                                as={Select}
                                                                className="b-select-search"
                                                                placeholder="Select Symbol"
                                                                classNamePrefix="select__react"
                                                                isDisabled={isSubmitting || this.isShow()}
                                                                options={Object.values(this.symbols).map((item) => (this.renderOption(item)))}
                                                                onChange={(selectedOption: any) => {
                                                                    setFieldValue('symbol', selectedOption.value);
                                                                }}
                                                                value={
                                                                    Object.values(this.symbols).filter(i => i.symbol === values.symbol).map((item) => ({
                                                                        value: item.symbol,
                                                                        label: `${item.company_profile?.company_name || ''} ${item.symbol}`,
                                                                    }))?.[0] || null
                                                                }
                                                                filterOption={(option: any, rawInput: any) => {
                                                                    const input = rawInput.toLowerCase();
                                                                    const currentItem = this.symbols.find(i => i.symbol === option.value);
                                                                    const securityName = currentItem?.security_name.toLowerCase() || '';
                                                                    const companyName = currentItem?.company_profile?.company_name.toLowerCase() || '';
                                                                    const symbol = option.value.toLowerCase();

                                                                    return (
                                                                        symbol.includes(input) ||
                                                                        securityName.includes(input) ||
                                                                        companyName.includes(input)
                                                                    );
                                                                }}
                                                            />
                                                            <Field type="hidden" name="symbol" id="symbol"/>
                                                            <ErrorMessage name="symbol" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Symbol Suffix</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="symbol_suffix"
                                                                id="symbol_suffix"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Symbol Suffix"
                                                                disabled={isSubmitting || this.isShow()}
                                                                onChange={(e: any) => this.handleSymbolSuffix(e.target.value, values, setFieldValue)}
                                                            />
                                                            <ErrorMessage name="symbol_suffix" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Condition <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="condition"
                                                                id="condition"
                                                                as="select"
                                                                className="b-select"
                                                                disabled={isSubmitting || this.isShow()}
                                                            >
                                                                <option value="">Select Condition</option>
                                                                {Object.keys(Condition).map((item) => (
                                                                    <option key={item} value={item}>
                                                                        {Condition[item as keyof typeof Condition]}
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="condition" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">MPID <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="mpid"
                                                                id="mpid"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type MPID"
                                                                disabled={isSubmitting || this.isShow()}
                                                                component={InputMPIDField}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Quantity <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="quantity"
                                                                id="quantity"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Quantity"
                                                                disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                component={NumericInputField}
                                                                decimalScale={converterService.getDecimals(symbol?.fractional_lot_size)}
                                                            />
                                                            <ErrorMessage name="quantity" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Price <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="price"
                                                                id="price"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Price"
                                                                disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                component={NumericInputField}
                                                                decimalScale={decimalPlaces}
                                                            />
                                                            <ErrorMessage name="price" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input__group">
                                                        <div className="input">
                                                            <div className="input__title">Date <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <SingleDatePicker
                                                                    numberOfMonths={1}
                                                                    renderMonthElement={formatterService.renderMonthElement}
                                                                    date={values.date ? moment(values.date) : moment()}
                                                                    onDateChange={date => setFieldValue('date', date?.format('YYYY-MM-DD').toString())}
                                                                    focused={this.state.focusedInput}
                                                                    onFocusChange={({focused}) => this.setState({focusedInput: focused})}
                                                                    id="date"
                                                                    displayFormat="YYYY-MM-DD"
                                                                    isOutsideRange={() => false}
                                                                    disabled={isSubmitting || this.isShow()}
                                                                    readOnly={true}
                                                                    placeholder={'Select Date'}
                                                                />
                                                                <ErrorMessage name="date" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>


                                                        <div className="input">
                                                            <div className="input__title">Time <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="time"
                                                                    id="time"
                                                                    type="time"
                                                                    placeholder="Type Time"
                                                                    className="input__text"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                />
                                                                <ErrorMessage name="time" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Tick Indication <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="tick_indication"
                                                                id="tick_indication"
                                                                as="select"
                                                                className="b-select"
                                                                disabled={isSubmitting || this.isShow()}
                                                            >
                                                                <option value="">Select Tick Indication</option>
                                                                {Object.keys(TickIndication).map((item) => (
                                                                    <option key={item} value={item}>
                                                                        {TickIndication[item as keyof typeof TickIndication]} ({item})
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="tick_indication" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Universal Transaction ID (UTI)
                                                        </div>
                                                        <div
                                                            className={`input__wrap text-center`}>
                                                            <Field
                                                                name="uti"
                                                                id="uti"
                                                                type="text"
                                                                className="input__text uti"
                                                                disabled={true}
                                                            />
                                                            <ErrorMessage name="uti" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>


                                                    {this.props.action !== 'view' && (
                                                        <button
                                                            className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                            Save Sale Report
                                                        </button>
                                                    )}

                                                    {this.state.errorMessages && (
                                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                    )}
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                )}
                            </div>


                            {this.isAdd() && (
                                <div className={'column-block__item'}>
                                    <ModalLastSaleReportingHistoryBlock
                                        pageLength={20}
                                        onCallback={this.onCallback}
                                        onSelected={this.fillForm}
                                    />
                                </div>
                            )}
                        </div>

                        {this.props.isClose && (
                            <>
                                <div className={'input'}>You have unsaved changes</div>
                                <div
                                    className={'profile__right-wrap-full'}>
                                    <div className={'profile__panel'}>
                                        <div className={'profile__info__panel'}>
                                            <div className={'input__box buttons'}>
                                                <button
                                                    className={'b-btn ripple'}
                                                    type={'button'}
                                                    onClick={() => this.save(true)}

                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className={'border-btn ripple modal-link'}
                                                    type={'button'}
                                                    onClick={() => this.save(false)}
                                                >
                                                    Discard changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>
                        )}

                    </>
                )
        }


    }
}

export default LastSaleReportingForm;
