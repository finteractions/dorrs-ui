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

const formSchema = Yup.object().shape({
    figi: Yup.string().min(3).max(255).required('Required').label('FIGI'),
    name: Yup.string().min(3).max(255).required('Required').label('Name'),
    ticker: Yup.string().max(255).required('Required').label('Ticker'),
    exchange_code: Yup.string().max(255).required('Required').label('Exchange Code'),
    security_type: Yup.string().min(3).max(255).required('Required').label('Security Type'),
    market_sector: Yup.string().min(3).max(255).required('Required').label('Market Sector'),
    figi_composite: Yup.string().min(3).max(255).required('Required').label('FIGI Composite'),
    share_class: Yup.string().min(3).max(255).required('Required').label('Share Class')
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
            figi: string;
            name: string;
            ticker: string;
            exchange_code: string;
            security_type: string;
            market_sector: string;
            figi_composite: string;
            share_class: string;
        } = {
            figi: initialData?.figi || '',
            name: initialData?.name || '',
            ticker: initialData?.ticker || '',
            exchange_code: initialData?.exchange_code || '',
            security_type: initialData?.security_type || '',
            figi_composite: initialData?.figi_composite || '',
            market_sector: initialData?.market_sector || '',
            share_class: initialData?.share_class || '',
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
                                            <div className="input__title">FIGI <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="figi"
                                                    id="figi"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type FIGI"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="figi" component="div"
                                                              className="error-message"/>
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
                                            <div className="input__title">Ticker <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="ticker"
                                                    id="ticker"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Ticker"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="ticker" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <div className="input">
                                            <div className="input__title">Exchange Code <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="exchange_code"
                                                    id="exchange_code"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Exchange Code"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="exchange_code" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <div className="input">
                                            <div className="input__title">Security Type <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="security_type"
                                                    id="security_type"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Security Type"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="security_type" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <div className="input">
                                            <div className="input__title">Market Sector <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="market_sector"
                                                    id="market_sector"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Market Sector"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="market_sector" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <div className="input">
                                            <div className="input__title">FIGI Composite <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="figi_composite"
                                                    id="figi_composite"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type FIGI Composite"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="figi_composite" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <div className="input">
                                            <div className="input__title">Share Class <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="share_class"
                                                    id="share_class"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Share Class"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="share_class" component="div"
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
