import React, {RefObject} from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import NumericInputField from "@/components/numeric-input-field";
import Select from "react-select";
import {getQuoteConditionDescriptions, QuoteCondition} from "@/enums/quote-condition";
import {FormStatus, getApprovedFormStatus} from "@/enums/form-status";
import {getOrderActionByName, OrderAction} from "@/enums/order-action";
import {IOrder} from "@/interfaces/i-order";
import {getOrderSideDescriptions, OrderSide} from "@/enums/order-side";
import {getOrderStatusNames, OrderStatus} from "@/enums/order-status";
import ordersService from "@/services/orders/orders-service";
import filterService from "@/services/filter/filter";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";


const formSchema = Yup.object().shape({
    action: Yup.string().required('Required'),
    origin: Yup.string().min(3).max(4).required('Required'),
    symbol: Yup.string().required('Required'),
    quote_condition: Yup.string().required('Required'),
    mpid: Yup.string().min(3).max(12).required('Required').label('MPID'),
    side: Yup.string().required('Required').label('Side'),
    quantity: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Size').min(0).required('Required').label('Size'),
    price: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Price').min(0).required('Required').label('Price'),
});

interface DepthOfBookState extends IState {
    formInitialValues: {};
    isLoading: boolean;
    focusedInputDate: any;
    focusedInputOffer: any;
    data: IOrder[];
    dataFull: IOrder[];
    filterData: any;
}

interface DepthOfBookProps extends ICallback {
    action: string;
    data: IOrder | null;
    onCancel?: () => void;
    symbol?: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let rowProps: ITableRowProps;
const pageLength = 25;

class DepthOfBookForm extends React.Component<DepthOfBookProps, DepthOfBookState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: DepthOfBookState;
    formRef: RefObject<any>;

    constructor(props: DepthOfBookProps) {
        super(props);

        this.formRef = React.createRef();

        const initialData = this.props.data || {} as IOrder;

        const initialValues: {
            action: string;
            origin: string;
            symbol: string;
            quote_condition: string;
            mpid: string;
            side: string;
            quantity: string;
            price: string;
            ref_id: string;
            uti: string;
            status: string;
        } = {
            action: (getOrderActionByName(this.props?.action) || OrderAction.n).toLowerCase(),
            origin: initialData?.origin || '',
            symbol: initialData?.symbol_name || this.props.symbol || '',
            quote_condition: (initialData?.quote_condition || QuoteCondition.c).toLowerCase(),
            mpid: initialData?.mpid || '',
            side: (initialData?.side || OrderSide.b).toLowerCase(),
            quantity: (initialData?.quantity || '').toString(),
            price: (initialData?.price || '').toString(),
            ref_id: initialData?.ref_id || '',
            uti: initialData?.uti || '',
            status: initialData?.status || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            isLoading: true,
            focusedInputDate: null,
            focusedInputOffer: null,
            data: [],
            dataFull: [],
            filterData: [],
        };

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) => item.getValue().symbol,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.side, {
                id: "side",
                cell: (item) => <span
                    className={`${item.getValue().toString().toLowerCase()}-order-side`}>{item.getValue()}</span>,
                header: () => <span>Side </span>,
            }),
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Size </span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Price </span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        rowProps = {
            className: 'cursor-pointer compact-row',
            onCallback: (order: IOrder) => this.fillForm(order)
        }

    }

    fillForm = async (order: IOrder) => {
        if (this.formRef?.current) {
            await this.formRef.current.setFieldValue('symbol', order.symbol_name)
                .then(async () => await this.formRef.current.setFieldTouched('symbol', true, true))

            await this.formRef.current.setFieldValue('quantity', order.quantity)
                .then(async () => await this.formRef.current.setFieldTouched('quantity', true, true))

            await this.formRef.current.setFieldValue('price', order.price)
                .then(async () => await this.formRef.current.setFieldTouched('price', true, true))

            await this.formRef.current.setFieldValue('side', order.side.toLowerCase() === 'b' ? 's' : 'b')
                .then(async () => await this.formRef.current.setFieldTouched('side', true, true))
        }
    }

    getSymbols = () => {
        return new Promise<boolean>(resolve => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    this.symbols = res?.sort((a, b) => {
                        return a.symbol.localeCompare(b.symbol);
                    }).filter(s => getApprovedFormStatus().includes(s.status.toLowerCase() as FormStatus)) || [];
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })

    }

    getOrders = () => {
        ordersService.getOrderHistory(null, 'open', pageLength)
            .then((res: Array<IOrder>) => {

                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
                    s.side = OrderSide[s.side as keyof typeof OrderSide] || ''
                    s.status_name = getOrderStatusNames(s.status as OrderStatus);
                })

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    handleSubmit = async (values: IOrder, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        let data = values;

        data.quantity = data.quantity.replace(/,/g, '');
        data.price = data.price.replace(/,/g, '');

        await ordersService.placeOrder(data)
            .then(((res: any) => {
                this.props.onCallback(res[0], this.isAdd());
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    handleDelete = async (values: IOrder, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        await ordersService.deleteOrder(values.ref_id)
            .then(((res: any) => {
                this.props.onCallback(null, this.isAdd());
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
        return [OrderAction.n, OrderAction.a].includes(getOrderActionByName(this.props.action))
    }

    isAddOrder(): boolean {
        return getOrderActionByName(this.props.action) === OrderAction.a;
    }

    isSymbol(): boolean {
        return !!this.props?.symbol
    }

    componentDidMount() {
        this.getSymbols().then(() => {
            this.isAdd() ? this.getOrders() : this.setState({isLoading: false})
        })
    }

    cancel = () => {
        this.props.onCancel && this.props.onCancel();
    }


    render() {
        switch (this.props.action) {
            case 'new':
            case 'add':
            case 'edit':
            case 'view':
            case 'custom':
                return (
                    <>
                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (
                            <div className={'order-block'}>
                                <div className={'order-block__item'}>
                                    <Formik<IOrder>
                                        initialValues={this.state.formInitialValues as IOrder}
                                        validationSchema={formSchema}
                                        onSubmit={this.handleSubmit}
                                        innerRef={this.formRef}
                                    >
                                        {({
                                              isSubmitting,
                                              setFieldValue,
                                              isValid,
                                              values,
                                              dirty,
                                              errors
                                          }) => {
                                            return (
                                                <Form className={`w-100`}>
                                                    {values.status && (
                                                        <div className="modal__navigate">
                                                            <div className="modal__navigate__title">Status</div>
                                                            <div
                                                                className={`table__status table__status-${values.status}`}>
                                                                {`${getOrderStatusNames(values.status as OrderStatus)}`}
                                                            </div>
                                                        </div>
                                                    )}

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
                                                                decimalScale={2}
                                                            />
                                                            <ErrorMessage name="mpid" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Side <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="side"
                                                                id="side"
                                                                as="select"
                                                                className="b-select"
                                                                disabled={isSubmitting || this.isShow()}
                                                            >
                                                                {Object.keys(OrderSide).map((item) => (
                                                                    <option key={item} value={item}>
                                                                        {OrderSide[item as keyof typeof OrderSide]}
                                                                        {item ? ` (${getOrderSideDescriptions(OrderSide[item as keyof typeof OrderSide])})` : ''}
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="side" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Size <i>*</i></div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="quantity"
                                                                id="quantity"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Size"
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

                                                    <div className="input">
                                                        <div className="input__title">Reference Number ID (RefID)
                                                        </div>
                                                        <div
                                                            className={`input__wrap text-center`}>
                                                            <Field
                                                                name="ref_id"
                                                                id="ref_id"
                                                                type="text"
                                                                className="input__text uti"
                                                                disabled={true}
                                                            />
                                                            <ErrorMessage name="ref_id" component="div"
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
                                                            Save Order
                                                        </button>
                                                    )}

                                                    {this.state.errorMessages && (
                                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                    )}
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                </div>
                                {this.isAdd() && (
                                    <div className={'order-block__item align-items-baseline'}>
                                        <div className="content__top p-0 mb-0 w-100 border-none">
                                            <div className="profile__right-title mb-2">Order history
                                                (last {pageLength})
                                            </div>
                                        </div>

                                        {this.state.data.length ? (
                                            <div className={'w-100'}>
                                                <Table columns={columns}
                                                       rowProps={rowProps}
                                                       pageLength={pageLength}
                                                       data={this.state.data}
                                                />
                                            </div>
                                        ) : (
                                            <div className={'content__bottom w-100'}>
                                                <NoDataBlock/>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                        )}
                    </>
                )
            case 'delete':
                return (
                    <>
                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<IOrder>
                                    initialValues={this.state.formInitialValues as IOrder}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleDelete}
                                >
                                    {({
                                          isSubmitting
                                      }) => {
                                        return (
                                            <Form className={``}>
                                                <div className={'profile__right-wrap-full'}>
                                                    <div className={'mt-2'}>
                                                        <div className={'profile__panel'}>
                                                            <div className={'profile__info__panel'}>
                                                                <div className={'input__box buttons'}>
                                                                    <div className="input__box buttons">
                                                                        <button
                                                                            className={`b-btn ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                            type="submit"
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            Submit
                                                                        </button>
                                                                        <button type={"button"}
                                                                                className={`b-btn-border ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                                disabled={isSubmitting}
                                                                                onClick={this.cancel}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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
            case 'remove':
                return (
                    <>
                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<IOrder>
                                    initialValues={this.state.formInitialValues as IOrder}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({
                                          isSubmitting
                                      }) => {
                                        return (
                                            <Form className={``}>
                                                <div className={'profile__right-wrap-full'}>
                                                    <div className={'mt-2'}>
                                                        <div className={'profile__panel'}>
                                                            <div className={'profile__info__panel'}>
                                                                <div className={'input__box buttons'}>
                                                                    <div className="input__box buttons">
                                                                        <button
                                                                            className={`b-btn ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                            type="submit"
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            Submit
                                                                        </button>
                                                                        <button type={"button"}
                                                                                className={`b-btn-border ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                                disabled={isSubmitting}
                                                                                onClick={this.cancel}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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

export default DepthOfBookForm;
