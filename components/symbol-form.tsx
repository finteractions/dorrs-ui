import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {FormStatus} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {ISymbol} from "@/interfaces/i-symbol";
import symbolService from "@/services/symbol/symbol-service";

const allowedExt = ['png', 'jpg', 'jpeg'];
const allowedFileSizeMB = 1
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;

const formSchema = Yup.object().shape({
    name: Yup.string().min(3).max(255).required('Required').label('Name'),
    code: Yup.string().min(3).max(255).required('Required').label('Label'),
    network: Yup.string().min(3).max(255).required('Required').label('Network'),
    currency_type: Yup.string().min(3).max(255).required('Required').label('Currency Type'),
    fee: Yup.number().typeError("Invalid Fee").required('Required').label('Fee'),
    last_price: Yup.number().typeError("Invalid Last Price").required('Required').label('Last Price'),
    active: Yup.string().required('Required').label('Active'),
    image: Yup.mixed()
        .test('image', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('image', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
});

interface SymbolFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    selectedFile: File | null;
}

interface SymbolFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISymbol | null;
    onCancel?: () => void;
}

class MembershipForm extends React.Component<SymbolFormProps, SymbolFormState> {

    state: SymbolFormState;

    commentTextarea = React.createRef<HTMLTextAreaElement>();

    constructor(props: SymbolFormProps) {
        super(props);

        const initialData = this.props.data || {} as ISymbol;

        const initialValues: {
            name: string;
            code: string;
            network: string;
            currency_type: string;
            fee: string;
            last_price: string;
            active: string;
            image: string;
        } = {
            name: initialData?.name || '',
            code: initialData?.code || '',
            network: initialData?.network || '',
            currency_type: initialData?.currency_type || '',
            fee: (initialData?.fee || '').toString(),
            last_price: (initialData?.last_price || '').toString(),
            active: (initialData?.active || '').toString(),
            image: initialData?.image || ''
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            selectedFile: null,
        };

    }

    handleSubmit = async (values: ISymbol, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const formData = new FormData();

        if (this.state.selectedFile) {
            formData.append('image', this.state.selectedFile);
        }

        Object.entries(values).forEach(([key, value]) => {
            console.log(key, value);
            formData.append(key, value);
        });

        const request: Promise<any> = this.props.action == 'edit' ?
            symbolService.updateSymbol(formData, this.props.data?.id || 0) :
            symbolService.createSymbol(formData);

        await request
            .then(((res: any) => {
                this.props.onCallback(formData);
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

    handleApprove = async (values: any, comment: string) => {
        this.setState({loading: true});

        await adminService.approveMembershipForm(values.id, this.state.isApproving || false, comment)
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

    handleFile = (event: any) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    }

    render() {

        return (
            <>

                {this.state.loading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <Formik<ISymbol>
                            initialValues={this.state.formInitialValues as ISymbol}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                return (
                                    <Form id="bank-form">
                                        {this.props.isAdmin && (
                                            <div className='approve-form'>
                                                {this.props.data?.status.toLowerCase() === FormStatus.APPROVED.toLowerCase() ? (
                                                    <>
                                                        <div className='approve-form-text'>
                                                            <>
                                                                Status: {this.props.data?.status} by {this.props.data?.approved_by || ''} at {formatterService.dateTimeFormat(this.props.data?.approved_date_time || '')}
                                                            </>
                                                        </div>

                                                        {this.props.data?.comment && (
                                                            <div className="approve-form-comment">
                                                                <div className="approve-form-comment-text-panel">
                                                                    <div
                                                                        className="approve-form-comment-text-title">Comment:
                                                                    </div>
                                                                    <div className="approve-form-comment-text-message"
                                                                         title={this.props.data?.comment}>{this.props.data?.comment}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div
                                                            className='approve-form-text'>Status: {this.props.data?.status}</div>
                                                        <div className='approve-form-confirm'>
                                                            {this.state.isConfirmedApproving ? (
                                                                <>
                                                                    <div className='approve-form-confirm-title mb-2'>Are
                                                                        you sure you want
                                                                        to {this.state.isApproving ? 'approve' : 'reject'}?
                                                                    </div>
                                                                    <button className={`b-btn ripple`} type="button"
                                                                            onClick={() => this.handleApprove(this.props.data, this.commentTextarea?.current?.value ?? '')}>Confirm
                                                                    </button>
                                                                    <button className={`border-btn ripple`}
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: false,
                                                                                isApproving: null
                                                                            })}>Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button className={`b-btn ripple`} type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: true,
                                                                                isApproving: true
                                                                            })}>Approve
                                                                    </button>
                                                                    <button className={`border-btn ripple`}
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: true,
                                                                                isApproving: false
                                                                            })}>Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                        {this.state.isConfirmedApproving && (
                                                            <div className="approve-form-comment">
                                            <textarea ref={this.commentTextarea}
                                                      placeholder={`Comment about "${this.state.isApproving ? 'Approve' : 'Reject'}" status set reason`}
                                                      rows={5}/>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <div className="input">
                                            <div className="input__title">Image</div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <input
                                                    name="image"
                                                    id="image"
                                                    type="file"
                                                    className="input__file"
                                                    accept={'.' + allowedExt.join(',.')}
                                                    disabled={isSubmitting || this.isShow()}
                                                    onChange={(event) => {
                                                        setFieldValue(event.target.name, event.target?.files?.[0] || '');
                                                        this.handleFile(event);
                                                    }}
                                                />
                                                {errors.image && (
                                                    <div className="error-message">{errors.image.toString()}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Name <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="name"
                                                    id="name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Name"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="name" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Code <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="code"
                                                    id="code"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Code"
                                                    disabled={isSubmitting || this.isShow()}
                                                    onBlur={(e: any) => {
                                                        const {name, value} = e.target;
                                                        setFieldValue(name, value.toUpperCase());
                                                    }}
                                                />
                                                <ErrorMessage name="code" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Network <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="network"
                                                    id="network"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Network"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="network" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Currency Type <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="currency_type"
                                                    id="currency_type"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting || this.isShow()}
                                                >
                                                    <option value=''>Select Currency Type</option>
                                                    <option value='FIAT'>FIAT</option>
                                                    <option value='CRYPTO'>CRYPTO</option>
                                                </Field>
                                                <ErrorMessage name="currency_type" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Fee <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="fee"
                                                    id="fee"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Fee"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="fee" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Last Price <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="last_price"
                                                    id="last_price"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Last Price"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="last_price" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Active <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="active"
                                                    id="active"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting || this.isShow()}
                                                >
                                                    <option value=''>Select Active</option>
                                                    <option value='true'>Yes</option>
                                                    <option value='false'>No</option>
                                                </Field>
                                                <ErrorMessage name="active" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        {this.props.action !== 'view' && (
                                            <button id="add-bank-acc"
                                                    className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                    type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                Save Symbol
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

export default MembershipForm;
