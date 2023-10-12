import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {ILastSale} from "@/interfaces/i-last-sale";
import lastSaleService from "@/services/last-sale/last-sale-service";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import { SingleDatePicker } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {TickIndication} from "@/enums/tick-indication";
import {Condition} from "@/enums/condition";


import moment from "moment";
import formatterService from "@/services/formatter/formatter-service";

const formSchema = Yup.object().shape({

    origin: Yup.string().min(3).max(4).required('Required'),
    symbol: Yup.string().required('Required'),
    condition:Yup.string().required('Required'),
    tick_indication: Yup.string().required('Required'),
    quantity: Yup.number().typeError('Invalid quantity').min(0).required('Required'),
    price: Yup.number().typeError('Invalid price').min(0).required('Required'),
    time: Yup.string().required('Required'),
    date: Yup.string().required('Required'),
});

interface LastSaleReportState extends IState {
    formInitialValues: {};
    loading: boolean;
    focusedInput: boolean;

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
            condition: initialData?.condition || '',
            tick_indication: initialData?.tick_indication || '',
            quantity: (initialData?.quantity || '').toString(),
            price: (initialData?.price || '').toString(),
            time: initialData?.time || '',
            // date: moment(initialData?.date) || null,
            date: initialData?.date || '',
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
                }) || [];

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

        // let data = values;
        // data.date = moment(values.date).format('YYYY-MM-DD');

        const request: Promise<any> = this.props.action == 'edit' ?
            lastSaleService.updateLastSaleReport(values, this.props.data?.id || 0) :
            lastSaleService.createLastSaleReport(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(values);
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
                                    {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
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
                                                            name="symbol"
                                                            id="symbol"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select Symbol</option>
                                                            {Object.values(this.symbols).map((item) => (
                                                                <option key={item.id} value={item.symbol}>
                                                                    {item.symbol}
                                                                </option>
                                                            ))}
                                                        </Field>
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
                                                                    {Condition[item]}
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
                                                            disabled={isSubmitting || this.isShow()}
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
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="price" component="div"
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
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="time" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Date <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="date"
                                                            id="date"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="date" component="div"
                                                                      className="error-message"/>
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
                                                                    {TickIndication[item]} ({item})
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="tick_indication" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                {!this.isAdd() && (
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
                                                )}

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
