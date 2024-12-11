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
import ModalDepthOfBookHistoryBlock from "@/components/modal-depth-of-book-history-block";
import InputMPIDField from "@/components/mpid-field";
import converterService from "@/services/converter/converter-service";
import {getGlobalConfig} from "@/utils/global-config";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBroom} from "@fortawesome/free-solid-svg-icons";
import formValidator from "@/services/form-validator/form-validator";
import AssetImage from "@/components/asset-image";


const formSchema = Yup.object().shape({
    action: Yup.string().required('Required').label('Action'),
    origin: Yup.string().min(3).max(8).required('Required').label('Origin'),
    symbol: Yup.string().required('Required').label('Symbol'),
    quote_condition: Yup.string().required('Required').label('Quote Condition'),
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
    isLoadingForm: boolean;
    isLoadingHistory: boolean;
    isLoading: boolean;
    focusedInputDate: any;
    focusedInputOffer: any;
}

interface DepthOfBookProps extends ICallback {
    action: string;
    data: IOrder | null;
    onCancel: () => void;
    isClose: boolean;
    symbol?: string;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const PATH = `${getGlobalConfig().host}-order-form`;

class DepthOfBookForm extends React.Component<DepthOfBookProps, DepthOfBookState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: DepthOfBookState;
    formRef: RefObject<any>;
    host: string = '';

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
            isLoadingForm: true,
            isLoadingHistory: true,
            isLoading: true,
            focusedInputDate: null,
            focusedInputOffer: null,
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
    }

    fillForm = async (order: IOrder) => {
        if (this.formRef?.current) {
            const {setFieldValue, setFieldTouched} = this.formRef.current;

            await Promise.all([
                setFieldValue('symbol', order.symbol_name || order.symbol),
                setFieldValue('quantity', order.quantity),
                setFieldValue('price', order.price),
                setFieldValue('side', order.side.toLowerCase()),
                setFieldValue('mpid', order.mpid),
                setFieldValue('origin', order.origin),

            ]);
            await Promise.all([
                setFieldTouched('symbol', true, true),
                setFieldTouched('quantity', true, true),
                setFieldTouched('price', true, true),
                setFieldTouched('side', true, true),
                setFieldTouched('mpid', true, true),
                setFieldTouched('origin', true, true),

            ]);
        }
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                let data = res || [];

                this.symbols = data.filter(s => getApprovedFormStatus().includes(s.status.toLowerCase() as FormStatus))
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

    handleSubmit = async (values: IOrder, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        let data = {...values};
        data = formValidator.castFormValues(data, formSchema);

        await ordersService.placeOrder(data)
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

    async componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
        this.getSymbols();
    }

    cancel = () => {
        this.props.onCancel && this.props.onCancel();
    }

    onCallback = () => {
        this.setState({isLoadingHistory: false}, () => {
            this.setLoading();
        })
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
            case 'new':
            case 'add':
            case 'edit':
            case 'view':
            case 'custom':
                return (
                    <>
                        {this.state.isLoading && (
                            <LoaderBlock/>
                        )}

                        <div className={`column-block ${this.state.isLoading || this.props.isClose ? 'd-none' : ''}`}>
                            <div className={'column-block__item'}>
                                {!this.state.isLoadingForm && (
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
                                            const symbol = this.symbols.find(s => s.symbol === values.symbol);

                                            formValidator.requiredFields(formSchema, values, errors);

                                            return (
                                                <Form className={`w-100`}>
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
                                                                component={InputMPIDField}
                                                            />
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
                                                                decimalScale={converterService.getDecimals(symbol?.fractional_lot_size)}
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
                                                                decimalScale={decimalPlaces}
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
                                                            type="submit"
                                                            disabled={isSubmitting || !isValid || !dirty}>
                                                            Save Order
                                                        </button>
                                                    )}

                                                    {this.state.errorMessages && (
                                                        <AlertBlock type={"error"}
                                                                    messages={this.state.errorMessages}/>
                                                    )}
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                )}

                            </div>
                            {this.isAdd() && (
                                <div className={'column-block__item'}>
                                    <ModalDepthOfBookHistoryBlock
                                        onCallback={this.onCallback}
                                        onSelected={this.fillForm}/>
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
            case 'delete':
                return (
                    <>
                        {this.state.isLoadingForm ? (
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
                        {this.state.isLoadingForm ? (
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
