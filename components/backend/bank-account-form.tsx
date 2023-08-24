import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import adminService from "@/services/admin/admin-service";
import AlertBlock from "@/components/alert-block";
import {CURRENCIES} from "@/constants/currencies";
import formatterService from "@/services/formatter/formatter-service";
import LoaderBlock from "@/components/loader-block";

const formSchema = Yup.object().shape({
    // currency: Yup.string().uppercase().required('Required'),
    beneficiary_name: Yup.string().min(3).max(99).required('Required').label('Account Name'),
    account_number: Yup.string().min(3).max(99).required('Required').label('Account Number'),
    iban: Yup.string().min(3).max(99).required('Required').label('IBAN'),
    swift: Yup.string().min(3).max(99).required('Required').label('SWIFT'),
    // bank_name: Yup.string().min(3).max(99).required('Required').label('Bank Name'),
    // bank_address: Yup.string().min(3).max(255).required('Required').label('Bank Address'),
    // active: Yup.string().required('Required'),
});

let initialValues = {
    beneficiary_name: "",
    currency: "",
    account_number: "",
    iban: "",
    swift: "",
    bank_name: "",
    bank_address: "",
    // active: "false"
};

interface BankAccountFormState extends IState {
    isDeleting: boolean;
    mode: string;
    isConfirmedApproving: boolean;
    isConfirmedRestoring: boolean;
    loading: boolean;
    data: IAdminBankAccount | null;
    isApproving: boolean | null;
}

interface BankAccountFormProps extends ICallback {
    action: string;
    data: IAdminBankAccount | null;
    onCancel?: () => void;
    updateModalTitle: (title:string) => void;
}

class BankAccountForm extends React.Component<BankAccountFormProps, BankAccountFormState> {
    commentTextarea = React.createRef<HTMLTextAreaElement>();
    state: BankAccountFormState;

    constructor(props: BankAccountFormProps) {
        super(props);

        this.state = {
            success: false,
            isDeleting: false,
            mode: this.props.action,
            isConfirmedApproving: false,
            isConfirmedRestoring: false,
            loading: false,
            data: this.props.data,
            isApproving: null
        };
    }

    handleApprove = async (values: any, comment: string) => {
        this.setState({loading: true});

        await adminService.approveBankAccount(values.id, this.state.isApproving || false, comment)
            .then(((res: any) => {
                this.props.onCallback(true);
                this.updateBankAccount()
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            });
    };

    updateBankAccount = () => {
        adminService.getBankAccount(this.state.data?.id || 0)
            .then((res: IAdminBankAccount) => {
                res.status = res.status.charAt(0).toUpperCase() + res.status.slice(1).toLowerCase();
                this.setState({data: res});
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({loading: false, isApproving: null, isConfirmedApproving: false, isConfirmedRestoring: false})
            });
    }

    handleSubmit = async (values: Record<string, any>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        const { id, approved_date_time, is_approved, approved_by, status, ...data } = values;
        const request: Promise<any> = adminService.updateBankAccount(this.replaceEmptyWithNullString(data), this.props.data?.id || 0)

        await request
            .then(((res: any) => {
                this.props.onCallback(false);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    handleDelete = async () => {
        // this.setState({isDeleting: true});
        // await adminService.deleteBankAccount(values.id)
        //     .then(((res: any) => {
        //         this.props.onCallback(false);
        //     }))
        //     .catch((errors: IError) => {
        //         this.setState({errorMessages: errors.messages});
        //     }).finally(() => {
        //         this.setState({isDeleting: false});
        //     });

        this.setState({isDeleting: true});

        const values: any = this.props.data;
        const { id, approved_date_time, is_approved, approved_by, status, comment, ...data } = values;
        data.deleted = true;

        const request: Promise<any> = adminService.updateBankAccount(this.replaceEmptyWithNullString(data), this.props.data?.id || 0)
        await request
            .then(((res: any) => {
                this.props.onCallback(false);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    };

    handleRestore = async () => {
        this.setState({loading: true});
        const values: any = this.props.data;
        const { id, approved_date_time, is_approved, approved_by, status, comment, ...data } = values;
        data.deleted = false;

        const request: Promise<any> = adminService.updateBankAccount(this.replaceEmptyWithNullString(data), this.props.data?.id || 0)
        await request
            .then(((res: any) => {
                this.props.onCallback(true);
                this.updateBankAccount();
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
    };

    handleEdit = (title: string) => {
        this.props.updateModalTitle(title);
        this.setState({mode: 'edit'})
    }

    replaceNullWithEmptyString = (obj: any) => {
        const replacedObj: any = {};
        for (const key in obj) {
            replacedObj[key] = obj[key] === null ? '' : obj[key];
        }
        return replacedObj;
    };

    replaceEmptyWithNullString = (obj: any) => {
        const replacedObj: any = {};
        for (const key in obj) {
            replacedObj[key] = obj[key] === '' ? null : obj[key];
        }
        return replacedObj;
    };

    render() {

        switch (this.state.mode) {
            case "add":
            case "edit":
                return (
                    <>
                        <Formik
                            initialValues={this.replaceNullWithEmptyString(this.props.data) || initialValues}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, isValid, dirty}) => {
                                return (
                                    <Form id="bank-accoun-form">
                                        <div className="input">
                                            <div className="input__title">Currency</div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="currency"
                                                    id="currency"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting}
                                                >
                                                    <option key="" value="">Select Currency</option>
                                                    {CURRENCIES.map(currency => (
                                                        <option value={currency.code}
                                                                key={currency.code}>{currency.name}</option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="currency" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Beneficiary Name <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="beneficiary_name"
                                                    id="beneficiary_name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Beneficiary Name"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="beneficiary_name" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Account Number <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="account_number"
                                                    id="account_number"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Account Number"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="account_number" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">IBAN <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="iban"
                                                    id="iban"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type IBAN"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="iban" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">SWIFT <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="swift"
                                                    id="swift"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type SWIFT"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="swift" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Bank Name</div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="bank_name"
                                                    id="bank_name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Bank Name"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="bank_name" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Bank Address</div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="bank_address"
                                                    id="bank_address"
                                                    as="textarea"
                                                    rows="5"
                                                    className="input__textarea"
                                                    placeholder="Type Bank Address"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="bank_address" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <button
                                            className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>{`${this.state.mode === 'edit' ? 'Save' : 'Add'}`}
                                        </button>

                                        {this.state.errorMessages && (
                                            <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                        )}
                                    </Form>
                                );
                            }}
                        </Formik>
                    </>
                )
            case "view":
                return (
                    <>
                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className='approve-form'>
                                {this.state.data?.status.toLowerCase() !== 'pending' ? (
                                    <>
                                        <div className='approve-form-text'>
                                            {this.state.data?.deleted ? (
                                                <>
                                                    Status: Deleted
                                                </>
                                            ):(
                                                <>
                                                    Status: {this.state.data?.status} by {this.state.data?.approved_by || ''} at {formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}
                                                </>
                                            )}
                                        </div>
                                        {this.state.data?.deleted && (
                                            <div className='approve-form-confirm'>
                                                {this.state.isConfirmedRestoring ? (
                                                    <>
                                                        <div className='approve-form-confirm-title mb-2'>Are you sure you want to restore?</div>
                                                        <button className={`b-btn ripple`} type="button" onClick={() => this.handleRestore()}>Confirm</button>
                                                        <button className={`border-btn ripple`} type="button" onClick={() => this.setState({isConfirmedRestoring: false})}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className={`b-btn ripple`} type="button" onClick={() =>  this.setState({isConfirmedRestoring: true}) }>Restore</button>
                                                    </>
                                                )}
                                            </div>
                                        )}


                                        {this.state.data?.comment && (
                                            <div className="approve-form-comment">
                                                <div className="approve-form-comment-text-panel">
                                                    <div className="approve-form-comment-text-title">Comment:</div>
                                                    <div className="approve-form-comment-text-message" title={this.state.data.comment}>{this.state.data.comment}</div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ):(
                                    <>
                                        <div className='approve-form-text'>Status: {this.state.data?.status}</div>
                                        <div className='approve-form-confirm'>
                                            {this.state.isConfirmedApproving ? (
                                                <>
                                                    <div className='approve-form-confirm-title mb-2'>Are you sure you want to {this.state.isApproving ? 'approve' : 'reject'}?</div>
                                                    <button className={`b-btn ripple`} type="button" onClick={() => this.handleApprove(this.state.data, this.commentTextarea?.current?.value ?? '')}>Confirm</button>
                                                    <button className={`border-btn ripple`} type="button" onClick={() => this.setState({isConfirmedApproving: false, isApproving: null})}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className={`b-btn ripple`} type="button" onClick={() =>  this.setState({isConfirmedApproving: true, isApproving: true }) }>Approve</button>
                                                    <button className={`border-btn ripple`} type="button" onClick={() =>  this.setState({isConfirmedApproving: true, isApproving: false}) }>Reject</button>
                                                </>
                                            )}
                                        </div>
                                        {this.state.isConfirmedApproving && (
                                            <div className="approve-form-comment">
                                                <textarea ref={this.commentTextarea} placeholder={`Comment about "${this.state.isApproving ? 'Approve' : 'Reject'}" status set reason`} rows={5}/>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className='view-form bank-account-view-form'>
                                <div className="view-form-box">
                                    <div className="box__title">User</div>
                                    <div className="box__wrap">{this.state.data?.user_id || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Currency</div>
                                    <div className="box__wrap">
                                        {CURRENCIES.filter(currency => currency.code === this.state.data?.currency).map(filteredCurrency => (
                                            <React.Fragment key={filteredCurrency.code}>
                                                {filteredCurrency.name}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Beneficiary Name</div>
                                    <div className="box__wrap">{this.state.data?.beneficiary_name || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Account Number</div>
                                    <div className="box__wrap">{this.state.data?.account_number || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">IBAN</div>
                                    <div className="box__wrap">{this.state.data?.iban || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">SWIFT</div>
                                    <div className="box__wrap">{this.state.data?.swift || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Bank Name</div>
                                    <div className="box__wrap">{this.state.data?.bank_name || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Bank Address</div>
                                    <div className="box__wrap">{this.state.data?.bank_address || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Approved</div>
                                    <div className="box__wrap">{this.state.data?.is_approved ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Approved By</div>
                                    <div className="box__wrap">{this.state.data?.approved_by || ''}</div>
                                </div>
                                <div className="view-form-box">
                                    <div className="box__title">Approved Date</div>
                                    <div className="box__wrap">{formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}</div>
                                </div>
                                <button className="w-100 b-btn ripple" onClick={() => this.handleEdit('Edit Bank Account') }>
                                    Edit
                                </button>
                            </div>
                        </>
                    )}

                    </>
                )
            case "delete":
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete()}>Confirm
                            </button>
                        </div>
                    </>
                )
        }
    }
}

export default BankAccountForm;
