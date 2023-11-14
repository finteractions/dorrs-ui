import React from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {IBBO} from "@/interfaces/i-bbo";
import bboSaleService from "@/services/bbo/bbo-service";
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


const formSchema = Yup.object().shape({
    origin: Yup.string().min(3).max(4).required('Required'),
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

interface BBOState extends IState {
    formInitialValues: {};
    loading: boolean;
    focusedInputBid: any;
    focusedInputOffer: any;
}

interface BBOProps extends ICallback {
    action: string;
    data: IBBO | null;
    onCancel?: () => void;
}

class BBOForm extends React.Component<BBOProps, BBOState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: BBOState;

    constructor(props: BBOProps) {
        super(props);

        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
        const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
        const initialTime = `${currentHour}:${currentMinute}`;

        const initialData = this.props.data || {} as IBBO;

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
            bid_date: (initialData?.bid_date || '').toString(),
            bid_time: getBidQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.bid_time || initialTime) : '',
            offer_mpid: initialData?.offer_mpid || '',
            offer_quantity: (initialData?.offer_quantity || '').toString(),
            offer_price: (initialData?.offer_price || '').toString(),
            offer_date: (initialData?.offer_date || '').toString(),
            offer_time: getOfferQuoteCondition().includes((initialData?.quote_condition || QuoteCondition.c).toUpperCase() as QuoteCondition) ? (initialData?.offer_time || initialTime) : '',
            uti: initialData?.uti || '',
        };


        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: true,
            focusedInputBid: null,
            focusedInputOffer: null,
        };
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                const data: ISymbol[] = res?.sort((a, b) => {
                    return a.symbol.localeCompare(b.symbol);
                }).filter(s => getApprovedFormStatus().includes(s.status.toLowerCase() as FormStatus)) || [];

                this.symbols = data;
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });


    }

    handleSubmit = async (values: IBBO, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        let data = values;

        data.bid_quantity = data.bid_quantity.replace(/,/g, '');
        data.bid_price = data.bid_price.replace(/,/g, '');
        data.offer_quantity = data.offer_quantity.replace(/,/g, '');
        data.offer_price = data.offer_price.replace(/,/g, '');

        const request: Promise<any> = this.props.action == 'edit' ?
            bboSaleService.updateBBO(values, this.props.data?.id || 0) :
            bboSaleService.createBBO(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(res[0], this.isAdd());
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    isShow(): boolean {
        return this.props.action === 'view';
    }

    isAdd(): boolean {
        return this.props.action === 'add';
    }

    componentDidMount() {
        this.getSymbols();
    }

    handleQuoteConditionChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedQuoteCondition = e.target.value;
        setFieldValue("quote_condition", selectedQuoteCondition);
        setFieldValue("bid_quantity", '');
        setFieldValue("bid_price", '');
        setFieldValue("bid_date", '');
        setFieldValue("bid_time", '');
        setFieldValue("offer_quantity", '');
        setFieldValue("offer_price", '');
        setFieldValue("offer_date", '');
        setFieldValue("offer_time", '');

        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
        const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
        const initialTime = `${currentHour}:${currentMinute}`;

        if (getBidQuoteCondition().includes(selectedQuoteCondition.toUpperCase() as QuoteCondition)) setFieldValue("bid_time", initialTime);
        if (getOfferQuoteCondition().includes(selectedQuoteCondition.toUpperCase() as QuoteCondition)) setFieldValue("offer_time", initialTime);
    };

    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
            case 'view':
                return (
                    <>
                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<IBBO>
                                    initialValues={this.state.formInitialValues as IBBO}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
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
                                        return (
                                            <Form className={`quote_condition_${values.quote_condition}`}>
                                                <div className="input">
                                                    <div className="input__title">Origin <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="origin"
                                                            id="origin"
                                                            type="text"
                                                            placeholder="Type Origin"
                                                            className="input__text"
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
                                                            options={Object.values(this.symbols).map((item) => ({
                                                                value: item.symbol,
                                                                label: `${item.company_profile?.company_name || ''} ${item.symbol}`,
                                                            }))}
                                                            onChange={(selectedOption: any) => {
                                                                setFieldValue('symbol', selectedOption.value);
                                                            }}
                                                            value={
                                                                Object.values(this.symbols).filter(i => i.symbol === values.symbol).map((item) => ({
                                                                    value: item.symbol,
                                                                    label: `${item.company_profile?.company_name || ''} ${item.symbol}`,
                                                                }))?.[0] || null
                                                            }
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
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="bid_mpid" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>

                                                        <div className="input">
                                                            <div className="input__title">Bid Qty <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="bid_quantity"
                                                                    id="bid_quantity"
                                                                    type="text"
                                                                    className="input__text"
                                                                    placeholder="Type Bid Qty"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                    component={NumericInputField}
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="bid_quantity" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                        <div className="input">
                                                            <div className="input__title">Bid Price <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="bid_price"
                                                                    id="bid_price"
                                                                    type="text"
                                                                    className="input__text"
                                                                    placeholder="Type Bid Price"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                    component={NumericInputField}
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="bid_price" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                        <div className="input__group">
                                                            <div className="input">
                                                                <div className="input__title">Bid Date <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <SingleDatePicker
                                                                        numberOfMonths={1}
                                                                        date={values.bid_date ? moment(values.bid_date) : null}
                                                                        onDateChange={date => setFieldValue('bid_date', date?.format('YYYY-MM-DD').toString())}
                                                                        focused={this.state.focusedInputBid}
                                                                        onFocusChange={({focused}) => this.setState({focusedInputBid: focused})}
                                                                        id="bid_date"
                                                                        displayFormat="YYYY-MM-DD"
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
                                                                <div className="input__title">Bid Time <i>*</i></div>
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
                                                                    <ErrorMessage name="bid_date" component="div"
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
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="offer_mpid" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                        <div className="input">
                                                            <div className="input__title">Offer Qty <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="offer_quantity"
                                                                    id="offer_quantity"
                                                                    type="text"
                                                                    className="input__text"
                                                                    placeholder="Type Offer Qty"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                    component={NumericInputField}
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="offer_quantity" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                        <div className="input">
                                                            <div className="input__title">Offer Price <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="offer_price"
                                                                    id="offer_price"
                                                                    type="text"
                                                                    className="input__text"
                                                                    placeholder="Type Offer Price"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                    component={NumericInputField}
                                                                    decimalScale={2}
                                                                />
                                                                <ErrorMessage name="offer_price" component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>


                                                        <div className="input__group">
                                                            <div className="input">
                                                                <div className="input__title">Offer Date <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <SingleDatePicker
                                                                        numberOfMonths={1}
                                                                        date={values.offer_date ? moment(values.offer_date) : null}
                                                                        onDateChange={date => setFieldValue('offer_date', date?.format('YYYY-MM-DD').toString())}
                                                                        focused={this.state.focusedInputOffer}
                                                                        onFocusChange={({focused}) => this.setState({focusedInputOffer: focused})}
                                                                        id="offer_date"
                                                                        displayFormat="YYYY-MM-DD"
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
                                                                <div className="input__title">Offer Time <i>*</i></div>
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
                            </>
                        )}
                    </>
                )
        }


    }
}

export default BBOForm;
