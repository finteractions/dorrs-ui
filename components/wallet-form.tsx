import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {IUserAsset} from "@/interfaces/i-user-asset";
import ordersService from "@/services/orders/orders-service";
import walletAddressValidator from "@/services/wallet-address-validator/wallet-address-validator";


const initialValues = {
    asset: "",
    wallet_address: "",
    label: ""
};

interface WalletFormState extends IState {
}

interface WalletFormProps extends ICallback {
    userAsset: IUserAsset | null;
}


class WalletForm extends React.Component<WalletFormProps, WalletFormState> {

    userAsset: IUserAsset | null;
    state: WalletFormState;
    formSchema: Yup.ObjectSchema<any>;

    constructor(props: WalletFormProps) {
        super(props);

        this.userAsset = props.userAsset;

        this.state = {
            success: false,
        };

        let self = this;
        this.formSchema = Yup.object().shape({
            asset:
                Yup.string()
                    .required("Required"),
            wallet_address: Yup.string()
                .required("Required")
                .test("wallet_address", "Invalid wallet address", function (value) {
                    if (value) {
                        return walletAddressValidator.validate(value, self.userAsset?.asset?.label || '');
                    }
                    return true;
                }),
            label: Yup.string()
                .required("Required"),
        });

        initialValues.asset = this.userAsset?.asset?.label || '';
    }

    handleSubmit = async (values: Record<string, string>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null})

        await ordersService.createWithdrawAddress(values)
            .then((res: any) => {
                this.onCallback(values);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => setSubmitting(false))
    };

    onCallback(values: Record<string, string | boolean>) {
        this.props.onCallback(values);
    }

    render() {
        return (
            <Formik
                initialValues={initialValues}
                validationSchema={this.formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, isValid, dirty, errors}) => {
                    return (
                        <>
                            <Form>
                                <div className="input">
                                    <div className="input__title">Symbol <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="asset"
                                            id="asset"
                                            type="text"
                                            className="input__text"
                                            placeholder="Asset"
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Network <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            type="text"
                                            className="input__text"
                                            placeholder="Network"
                                            value={this.userAsset?.asset?.network}
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Wallet address <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="wallet_address"
                                            id="wallet_address"
                                            type="text"
                                            className="input__text"
                                            placeholder="Wallet address"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="wallet_address" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Label <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="label"
                                            id="label"
                                            type="text"
                                            className="input__text"
                                            placeholder="Label"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="label" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <button
                                    id="add-bank-acc"
                                    className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                    type="submit" disabled={isSubmitting || !isValid || !dirty}
                                >
                                    Add wallet
                                </button>

                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                )}

                            </Form>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default WalletForm;
