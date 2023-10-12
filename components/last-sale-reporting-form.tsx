import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
// import formatterService from "@/services/formatter/formatter-service";
// import dsinService from "@/services/dsin/dsin-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import lastSaleService from "@/services/last-sale/last-sale-service";

const formSchema = Yup.object().shape({

    origin: Yup.string().required('Required'),
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
}

interface LastSaleReportProps extends ICallback {
    action: string;
    data: ILastSale | null;
    onCancel?: () => void;
}

class LastSaleReportForm extends React.Component<LastSaleReportProps, LastSaleReportState> {

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
            date: initialData?.date || '',
            uti: initialData?.uti || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
        };

    }

    handleSubmit = async (values: ILastSale, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

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

    // handleSymbol(value: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
    //     const alphanumericValue = value.slice(0, 5).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    //     setFieldValue('symbol', alphanumericValue);
    //
    //     const dsin = dsinService.generate(alphanumericValue)
    //     setFieldValue('dsin', dsin);
    // }

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
                                                        className={`input__wrap`}>
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
                                                        className={`input__wrap`}>
                                                        <Field
                                                            name="symbol"
                                                            id="symbol"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="symbol" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Condition <i>*</i></div>
                                                    <div
                                                        className={`input__wrap`}>
                                                        <Field
                                                            name="condition"
                                                            id="condition"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="condition" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Quantity <i>*</i></div>
                                                    <div
                                                        className={`input__wrap`}>
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
                                                        className={`input__wrap`}>
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
                                                        className={`input__wrap`}>
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
                                                        className={`input__wrap`}>
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
                                                <div className="input">
                                                    <div className="input__title">Tick Indication <i>*</i></div>
                                                    <div
                                                        className={`input__wrap`}>
                                                        <Field
                                                            name="tick_indication"
                                                            id="tick_indication"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
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
