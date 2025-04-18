import React, {RefObject} from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import bboSaleService from "@/services/bbo/best-bid-and-best-offer-service";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import NumericInputField from "@/components/numeric-input-field";
import Select from "react-select";
import {SingleDatePicker} from "react-dates";
import moment from "moment";
import {
    getBidQuoteCondition,
    getOfferQuoteCondition,
    getQuoteConditionDescriptions,
    QuoteCondition
} from "@/enums/quote-condition";
import {FormStatus, getApprovedFormStatus} from "@/enums/form-status";
import ModalBestBidAndBestOfferHistoryBlock from "@/components/modal-best-bid-and-best-offer-history-block";
import InputMPIDField from "@/components/mpid-field";
import converterService from "@/services/converter/converter-service";
import {getGlobalConfig} from "@/utils/global-config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBroom} from "@fortawesome/free-solid-svg-icons";
import formatterService from "@/services/formatter/formatter-service";
import formValidator from "@/services/form-validator/form-validator";
import AssetImage from "@/components/asset-image";


const formSchema = Yup.object().shape({
    origin: Yup.string().min(3).max(8).required('Required'),
    symbol: Yup.string().required('Required'),
    quote_condition: Yup.string().required('Required'),

    bid_mpid: Yup.string().min(3).max(12).label('Bid MPID')
        .when('quote_condition', {
            is: (v: string) => getBidQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    bid_quantity: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Bid Qty').min(0)
        .when('quote_condition', {
            is: (v: string) => getBidQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    bid_price: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Bid Price').min(0).label('Bid price')
        .when('quote_condition', {
            is: (v: string) => getBidQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    bid_date: Yup.string().label('Bid Date')
        .when('quote_condition', {
            is: (v: string) => getBidQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    bid_time: Yup.string().label('Bid Time')
        .when('quote_condition', {
            is: (v: string) => getBidQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),

    offer_mpid: Yup.string().min(3).max(12).label('Offer MPID')
        .when('quote_condition', {
            is: (v: string) => getOfferQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    offer_quantity: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Offer Qty').min(0)
        .when('quote_condition', {
            is: (v: string) => getOfferQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    offer_price: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Offer Price').min(0)
        .when('quote_condition', {
            is: (v: string) => getOfferQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    offer_date: Yup.string()
        .when('quote_condition', {
            is: (v: string) => getOfferQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
    offer_time: Yup.string()
        .when('quote_condition', {
            is: (v: string) => getOfferQuoteCondition().includes((v || '').toUpperCase() as QuoteCondition),
            then: (schema) => schema.required('Required')
        }),
});

interface BestBidAndBestOfferFormState extends IState {
    formInitialValues: {};
    isLoadingForm: boolean;
    isLoadingHistory: boolean;
    isLoading: boolean;
    focusedInputBidDate: any;
    focusedInputOfferDate: any;
}

interface BestBidAndBestOfferFormProps extends ICallback {
    action: string;
    data: IBestBidAndBestOffer | null;
    onCancel: () => void;
    isClose: boolean;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const PATH = `${getGlobalConfig().host}-best-bid-and-best-offer-form`;
const dateFormat = process.env.FORMAT_DATE || 'YYYY-MM-DD'

class BestBidAndBestOfferForm extends React.Component<BestBidAndBestOfferFormProps, BestBidAndBestOfferFormState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: BestBidAndBestOfferFormState;
    formRef: RefObject<any>;
    host: string = '';

    constructor(props: BestBidAndBestOfferFormProps) {
        super(props);

        this.formRef = React.createRef();

        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
        const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
        const initialTime = `${currentHour}:${currentMinute}`;
        const initialDate = moment().format('YYYY-MM-DD').toString();

        const initialData = this.props.data || {} as IBestBidAndBestOffer;

        const initialValues: {
            origin: string;
            symbol: string;
            quote_condition: string;
            bid_mpid: string;
            bid_quantity: string;
            bid_price: string;
            bid_date: string;
            bid_time: string;
            offer_mpid: string;
            offer_quantity: string;
            offer_price: string;
            offer_date: string;
            offer_time: string;
            uti: string;
        } = {
            origin: initialData?.origin || '',
            symbol: initialData?.symbol_name || '',
            quote_condition: (initialData?.quote_condition || QuoteCondition.c).toLowerCase(),
            bid_mpid: initialData?.bid_mpid || '',
            bid_quantity: (initialData?.bid_quantity || '').toString(),
            bid_price: (initialData?.bid_price || '').toString(),
            bid_date: getBidQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.bid_date || initialDate) : '',
            bid_time: getBidQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.bid_time || initialTime) : '',
            offer_mpid: initialData?.offer_mpid || '',
            offer_quantity: (initialData?.offer_quantity || '').toString(),
            offer_price: (initialData?.offer_price || '').toString(),
            offer_date: getOfferQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.offer_date || initialDate) : '',
            offer_time: getOfferQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.offer_time || initialTime) : '',
            uti: initialData?.uti || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            isLoadingForm: true,
            isLoadingHistory: true,
            isLoading: true,
            focusedInputBidDate: null,
            focusedInputOfferDate: null,
        };
    }

    restoreForm = async () => {
        let storedData: any = localStorage.getItem(PATH);

        if (storedData) {
            try {
                storedData = JSON.parse(storedData) as IBestBidAndBestOffer
                await this.fillForm(storedData)
            } catch (ignored) {
            }
        }
        await this.formRef.current.setFieldTouched('quote_condition', false, true)
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];
                data = data.filter(s => getApprovedFormStatus().includes(s.status.toLowerCase() as FormStatus))

                this.symbols = data;
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                !this.isAdd()
                    ?
                    this.setState({isLoadingForm: false, isLoadingHistory: false, isLoading: false}, () => {
                    })
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

    handleSubmit = async (values: IBestBidAndBestOffer, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        let data = {...values};
        data = formValidator.castFormValues(data, formSchema);

        const request: Promise<any> = this.props.action == 'edit' ?
            bboSaleService.updateBestBidAndBestOffer(data, this.props.data?.id || 0) :
            bboSaleService.createBestBidAndBestOffer(data);

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

    handleQuoteConditionChange = async (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedQuoteCondition = e.target.value;
        await setFieldValue("quote_condition", selectedQuoteCondition, true);
        await setFieldValue("bid_quantity", '', true);
        await setFieldValue("bid_price", '', true);
        await setFieldValue("bid_date", '', true);
        await setFieldValue("bid_time", '', true);
        await setFieldValue("offer_quantity", '', true);
        await setFieldValue("offer_price", '', true);
        await setFieldValue("offer_date", '', true);
        await setFieldValue("offer_time", '', true);
        await setFieldValue("bid_mpid", '', false);
        await setFieldValue("offer_mpid", '', false);

        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
        const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
        const initialTime = `${currentHour}:${currentMinute}`;

        const initialDate = moment().format('YYYY-MM-DD').toString();

        if (getBidQuoteCondition().includes(selectedQuoteCondition.toUpperCase() as QuoteCondition)) {
            await setFieldValue("bid_date", initialDate, true);
            await setFieldValue("bid_time", initialTime, true);
        }
        if (getOfferQuoteCondition().includes(selectedQuoteCondition.toUpperCase() as QuoteCondition)) {
            await setFieldValue("offer_date", initialDate, true);
            await setFieldValue("offer_time", initialTime, true);
        }
    };

    onCallback = () => {
        this.setState({isLoadingHistory: false}, () => {
            this.setLoading();
        })
    }


    fillForm = async (bestBidAndBestOffer: IBestBidAndBestOffer) => {
        if (this.formRef?.current) {
            const {setFieldValue, setFieldTouched} = this.formRef.current;

            await Promise.all([
                setFieldValue('symbol', bestBidAndBestOffer.symbol_name || bestBidAndBestOffer.symbol),
                setFieldValue('quote_condition', bestBidAndBestOffer.quote_condition.toLowerCase()),
                setFieldValue('bid_quantity', bestBidAndBestOffer.bid_quantity ?? ''),
                setFieldValue('bid_price', bestBidAndBestOffer.bid_price ?? ''),
                setFieldValue('offer_quantity', bestBidAndBestOffer.offer_quantity ?? ''),
                setFieldValue('offer_price', bestBidAndBestOffer.offer_price ?? ''),
                setFieldValue('bid_mpid', bestBidAndBestOffer.bid_mpid),
                setFieldValue('offer_mpid', bestBidAndBestOffer.offer_mpid),
                setFieldValue('origin', bestBidAndBestOffer.origin),
            ]);
            await Promise.all([
                setFieldTouched('symbol', true, true),
                setFieldTouched('quote_condition', true, true),
                setFieldTouched('bid_quantity', true, true),
                setFieldTouched('bid_price', true, true),
                setFieldTouched('offer_quantity', true, true),
                setFieldTouched('offer_price', true, true),
                setFieldTouched('bid_mpid', true, true),
                setFieldTouched('offer_mpid', true, true),
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
                                    <Formik<IBestBidAndBestOffer>
                                        initialValues={this.state.formInitialValues as IBestBidAndBestOffer}
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
                                              setFieldTouched
                                          }) => {
                                            const symbol = this.symbols.find(s => s.symbol === values.symbol);

                                            formValidator.requiredFields(formSchema, values, errors);

                                            return (
                                                <Form className={`quote_condition_${values.quote_condition} w-100`}>
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
                                                        <div className="input__title">Quote Condition <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="quote_condition"
                                                                id="quote_condition"
                                                                as="select"
                                                                className="b-select"
                                                                disabled={isSubmitting || this.isShow()}
                                                                onChange={(e: any) => this.handleQuoteConditionChange(e, setFieldValue)}
                                                            >
                                                                {Object.keys(QuoteCondition).map((item) => (
                                                                    <option key={item} value={item}>
                                                                        {QuoteCondition[item as keyof typeof QuoteCondition]}
                                                                        {item ? ` (${getQuoteConditionDescriptions(QuoteCondition[item as keyof typeof QuoteCondition])})` : ''}
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="quote_condition" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    {getBidQuoteCondition().includes(values.quote_condition.toUpperCase() as QuoteCondition) && (
                                                        <>
                                                            <div className="input">
                                                                <div className="input__title">Bid MPID <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="bid_mpid"
                                                                        id="bid_mpid"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Bid MPID"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                        keyName={'mpid'}
                                                                        component={InputMPIDField}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Bid Qty <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="bid_quantity"
                                                                        id="bid_quantity"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Bid Qty"
                                                                        disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                        component={NumericInputField}
                                                                        decimalScale={converterService.getDecimals(symbol?.fractional_lot_size)}
                                                                    />
                                                                    <ErrorMessage name="bid_quantity" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>
                                                            <div className="input">
                                                                <div className="input__title">Bid Price <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="bid_price"
                                                                        id="bid_price"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Bid Price"
                                                                        disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                        component={NumericInputField}
                                                                        decimalScale={decimalPlaces}
                                                                    />
                                                                    <ErrorMessage name="bid_price" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>
                                                            <div className="input__group">
                                                                <div className="input">
                                                                    <div className="input__title">Bid Date <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <SingleDatePicker
                                                                            numberOfMonths={1}
                                                                            renderMonthElement={formatterService.renderMonthElement}
                                                                            date={values.bid_date ? moment(values.bid_date) : moment()}
                                                                            onDateChange={date => setFieldValue('bid_date', date?.format('YYYY-MM-DD').toString())}
                                                                            focused={this.state.focusedInputBidDate}
                                                                            onFocusChange={({focused}) => this.setState({focusedInputBidDate: focused})}
                                                                            id="bid_date"
                                                                            displayFormat={dateFormat}
                                                                            isOutsideRange={() => false}
                                                                            disabled={isSubmitting || this.isShow()}
                                                                            readOnly={true}
                                                                            placeholder={'Select Bid Date'}
                                                                        />
                                                                        <ErrorMessage name="bid_date" component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input">
                                                                    <div className="input__title">Bid Time <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="bid_time"
                                                                            id="bid_time"
                                                                            type="time"
                                                                            placeholder="Type Bid Time"
                                                                            className="input__text"
                                                                            disabled={isSubmitting || this.isShow()}
                                                                        />
                                                                        <ErrorMessage name="bid_time" component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {getOfferQuoteCondition().includes(values.quote_condition.toUpperCase() as QuoteCondition) && (
                                                        <>
                                                            <div className="input">
                                                                <div className="input__title">Offer MPID <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="offer_mpid"
                                                                        id="offer_mpid"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Offer  MPID"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                        keyName={'mpid'}
                                                                        component={InputMPIDField}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="input">
                                                                <div className="input__title">Offer Qty <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="offer_quantity"
                                                                        id="offer_quantity"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Offer Qty"
                                                                        disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                        component={NumericInputField}
                                                                        decimalScale={converterService.getDecimals(symbol?.fractional_lot_size)}
                                                                    />
                                                                    <ErrorMessage name="offer_quantity" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>
                                                            <div className="input">
                                                                <div className="input__title">Offer Price <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.isEdit()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="offer_price"
                                                                        id="offer_price"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Offer Price"
                                                                        disabled={isSubmitting || this.isShow() || this.isEdit()}
                                                                        component={NumericInputField}
                                                                        decimalScale={decimalPlaces}
                                                                    />
                                                                    <ErrorMessage name="offer_price" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>


                                                            <div className="input__group">
                                                                <div className="input">
                                                                    <div className="input__title">Offer Date <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <SingleDatePicker
                                                                            numberOfMonths={1}
                                                                            renderMonthElement={formatterService.renderMonthElement}
                                                                            date={values.offer_date ? moment(values.offer_date) : moment()}
                                                                            onDateChange={date => setFieldValue('offer_date', date?.format('YYYY-MM-DD').toString())}
                                                                            focused={this.state.focusedInputOfferDate}
                                                                            onFocusChange={({focused}) => this.setState({focusedInputOfferDate: focused})}
                                                                            id="offer_date"
                                                                            displayFormat={dateFormat}
                                                                            isOutsideRange={() => false}
                                                                            disabled={isSubmitting || this.isShow()}
                                                                            readOnly={true}
                                                                            placeholder={'Select Offer Date'}
                                                                        />
                                                                        <ErrorMessage name="offer_date" component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>


                                                                <div className="input">
                                                                    <div className="input__title">Offer Time <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="offer_time"
                                                                            id="offer_time"
                                                                            type="time"
                                                                            placeholder="Type Offer Time"
                                                                            className="input__text"
                                                                            disabled={isSubmitting || this.isShow()}
                                                                        />
                                                                        <ErrorMessage name="offer_time" component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}


                                                    {values.quote_condition !== '' && (
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
                                                    )}

                                                    {this.props.action !== 'view' && (
                                                        <button
                                                            className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                            Save BBO
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
                                    <ModalBestBidAndBestOfferHistoryBlock
                                        pageLength={28}
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

export default BestBidAndBestOfferForm;
