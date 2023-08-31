import React, {createRef, RefObject} from "react";
import {Formik, Form, Field, ErrorMessage, FormikProps} from "formik";
import * as Yup from "yup";
import ordersService from "@/services/orders/orders-service";
import formatterService from "@/services/formatter/formatter-service";
import ExchangeAlertBlock from "./exchange-alert-block";
import AssetImage from "./asset-image";
import LoaderBlock from "./loader-block";
import Modal from "./modal";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {IUserAsset} from "@/interfaces/i-user-asset";
import {IExchangePair} from "@/interfaces/i-exchange-pair";
import AlertBlock from "./alert-block";
import NoDataBlock from "./no-data-block";
import {IExchangePrice} from "@/interfaces/i-exchange-price";
import NumericInputField from "@/components/numeric-input-field";
import formValidator from "@/services/form-validator/form-validator";

const formSchema = (values: any): Yup.ObjectSchema<any> => {
    return Yup.object().shape({
        base_price:
            Yup.number()
                .transform((value, originalValue) => {
                    return Number(originalValue.toString().replace(/,/g, ''));
                })
                .positive()
                .test('base_price', 'Insufficient balance', function (value) {
                    return !(values.maxAmountS <= 0);
                })
                .test('min', `Spend amount must be greater than or equal to ${formatterService.numberFormat(values.maxAmountS, undefined, values.assetSell?.asset?.decimals || undefined)}`, function (value) {
                    return ((value || 0) >= values.minAmountS && values.minAmountS > 0);
                })
                .test('max', `Spend amount must be less than or equal to ${formatterService.numberFormat(values.maxAmountS, undefined, values.assetSell?.asset?.decimals || undefined)}`, function (value) {
                    return ((value || 0) <= values.maxAmountS && values.maxAmountS > 0);
                })
                .required("").label("Spend amount"),
        quote_price:
            Yup.number()
                .transform((value, originalValue) => {
                    return Number(originalValue.toString().replace(/,/g, ''));
                })
                .positive()
                .test('quote_price', `Receive value ${formatterService.numberFormat(values.receivedAmount, undefined, values.assetSell?.asset?.decimals || undefined)} is too small`, function (value) {
                    const val = Number(formatterService.numberFormat(value, undefined, values.assetBuy?.asset?.decimals || undefined).toString().replace(/,/g, ''))
                    return (val !== 0)
                })
                .min(values.minAmountB)
                .max(values.maxAmountB)
                .required("").label("Receive amount"),
        base_currency:
            Yup.string()
                .notOneOf([Yup.ref('quote_currency')], "Symbols must not match")
                .required("").label("Spend asset"),
        quote_currency:
            Yup.string()
                .notOneOf([Yup.ref('base_currency')], "Symbols must not match")
                .required("").label("Receive asset"),
    });

};

const initialValues = {
    base_price: '',
    quote_price: '',
    base_currency: '',
    quote_currency: ''
}

type ExchangeFormFields = {
    base_price: string;
    quote_price: string;
    base_currency: string;
    quote_currency: string;
}

interface ExchangeFormProps {
    onSubmit?: () => void;
    onBack?: () => void;
}

interface ExchangeFormState extends IState {
    isAssetsLoading: boolean,
    isPairsLoading: boolean,
    isOpenModal: boolean;
    isFormSubmitted: boolean;
    assetModal: string;
    assetSell: IUserAsset | null;
    assetBuy: IUserAsset | null;
    minAmountS: number;
    maxAmountS: number;
    minAmountB: number;
    maxAmountB: number;
    exchangePrice: IExchangePrice | null;
    receivedAmount: number;
    receiveProcessing: boolean;
}

class ExchangeForm extends React.Component<ExchangeFormProps, ExchangeFormState> {

    static contextType = DataContext;

    declare context: React.ContextType<typeof DataContext>

    state: ExchangeFormState;

    errors: Array<string> | null = null;
    assets: Array<IUserAsset> = new Array<IUserAsset>();
    exchangePairs: Array<IExchangePair> = new Array<IExchangePair>();

    formRef: RefObject<FormikProps<ExchangeFormFields>> = createRef();

    constructor(props: {}, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            errorMessages: null,
            isAssetsLoading: true,
            isPairsLoading: true,
            isFormSubmitted: false,
            isOpenModal: false,
            assetModal: 'S',
            assetSell: null,
            assetBuy: null,
            minAmountS: 0.000001,
            maxAmountS: 99999999,
            minAmountB: 0.000001,
            maxAmountB: 999999999,
            receivedAmount: 0,
            exchangePrice: null,
            receiveProcessing: false
        };
    }

    componentDidMount() {
        this.getExchangePairs();
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const userAssets = this.context?.userAssets;
        const errors = this.context?.errors.get('userAssets');

        if (userAssets) {
            this.assets = [].concat(userAssets.crypto || [], userAssets.fiat || []);
            this.errors = null;
        }

        if (errors?.length) {
            this.assets = [];
            this.errors = errors;
        }

        if (!this.state.assetSell || !this.state.assetBuy) {
            this.buildExchangeAssets();
        }

        if ((userAssets && !errors) || (!userAssets && errors)) {

            if (this.state.assetSell?.asset.label) {
                const assetSell = this.assets.find((item: IUserAsset) => item.asset.label.toUpperCase() == this.state.assetSell?.asset.label.toUpperCase());
                if (assetSell && assetSell.balance !== this.state.assetSell?.balance) this.setState({assetSell: assetSell});

            }

            if (this.state.assetBuy?.asset.label) {
                const assetBuy = this.assets.find((item: IUserAsset) => item.asset.label.toUpperCase() == this.state.assetBuy?.asset.label.toUpperCase());
                if (assetBuy && assetBuy.balance !== this.state.assetBuy?.balance)  this.setState({assetBuy: assetBuy});
            }


            this.state.isAssetsLoading ? this.setState({isAssetsLoading: false}) : null;
        }
    }

    getExchangePairs = (): void => {
        this.setState({isPairsLoading: true});
        ordersService.getExchangePairs()
            .then((res: IExchangePair[]) => {
                this.exchangePairs = res || [];
                this.buildExchangeAssets();
            })
            .catch((errors: IError) => {
                this.errors = errors.messages;
            })
            .finally(() => this.setState({isPairsLoading: false}));
    }

    getExchangePrice = (security: string, currency: string): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            const body = {
                "base_currency": security,
                "quote_currency": currency,
                "amount": 1
            }
            ordersService.getExchangePrice(body)
                .then((res: IExchangePrice) => {
                    this.setState({errorMessages: null, exchangePrice: res});
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages, exchangePrice: null});
                })
                .finally(() => resolve(true));
        })

    }

    buildExchangeAssets = (): void => {
        this.exchangePairs = this.exchangePairs.filter((item: IExchangePair) => item.quote_currency.length);
        if (this.assets.length == 0 || this.exchangePairs.length == 0) return;

        const assetSell = this.assets.find((item: IUserAsset) => item.asset.label.toUpperCase() == this.exchangePairs[0].base_currency.toUpperCase());
        const assetBuy = this.assets.find((item: IUserAsset) => item.asset.label.toUpperCase() == this.exchangePairs[0].quote_currency[0].toUpperCase());

        if (assetSell) {
            this.setState({maxAmountS: assetSell.balance});
            this.formRef.current?.setFieldTouched('base_currency', true);
            this.formRef.current?.setFieldValue('base_currency', assetSell.asset.label, true);
        }
        if (assetBuy) {
            this.formRef.current?.setFieldTouched('quote_currency', true);
            this.formRef.current?.setFieldValue('quote_currency', assetBuy.asset.label, true);
        }

        this.setState({assetSell: assetSell || null, assetBuy: assetBuy || null});

        this.formRef.current?.validateForm();

        if (assetSell && assetBuy) this.getExchangePrice(assetSell.asset.label, assetBuy.asset.label);
    }

    handleSubmit = async (values: Record<string, string>,
                          {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        values = formValidator.castFormValues(values, formSchema(this.state))
        ordersService.createExchange(values)
            .then((success: boolean) => {
                this.setState({success: success});
                this.context.getUserAssets();
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                setSubmitting(false);

                if (this.props?.onSubmit) this.props.onSubmit?.();
                this.setState({isFormSubmitted: !this.state.isFormSubmitted});
            });
    };

    handleModal() {
        this.setState({isOpenModal: !this.state.isOpenModal});
    }

    handleSwap() {
        this.setState({receiveProcessing: true});

        const {assetSell, assetBuy} = this.state;
        const amount = this.state.receivedAmount || '';

        this.formRef.current?.setFieldValue('base_price', amount || '', true);
        this.formRef.current?.setFieldTouched('base_price', true);

        this.setState({assetSell: assetBuy, assetBuy: assetSell});

        if (assetBuy) {
            this.setState({maxAmountS: assetBuy.balance});
            this.formRef.current?.setFieldTouched('base_currency', true);
            this.formRef.current?.setFieldValue('base_currency', assetBuy.asset.label, true);
        }

        if (assetSell) {
            this.formRef.current?.setFieldTouched('quote_currency', true);
            this.formRef.current?.setFieldValue('quote_currency', assetSell.asset.label, true);
        }

        this.formRef.current?.validateForm();

        if (assetSell && assetBuy) this.getExchangePrice(assetBuy.asset.label, assetSell.asset.label)
            .then(() => {
                setTimeout(() => {
                    const price = amount ? this.calculateReceive(amount) : '';
                    this.handleReceivedAmount(price);
                    this.setState({receiveProcessing: false});
                    this.formRef.current?.setFieldTouched('quote_price', true);
                    this.formRef.current?.setFieldValue('quote_price', price, true);
                })
            })
    }

    handleAssetModal(type: string) {
        this.setState({assetModal: type});
        this.handleModal();
    }

    handleAsset(asset: any) {
        if (this.handleDisableAsset(asset)) return;
        this.setState({receiveProcessing: true});

        let security = this.state.assetSell?.asset.label;
        let currency = this.state.assetBuy?.asset.label;
        const amount = this.formRef?.current?.values.base_price || 0;

        if (this.state.assetModal == 'S') {
            security = asset.asset.label;
            this.setState({assetSell: asset, maxAmountS: asset.balance});
            this.formRef.current?.setFieldTouched('base_currency', true);
            this.formRef.current?.setFieldValue('base_currency', asset.asset.label, true);
        } else {
            currency = asset.asset.label;
            this.setState({assetBuy: asset});
            this.formRef.current?.setFieldTouched('quote_currency', true);
            this.formRef.current?.setFieldValue('quote_currency', asset.asset.label, true);
        }

        this.formRef.current?.validateForm();

        if (security && currency) this.getExchangePrice(security, currency)
            .then(() => {
                setTimeout(() => {
                    const price = amount ? this.calculateReceive(amount) : '';
                    this.handleReceivedAmount(price);
                    this.setState({receiveProcessing: false});
                    this.formRef.current?.setFieldTouched('quote_price', true);
                    this.formRef.current?.setFieldValue('quote_price', price, true);
                })
            });

        this.handleModal();
    }

    handleDisableAsset(asset: any): boolean {
        const currentAsset = this.state.assetModal == 'S' ? this.state.assetBuy?.asset.label : this.state.assetSell?.asset.label;
        const currencyData = this.getQuoteCurrencies(currentAsset);
        return !currencyData.includes(asset.asset.label)
    }

    getQuoteCurrencies(asset?: string): Array<string> {
        return this.exchangePairs?.find(s => s.base_currency === asset)?.quote_currency || [];
    }

    handleReceivedAmount(amount: string | number) {
        const receivedAmount = Number(amount);
        this.setState({receivedAmount: receivedAmount})
    }

    calculateReceive(amount: number | string): string {
        let value = ''
        const payAmount = Number(amount.toString().replace(/,/g, ''));
        const exchangePrice = this.state.exchangePrice?.sell || 0;

        if (!Number.isNaN(payAmount)) {
            value = (exchangePrice * payAmount).toString();
        }
        this.formRef.current?.setFieldValue('quote_price', amount === '' || exchangePrice <= 0 ? '' : value, true);
        this.formRef.current?.setFieldTouched('quote_price', true);

        return value;
    }

    calculatePay(amount: string): string {
        let value = '';
        const receiveAmount = Number(amount.toString().replace(/,/g, ''));
        const exchangePrice = this.state.exchangePrice?.sell || 0;

        if (!Number.isNaN(receiveAmount)) {
            value = (receiveAmount / exchangePrice).toString();
        }

        this.formRef.current?.setFieldValue('base_price', amount === '' || exchangePrice <= 0 ? '' : value, true);
        this.formRef.current?.setFieldTouched('base_price', true);

        return value;
    }

    handleBack = () => {
        if (this.props?.onBack) this.props.onBack?.();
        this.setState({errorMessages: null, isFormSubmitted: false});
    }


    render() {
        return (
            <>

                {(this.state.isAssetsLoading || this.state.isPairsLoading) && (
                    <LoaderBlock/>
                )}

                {this.errors && (
                    <AlertBlock type="error" messages={this.errors}/>
                )}
                <>
                    {this.state.isFormSubmitted && (
                        <ExchangeAlertBlock
                            success={this.state.success}
                            amount={this.state.receivedAmount}
                            currency={this.state.assetBuy?.asset.label}
                            messages={this.state.errorMessages}
                            decimals={this.state.assetBuy?.asset.decimals || 0}
                            onClose={this.handleBack}/>
                    )}
                    <div
                        className={`${this.state.isAssetsLoading || this.state.isPairsLoading || this.errors || this.state.isFormSubmitted ? 'hidden' : ''}`}>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={() => formSchema({...this.state})}
                            onSubmit={this.handleSubmit}
                            innerRef={this.formRef}
                        >
                            {({
                                  errors,
                                  values,
                                  touched,
                                  isSubmitting,
                                  isValid,
                                  dirty,
                                  setFieldValue,
                                  handleChange
                              }) => {
                                return (
                                    <Form>
                                        <div className="exchange-block">
                                            <div className="exchange-block__top">
                                                <div className="exchange-block__balance">Current
                                                    balance
                                                </div>
                                                <div className="exchange-block__price">
                                                    {formatterService.numberFormat(this.state.assetSell?.balance)} {this.state.assetSell?.asset.label}
                                                </div>
                                            </div>
                                            <div className="exchange-block__wrap">
                                                <div className="input">
                                                    <div className="input__title">Spend</div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="base_price"
                                                            id="base_price"
                                                            type="number"
                                                            className="input__text"
                                                            placeholder={formatterService.getDecimalPlaceholder(this.state.assetSell?.asset.decimals || 0)}
                                                            disabled={isSubmitting || this.state.receiveProcessing}
                                                            component={NumericInputField}
                                                            decimalScale={this.state.assetSell?.asset.decimals || 0}
                                                            handleChange={(event: any) => {
                                                                const price = this.calculateReceive(event.target.value);
                                                                this.handleReceivedAmount(price);
                                                            }}
                                                        />
                                                        <ErrorMessage name="base_price"
                                                                      component="div"
                                                                      className="error-message"/>

                                                        <Field name="base_currency"
                                                               id="base_currency" type="hidden"
                                                               disabled={isSubmitting}/>
                                                        {!errors.base_price && errors.base_currency && touched.base_currency ? (
                                                            <div
                                                                className="error-message">{errors.base_currency}</div>
                                                        ) : null}
                                                    </div>
                                                    <div className="input__coin modal-link"
                                                         onClick={() => this.handleAssetModal('S')}>
                                                        <div className="input__coin-img">
                                                            {this.state.assetSell?.asset.image && (
                                                                <AssetImage
                                                                    alt={this.state.assetSell?.asset.label}
                                                                    src={this.state.assetSell?.asset.image}
                                                                    width={16} height={16}/>
                                                            )}
                                                        </div>
                                                        <span>{this.state.assetSell?.asset.label}</span>
                                                        <div className="input__coin-arrow"/>
                                                    </div>
                                                </div>
                                                <button type="button" className="btn-exchange"
                                                        onClick={() => this.handleSwap()}
                                                        tabIndex={-1}/>
                                                <div className="input">
                                                    <div className="input__title">Receive</div>

                                                    {this.state.receiveProcessing ? (
                                                        <LoaderBlock height={48}
                                                                     width={48}/>
                                                    ) : (
                                                        <>
                                                            <div className="input__wrap">
                                                                <Field
                                                                    name="quote_price"
                                                                    id="quote_price"
                                                                    type="number"
                                                                    className={`input__text ${this.state.receiveProcessing ? 'hidden' : ''}`}
                                                                    placeholder={formatterService.getDecimalPlaceholder(this.state.assetBuy?.asset.decimals || 0)}
                                                                    disabled={isSubmitting || this.state.receiveProcessing}
                                                                    component={NumericInputField}
                                                                    decimalScale={this.state.assetBuy?.asset.decimals || 0}
                                                                    handleChange={(event: any) => {
                                                                        const price = this.calculatePay(event.target.value);
                                                                        this.handleReceivedAmount(price);
                                                                    }}
                                                                />
                                                                <ErrorMessage name="quote_price"
                                                                              component="div"
                                                                              className="error-message"/>

                                                                <Field name="quote_currency"
                                                                       id="quote_currency" type="hidden"
                                                                       disabled={isSubmitting}/>
                                                                {!errors.quote_price && errors.quote_currency && touched.quote_currency ? (
                                                                    <div
                                                                        className="error-message">{errors.quote_currency}</div>
                                                                ) : null}
                                                            </div>
                                                            <div className="input__coin modal-link"
                                                                 onClick={() => this.handleAssetModal('B')}>
                                                                <div className="input__coin-img">
                                                                    {this.state.assetBuy?.asset.image && (
                                                                        <AssetImage
                                                                            alt={this.state.assetBuy?.asset.label}
                                                                            src={this.state.assetBuy?.asset.image}
                                                                            width={16} height={16}/>
                                                                    )}
                                                                </div>
                                                                <span>{this.state.assetBuy?.asset.label}</span>
                                                                <div className="input__coin-arrow"/>
                                                            </div>
                                                        </>
                                                    )}

                                                </div>
                                                {this.state.exchangePrice && (
                                                    <div className="exchange-block__rate">
                                                        1 {this.state.assetSell?.asset.label} ≈ {formatterService.numberFormat(this.state.exchangePrice.sell)} {this.state.assetBuy?.asset.label}
                                                    </div>
                                                )}
                                                <button
                                                    className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                    type="submit"
                                                    disabled={isSubmitting || !isValid || !dirty || this.state.receiveProcessing}>
                                                    Place order
                                                </button>

                                                {this.state.errorMessages && (
                                                    <AlertBlock type="error"
                                                                messages={this.state.errorMessages}/>
                                                )}

                                            </div>
                                        </div>
                                    </Form>
                                );
                            }}
                        </Formik>

                        <Modal isOpen={this.state.isOpenModal}
                               onClose={() => this.handleModal()}
                               title="Select Virtual Asset" className="exchange-modal">
                            {this.assets.map((userAsset: IUserAsset, index: number) => (
                                <div
                                    className={`modal-exchange ${this.handleDisableAsset(userAsset) ? 'disabled' : ''}`}
                                    key={userAsset.asset.label}
                                    onClick={() => this.handleAsset(userAsset)}>
                                    <div className="modal-exchange__left">
                                        {userAsset.asset.image && (
                                            <AssetImage
                                                alt={userAsset.asset.label}
                                                src={userAsset.asset.image}
                                                width={24} height={24}/>
                                        )}
                                        <span>{userAsset.asset.label}</span>
                                    </div>
                                    <div className="modal-exchange__arrow icon-chevron-right"/>
                                </div>
                            ))}
                        </Modal>
                    </div>

                </>


                {(!this.assets.length && !this.exchangePairs.length && !this.state.isAssetsLoading && !this.state.isPairsLoading && !this.errors) && (
                    // <NoDataBlock primaryText="No Symbols available"/>
                    <></>
                )}
            </>
        )
    }
}

export default ExchangeForm;
