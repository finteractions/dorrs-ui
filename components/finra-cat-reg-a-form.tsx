import React from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {FormStatus} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {ISymbol} from "@/interfaces/i-symbol";
import formService from "@/services/form/form-service";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import NumericInputField from "@/components/numeric-input-field";

const formSchema = Yup.object().shape({
    issuer_name: Yup.string().required('Required').label('Issuer Name'),
});

interface FINRACatRegAFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
    focusedInitialOfferingDate: any;
}

interface FINRACAtRegAFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: IFINRACatRegA | null;
    symbolData: ISymbol | null;
    onCancel?: () => void;
}

class FINRACatRegAForm extends React.Component<FINRACAtRegAFormProps, FINRACatRegAFormState> {

    state: FINRACatRegAFormState;
    host = `${window.location.protocol}//${window.location.host}`;

    constructor(props: FINRACAtRegAFormProps) {
        super(props);

        const initialData = this.props.data || {} as IFINRACatRegA;

        const initialValues: {
            symbol: string;
            issuer_name: string;
            listing: string;
            ats_and_exchange: string;
            cik: string;
        } = {
            symbol: this.props.symbolData?.symbol || '',
            issuer_name: initialData?.issuer_name || '',
            listing: initialData?.listing || '',
            ats_and_exchange: initialData?.ats_and_exchange || '',
            cik: initialData?.cik || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            isDeleting: false,
            focusedInitialOfferingDate: null,
        };

    }

    handleSubmit = async (values: IFINRACatRegA, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null})

        const request: Promise<any> = this.props.action == 'edit' ?
            formService.updateFINRARegA(values, this.props.data?.id || 0) :
            formService.createFINRARegA(values)

        await request
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                console.log(errors)
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        const request: Promise<any> = adminService.approveCompanyProfile(values.id, this.state.isApproving || false)

        await request
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

    handleDelete = async (values: IFINRACatRegA, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});
        await formService.deleteFINRARegA(this.props.data?.id || 0)
            .then(((res: any) => {
                this.props.onCallback(null)
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    cancel = () => {
        this.props.onCallback(null)
    }

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
                                <Formik<IFINRACatRegA>
                                    initialValues={this.state.formInitialValues as IFINRACatRegA}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="company-profile-form">
                                                {this.props.isAdmin && this.props.action !== 'add' && (
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
                                                                            <div
                                                                                className='approve-form-confirm-title mb-2'>Are
                                                                                you sure you want
                                                                                to {this.state.isApproving ? 'approve' : 'reject'}?
                                                                            </div>
                                                                            <button className={`b-btn ripple`}
                                                                                    type="button"
                                                                                    onClick={() => this.handleApprove(this.props.data)}>Confirm
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
                                                                            <button className={`b-btn ripple`}
                                                                                    type="button"
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
                                                            </>
                                                        )}
                                                    </div>
                                                )}


                                                <div className="input">
                                                    <div className="input__title">Issue Name <i>*</i>
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="issuer_name"
                                                            id="issuer_name"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="issuer_name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Listing
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="listing"
                                                            id="listing"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="listing" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">TS & Exchange
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="ats_and_exchange"
                                                            id="ats_and_exchange"
                                                            type="text"
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="ats_and_exchange" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">CIK
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="cik"
                                                            id="cik"
                                                            type="text"
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                            maxLength={10}
                                                            isThousandSeparator={false}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="ats_and_exchange" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                {this.props.action !== 'view' && (
                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save
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
                        )
                        }


                    </>
                )
            case 'delete':
                return (
                    <>
                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<IFINRACatRegA>
                                    initialValues={this.state.formInitialValues as IFINRACatRegA}
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
        }


    }
}

export default FINRACatRegAForm;
