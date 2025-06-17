import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import adminService from "@/services/admin/admin-service";
import AlertBlock from "@/components/alert-block";
import {IBalance} from "@/interfaces/i-balance";
import NumericInputField from "@/components/numeric-input-field";


const formSchema = Yup.object().shape({

    transaction_type: Yup.string().required('Required'),
    amount: Yup.number()
        .transform((value, originalValue) => {
            return Number(originalValue.toString().replace(/,/g, ''));
        })
        .required('Required').positive('Must be greater than 0').label('Amount'),
});

let initialValues = {
    transaction_type: "",
    amount: ""
};

interface BalanceFormState extends IState {
    isDeleting: boolean;
}

interface BalanceFormProps extends ICallback {
    action: string;
    data: IBalance | null;
    onCancel?: () => void;
}

class BalanceForm extends React.Component<BalanceFormProps, BalanceFormState> {

    state: BalanceFormState;

    constructor(props: BalanceFormProps) {
        super(props);

        this.state = {
            success: false,
            isDeleting: false
        };
    }

    handleSubmit = async (values: Record<string, string>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const data = {
            transaction_type: values.transaction_type,
            user_id: values.user_id,
            asset: values.asset,
            amount: Number(values.amount.toString().replace(/,/g, '')),
        }

        const request: Promise<any> = adminService.updateBalance(data);

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

    // handleDelete = async (values: any) => {
    //     this.setState({isDeleting: true});
    //     await adminService.deleteBalance(values.id)
    //         .then(((res: any) => {
    //             this.props.onCallback(values);
    //         }))
    //         .catch((errors: IError) => {
    //             this.setState({errorMessages: errors.messages});
    //         }).finally(() => {
    //             this.setState({isDeleting: false});
    //         });
    // };

    render() {
        const {id,...filteredData } = this.props?.data || {};

        return (
            <>
                {this.props.action !== 'delete' ? (
                    <Formik
                        initialValues={filteredData || initialValues}
                        validationSchema={formSchema}
                        onSubmit={this.handleSubmit}
                    >
                        {({isSubmitting, isValid, dirty}) => {
                            return (
                                <Form id="bank-accoun-form">
                                    <div className="input">
                                        <div className="input__title">Transaction Type <i>*</i></div>
                                        <div className="input__wrap">
                                            <Field
                                                name="transaction_type"
                                                id="transaction_type"
                                                as="select"
                                                className="b-select"
                                                disabled={isSubmitting}
                                            >
                                                <option value=''>Select Transaction Type</option>
                                                <option value='Deposit'>Deposit</option>
                                                <option value='Withdraw'>Withdraw</option>
                                            </Field>
                                            <ErrorMessage name="transaction_type" component="div"
                                                          className="error-message"/>
                                        </div>
                                    </div>
                                    <div className="input">
                                        <div className="input__title">Amount <i>*</i></div>
                                        <div className="input__wrap">
                                            <div className='input-group-panel'>
                                                <Field
                                                    name="amount"
                                                    id="amount"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Amount"
                                                    component={NumericInputField}
                                                    disabled={isSubmitting}
                                                />
                                                <div className='input-add'>{this.props.data?.asset}</div>
                                            </div>
                                                {/*<ErrorMessage name="amount" component="div"*/}
                                                {/*              className="error-message"/>*/}



                                        </div>
                                    </div>
                                    <button id="add-bank-acc"
                                        className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>{`${this.props.action === 'edit' ? 'Save' : 'Add'}`}
                                    </button>

                                    {this.state.errorMessages && (
                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                    )}
                                </Form>
                            );
                        }}
                    </Formik>
                ) : ( ''
                    // <div className="confirm-btns-panel">
                    //     {this.props?.onCancel && (
                    //         <button className="border-btn ripple"
                    //                 onClick={() => this.props.onCancel?.()}>Cancel</button>
                    //     )}
                    //     <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                    //             type="button" disabled={this.state.isDeleting}
                    //             onClick={() => this.handleDelete(this.props.data)}>Confirm
                    //     </button>
                    // </div>
                )}
            </>
        );
    }
}

export default BalanceForm;
