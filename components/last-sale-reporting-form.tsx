import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
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


const formSchema = Yup.object().shape({
    origin: Yup.string().min(3).max(4).required('Required'),
    symbol: Yup.string().required('Required'),
    condition:Yup.string().required('Required'),
    tick_indication: Yup.string().required('Required'),
    quantity: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid price').min(0).required('Required'),
    price: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).min(0).required('Required'),
    time: Yup.string().required('Required').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time. Example: 23:59:59'),
    date: Yup.string().required('Required'),
});

interface LastSaleReportState extends IState {
    formInitialValues: {};
    loading: boolean;
    focusedInput: any;
}

interface LastSaleReportProps extends ICallback {
    action: string;
    data: ILastSale | null;
    onCancel?: () => void;
}

class LastSaleReportForm extends React.Component<LastSaleReportProps, LastSaleReportState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: LastSaleReportState;

    constructor(props: LastSaleReportProps) {
        super(props);

        const initialData = this.props.data || {} as ILastSale;

        const initialValues: {
            origin: string;
            symbol: string;
            condition: string;
            tick_indication: string;
            quantity: string;
            price: string;
            time: string;
            date: string;
            uti: string;
        } = {
            origin: initialData?.origin || '',
            symbol: initialData?.symbol_name || '',
            condition: (initialData?.condition || '').toLowerCase(),
            tick_indication: initialData?.tick_indication || '',
            quantity: (initialData?.quantity || '').toString(),
            price: (initialData?.price || '').toString(),
            time: (initialData?.time || '').toString(),
            date: (initialData?.date || '').toString(),
            uti: initialData?.uti || '',
        };


        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: true,
            focusedInput: null,
        };
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                const data: ISymbol[] = res?.sort((a, b) => {
                    return a.symbol.localeCompare(b.symbol);
                }).filter(s => s.status.toLowerCase() === 'approved') || [];

                this.symbols = data;
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });


    }

    handleSubmit = async (values: ILastSale, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        let data = values;

        data.quantity = data.quantity.replace(/,/g, '');
        data.price = data.price.replace(/,/g, '');
        // data.date = moment(values.date).format('YYYY-MM-DD');

        const request: Promise<any> = this.props.action == 'edit' ?
            lastSaleService.updateLastSaleReport(values, this.props.data?.id || 0) :
            lastSaleService.createLastSaleReport(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(res[0], this.isAdd()) ;
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
                                <Formik<ILastSale>
                                    initialValues={this.state.formInitialValues as ILastSale}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({isSubmitting, setFieldValue, isValid, dirty, values, errors, touched, setTouched}) => {
                                        return (
                                            <Form>
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
                                                            as={Select} // Use the react-select component here
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
                                                    <div className="input__title">Quantity <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="quantity"
                                                            id="quantity"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Quantity"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={2}
                                                        />
                                                        <ErrorMessage name="quantity" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Price <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="price"
                                                            id="price"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Price"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={2}
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
                                                            date={values.date ? moment(values.date) : null}
                                                            onDateChange={date => setFieldValue('date', date?.format('YYYY-MM-DD').toString())}
                                                            focused={this.state.focusedInput}
                                                            onFocusChange={({ focused }) => this.setState({ focusedInput: focused })}
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
                                                            type="text"
                                                            placeholder="Type Time"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="time" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                </div>

                                                {/*<div className="input">*/}
                                                {/*    <div className="input__title">Date <i>*</i></div>*/}
                                                {/*    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>*/}
                                                {/*        <SingleDatePicker*/}
                                                {/*            date={values.date}*/}
                                                {/*            onDateChange={(date) => setFieldValue('date', date)}*/}
                                                {/*            focused={this.state.focusedInput}*/}
                                                {/*            onFocusChange={({ focused }) => this.setState({ focusedInput: focused })}*/}
                                                {/*            id="date"*/}
                                                {/*            displayFormat="YYYY-MM-DD"*/}
                                                {/*            numberOfMonths={1}*/}
                                                {/*            isOutsideRange={() => false}*/}
                                                {/*            disabled={isSubmitting || this.isShow()}*/}
                                                {/*        />*/}
                                                {/*        <ErrorMessage name="date" component="div" className="error-message" />*/}
                                                {/*    </div>*/}
                                                {/*</div>*/}
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
                                                    <div className="input__title">Universal Transaction ID (UTI)</div>
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
                                                    <button className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
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
                            </>
                        )}
                    </>
                )
        }


    }
}

export default LastSaleReportForm;
