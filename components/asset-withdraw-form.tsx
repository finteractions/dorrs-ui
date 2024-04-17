import React, {RefObject, SyntheticEvent} from 'react';
import {Formik, Form, Field, ErrorMessage, FormikProps} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import formatterService from "@/services/formatter/formatter-service";
import Link from "next/link";
import {IUserAsset} from "@/interfaces/i-user-asset";
import Modal from "@/components/modal";
import WalletForm from "@/components/wallet-form";
import ordersService from "@/services/orders/orders-service";
import LoaderBlock from "@/components/loader-block";
import VerifyOtpForm from "@/components/verify-otp-form";
import {AssetTypeExchange} from "@/enums/asset-type-exchange";
import Image from "next/image";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import kycService from "@/services/kyc/kyc-service";
import NumericInputField from "@/components/numeric-input-field";
import formValidator from "@/services/form-validator/form-validator";
import WalletsBlock from "@/components/wallets-block";

interface AssetWithdrawFormState extends IState {
    isOpenModalWalletList: boolean;
    isAddWalletForm: boolean;
    isLoading: boolean;
    selectedWallet: { name: string, value: string }
    receivedAmount: number
    formValues: Record<string, string | number>
    step: number;
    isProcessing: boolean
    isLoadingBankAccount: boolean;
    isLoadingWithdrawAddresses: boolean;
}

interface AssetWithdrawFormProps extends ICallback {
    data: IUserAsset | null;
}

class AssetWithdrawForm extends React.Component<AssetWithdrawFormProps, AssetWithdrawFormState> {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;
    userAsset: IUserAsset | null;
    state: AssetWithdrawFormState;
    formSchema: Yup.ObjectSchema<any>;
    initialValues: { amount: string; wallet_address: string; bank_name: string; account_number: string; bank_id: string; asset: string };
    formRef: RefObject<FormikProps<{ amount: string; wallet_address: string; asset: string }>> = React.createRef();
    bankAccounts: Array<IBankAccount>;
    isFIAT: boolean;
    withdrawAddresses: Array<IWithdrawAddress>;

    constructor(props: AssetWithdrawFormProps, context: IDataContext<null>) {
        super(props);
        this.context = context;
        this.userAsset = props.data;

        this.state = {
            success: false,
            isOpenModalWalletList: false,
            isAddWalletForm: false,
            isLoading: false,
            selectedWallet: {value: '', name: ''},
            receivedAmount: 0,
            formValues: {amount: 0, wallet_address: ''},
            step: 0,
            isProcessing: false,
            isLoadingBankAccount: false,
            isLoadingWithdrawAddresses: false
        };

        this.isFIAT = this.userAsset?.asset.network.toLowerCase() === AssetTypeExchange.FIAT;

        this.formSchema = Yup.object().shape({
            amount: Yup.number()
                .transform((value, originalValue) => {
                    return Number(originalValue.toString().replace(/,/g, ''));
                })
                .test('amount', 'Insufficient balance', function(value) {
                    const balance = props.data?.balance || 0;
                    return !(balance <= 0);
                })
                .min(this.userAsset?.asset.min_withdraw || 0,
                    `Minimum amount to withdraw is ${formatterService.numberFormat(this.userAsset?.asset.min_withdraw)}`)
                .max(this.userAsset?.balance || 0,
                    `Maximum amount to withdraw is ${formatterService.numberFormat(this.userAsset?.balance)}`)
                .required(''),
            asset: Yup.string()
        }).when('asset', (asset, schema) => {
            return !this.isFIAT
                ? schema.shape({
                    wallet_address: Yup.string().required(''),
                })
                : schema.shape({
                    bank_id: Yup.string().required(''),
                });
        });

        this.initialValues = {
            amount: "",
            wallet_address: "",
            bank_id: "",
            bank_name: "",
            account_number: "",
            asset: this.userAsset?.asset.label || ''
        }

        this.bankAccounts = new Array<IBankAccount>();
        this.withdrawAddresses = new Array<IWithdrawAddress>();

        this.onCallback = this.onCallback.bind(this);
        this.onCallbackOTP = this.onCallbackOTP.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        this.onLoading = this.onLoading.bind(this);
        this.handleModalWalletList  = this.handleModalWalletList.bind(this);
        this.handleWithdrawAddress  = this.handleWithdrawAddress.bind(this);
    }

    componentDidMount() {
        if (this.isFIAT) {
            this.getBankAccounts();
        }else {
            this.getWithdrawAddress();
        }
    }

    getBankAccounts = () => {
        this.setState({errorMessages: null, successMessage: null, isLoadingBankAccount: true});

        kycService.getBankAccounts()
            .then((res: IBankAccount[]) => {
                this.bankAccounts = res.filter(s => s.currency === this.userAsset?.asset.label && s.is_approved).sort((a: IBankAccount, b: IBankAccount) => b.id - a.id)
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            }).finally(() => this.setState({isLoadingBankAccount: false}));
    }

    getWithdrawAddress = () => {
        this.setState({errorMessages: null, successMessage: null, isLoadingWithdrawAddresses: true});

        // ordersService.getWithdrawAddresses()
        //     .then((res: Array<IWithdrawAddress>) => {
        //         this.withdrawAddresses = res.filter(s => s.asset === this.userAsset?.asset?.label);
        //     })
        //     .catch((errors: IError) => {
        //         this.setState({errorMessages: errors.messages})
        //     }).finally(() => this.setState({isLoadingWithdrawAddresses: false}));
    }

    handleSubmit = async (values: Record<string, string>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        values = formValidator.castFormValues(values, this.formSchema)

        this.setState({errorMessages: null, successMessage: null});
        this.setState({formValues: values, step: this.state.step + 1});
    };

    handleBack(event: SyntheticEvent) {
        event.preventDefault();
        this.props.onCallback(null);
    }

    handleMaxValue = () => {
        const maxAmount = this.userAsset?.balance || 0;
        this.formRef.current?.setFieldValue("amount", maxAmount);
        this.handleReceivedAmount(maxAmount)
    };

    handleModalWalletList = () => {
        this.setState({isOpenModalWalletList: !this.state.isOpenModalWalletList});
        this.setState({isAddWalletForm: false});
        this.setState({errorMessages: null});
    };

    handleAddWallet = () => {
        this.setState({isAddWalletForm: !this.state.isAddWalletForm, isOpenModalWalletList: true});
    };

    handleWithdrawAddress(withdrawAddress: IWithdrawAddress) {
        const address = withdrawAddress?.address;
        this.handleModalWalletList();
        this.setState({selectedWallet: {name: address, value: address}});
        this.formRef.current?.setFieldValue("wallet_address", address);
    }

    handleReceivedAmount(amount: string | number) {
        let receivedAmount = Number(amount.toString().replace(/,/g, '')) - Number(this.userAsset?.asset.fees);
        receivedAmount = Number.isNaN(receivedAmount) ? 0 : receivedAmount;
        this.setState({receivedAmount: receivedAmount})
    }

    onChangeAmount(event: React.ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;
        this.formRef.current?.setFieldValue(name, value);

        this.handleReceivedAmount(value)
    }

    onCallback(values: any) {
        this.handleAddWallet();
        this.setState({isLoading: true});
    }

    async onCallbackOTP(values: any, step: boolean) {
        this.setState({isProcessing: true, step: this.state.step + 1});

        const {withdraw_token} = values;
        const data = Object.assign(this.state.formValues, {withdraw_token: withdraw_token})

        // const request: Promise<any> = this.isFIAT ?
        //     ordersService.createFiatWithdrawRequest(data) :
        //     ordersService.createWithdrawRequest(data)
        //
        // await request
        //     .then(() => {
        //         this.setState({step: this.state.step + 1})
        //         this.context.getUserAssets();
        //     })
        //     .catch((errors: IError) => {
        //         this.setState({errorMessages: errors.messages});
        //     })
        //     .finally(() => this.setState({isProcessing: false}))
    }

    onLoading(isLoading: boolean) {
        this.setState({isLoading: isLoading});
    }

    handleBankIdChange = (event: any) => {
        const { name, value } = event.target;

        if (value) {
            const bank_id = parseInt(event.target.value);
            const bank_account = this.bankAccounts.filter(item => item.id === bank_id)[0];

            this.formRef.current?.setFieldValue('account_number', bank_account.account_number.toString());
            this.formRef.current?.setFieldValue('bank_name', bank_account.bank_name.toString());

        }else {
             this.formRef.current?.setFieldValue('account_number', "");
             this.formRef.current?.setFieldValue('bank_name', "");
        }

        this.formRef.current?.setFieldValue(name, value);
    };

    render() {
        return (
            <>
                <div className="exchange section">
                    {this.state.step === 0 && (
                        <div className="content__top d-block text-center">
                            <div className="content__title">
                                Withdraw {this.userAsset?.asset?.label}
                            </div>
                            <p>Create a request to withdraw {this.userAsset?.asset?.label}</p>
                        </div>
                    )}

                    {[1, 2].includes(this.state.step) && (
                        <div className="content__top d-block text-center">
                            <div className="content__title">
                                Withdrawal confirmation
                            </div>
                            {this.state.step === 1 && (
                                <p>In order to finalise the withdrawal request, please enter the OTP below</p>
                            )}
                        </div>
                    )}

                    <div
                        className={`${this.state.step <= 2 ? 'exchange-block' : ''}  ${this.state.step > 0 ? 'box-shadow-none' : ''}`}>
                        {this.state.step === 0 && (
                            <>
                                <Formik
                                    initialValues={this.initialValues}
                                    validationSchema={this.formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({isSubmitting, isValid, dirty, setFieldValue, setFieldTouched}) => {
                                        return (
                                            <>
                                                {this.state.isLoadingBankAccount || this.state.isLoadingWithdrawAddresses ? (
                                                    <LoaderBlock/>
                                                ) : (
                                                    <Form>
                                                        <div className="exchange-block__top">
                                                            <div className="exchange-block__balance">
                                                                Current balance
                                                            </div>
                                                            <div className="exchange-block__price">
                                                                {formatterService.numberFormat(this.userAsset?.balance)} {this.userAsset?.asset?.label}
                                                            </div>
                                                        </div>
                                                        <div className="exchange-block__wrap">
                                                            <div className="input">
                                                                <div className="input__title">Amount</div>
                                                                <div className="input__wrap">
                                                                    <Field
                                                                        id="amount"
                                                                        name="amount"
                                                                        className="input__text"
                                                                        component={NumericInputField}
                                                                        placeholder={`min. ${formatterService.numberFormat(this.userAsset?.asset.min_withdraw || 0)}`}
                                                                        decimalScale={this.userAsset?.asset.decimals || 0}
                                                                        disabled={isSubmitting}
                                                                        handleChange={this.onChangeAmount}
                                                                    />
                                                                    <button
                                                                        onClick={this.handleMaxValue}
                                                                        type="button" tabIndex={-1}
                                                                        className="max-value icon-max"/>
                                                                </div>
                                                            </div>

                                                            {this.isFIAT && (
                                                                <div className="input">
                                                                    <div className="input__title">
                                                                        Bank Account
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="bank_id"
                                                                            id="bank_id"
                                                                            as="select"
                                                                            className="b-select cursor-pointer"
                                                                            onChange={this.handleBankIdChange}
                                                                        >
                                                                            <option value="">Select bank account
                                                                            </option>
                                                                            {this.bankAccounts.map((bankAccount: IBankAccount) => (
                                                                                <option value={bankAccount.id} key={bankAccount.id}>
                                                                                    {bankAccount.bank_name} ({bankAccount.account_number})
                                                                                </option>
                                                                            ))}
                                                                        </Field>
                                                                        <Field
                                                                            name="account_number"
                                                                            type="hidden"
                                                                            className="input__text"
                                                                            disabled={isSubmitting}
                                                                        />
                                                                        <Field
                                                                            name="bank_name"
                                                                            type="hidden"
                                                                            className="input__text"
                                                                            disabled={isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="bank_id"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!this.isFIAT && (
                                                                <div className="input">
                                                                    <div className="input__title">
                                                                        Wallet address
                                                                    </div>
                                                                    {this.withdrawAddresses.length || this.state.selectedWallet.value ? (
                                                                        <div className="input__wrap"
                                                                             onClick={this.handleModalWalletList}>
                                                                            <Field
                                                                                name="wallet_address"
                                                                                id="wallet_address"
                                                                                as="select"
                                                                                className="b-select disabled-select cursor-pointer"
                                                                                disabled={true}
                                                                                value={this.state.selectedWallet.value}
                                                                            >
                                                                                <option value="" disabled={true}>
                                                                                    Select wallet address
                                                                                </option>
                                                                                <option
                                                                                    value={this.state.selectedWallet.value}
                                                                                    disabled={true}>
                                                                                    {this.state.selectedWallet.name}
                                                                                </option>
                                                                            </Field>
                                                                            <ErrorMessage name="wallet_address"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <button onClick={this.handleAddWallet}
                                                                                className={`b-btn ripple`}
                                                                                type="submit"
                                                                                disabled={isSubmitting}
                                                                            >
                                                                               Add wallet
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            )}

                                                            <Field
                                                                name="asset"
                                                                id="asset"
                                                                type="hidden"
                                                                className="input__text"
                                                                disabled={isSubmitting}
                                                            />
                                                            <div className="exchange-block__top">
                                                                <div className="exchange-block__balance">
                                                                    Will be received
                                                                </div>
                                                                <div className="exchange-block__price">
                                                                    {formatterService.numberFormat(this.state.receivedAmount)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                                type="submit"
                                                                disabled={isSubmitting || !isValid || !dirty}
                                                            >
                                                                Create Request
                                                            </button>

                                                            {this.state.errorMessages && (
                                                                <AlertBlock type={"error"}
                                                                            messages={this.state.errorMessages}/>
                                                            )}
                                                            {this.state.successMessage && (
                                                                <AlertBlock type={"success"}
                                                                            messages={this.state.successMessage}/>
                                                            )}
                                                        </div>
                                                    </Form>
                                                )}
                                            </>
                                        );
                                    }}
                                </Formik>

                                <Modal isOpen={this.state.isOpenModalWalletList}
                                       onClose={() => this.handleModalWalletList()}
                                       title={this.state.isAddWalletForm ? `Add new wallet` : `My Wallets`}>
                                    {this.state.isAddWalletForm ?
                                        (
                                            <WalletForm userAsset={this.userAsset}
                                                        onCallback={this.onCallback}/>
                                        ) : (
                                            <>
                                                <WalletsBlock userAsset={this.userAsset}
                                                              onLoading={this.onLoading}
                                                              onCallback={this.handleWithdrawAddress}
                                                />
                                                <div className={`bank-delete ${this.state.isLoading ? 'hidden' : ''}`}>
                                                    <button className="border-btn ripple"
                                                            onClick={this.handleModalWalletList}
                                                    >Cancel {this.state.isLoading}
                                                    </button>
                                                    <button className={`b-btn ripple`}
                                                            onClick={this.handleAddWallet}
                                                    >Add wallet
                                                    </button>
                                                </div>
                                            </>

                                        )}
                                </Modal>
                            </>
                        )}

                        {this.state.step === 1 && (
                            <>
                                {!this.state.isProcessing ? (
                                    <VerifyOtpForm initialValues={{otp_token: ''}}
                                                   isStep={false}
                                                   onCallback={this.onCallbackOTP}
                                                   isWithdraw={true}
                                                   onBack={false}
                                    />
                                ) : (
                                    <LoaderBlock/>
                                )}
                            </>
                        )}

                        {this.state.step === 2 && (
                            <>
                                {this.state.isProcessing && (
                                    <LoaderBlock/>
                                )}
                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"}
                                                messages={this.state.errorMessages}/>
                                )}
                            </>
                        )}

                        {this.state.step === 3 && (
                            <>
                                <div className="login__ico">
                                    <Image src="/img/check-ex.svg" width={38} height={26} alt="Check"/>
                                </div>
                                <div className="login__title">Transaction request was submitted</div>
                            </>
                        )}
                    </div>

                    {!this.state.isProcessing && (
                        <div className="login__bottom">
                            <p>
                                <i className="icon-chevron-left"/> <Link
                                className="login__link"
                                href=""
                                onClick={(event) => this.handleBack(event)}
                            >Back
                            </Link>
                            </p>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default AssetWithdrawForm;
