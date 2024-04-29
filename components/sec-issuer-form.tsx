import React from 'react';
import {ErrorMessage, Field, FieldProps, Form, Formik} from "formik";
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
import InputMask from "react-input-mask";
import {getYesNoTypeName, YesNoType} from "@/enums/yes-no-type";
import {UsaStates} from "usa-states";
import PhoneInputField from "@/components/phone-input-field";

const formSchema = Yup.object().shape({
    accession_number: Yup.string().required('Required').label('Accession Number'),
    is_primary_issuer: Yup.string().required('Required').label('Primary Issuer'),
    cik: Yup.string().required('Required').label('CIK'),
    entity_name: Yup.string().required('Required').label('Entity Name'),
    street1: Yup.string().required('Required').label('Street 1'),
    city: Yup.string().required('Required').label('City'),
    state: Yup.string().required('Required').label('State'),
    zip_code: Yup.string().required('Required').label('ZIP Code'),
    jurisdiction: Yup.string().required('Required').label('Jurisdiction'),
    entity_type: Yup.string().required('Required').label('Entity Type'),
    edgar_link_to_filling: Yup.string().url('Invalid URL').label('Edgars Link to filing'),
});

interface SECIssuerFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
    focusedInitialOfferingDate: any;

    usaStates: {
        abbreviation: string;
        name: string;
    }[],
}

interface SECIssuerFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISECIssuer | null;
    symbolData: ISymbol | null;
    onCancel?: () => void;
}

class SECIssuerForm extends React.Component<SECIssuerFormProps, SECIssuerFormState> {

    state: SECIssuerFormState;
    host = `${window.location.protocol}//${window.location.host}`;

    constructor(props: SECIssuerFormProps) {
        super(props);

        const initialData = this.props.data || {} as ISECIssuer;

        const initialValues: {
            symbol: string
            accession_number: string;
            is_primary_issuer: string;
            cik: string;
            entity_name: string;
            street1: string;
            street2: string;
            city: string;
            state: string;
            zip_code: string;
            phone_number: string;
            jurisdiction: string;
            entity_type: string;
            year_of_financial_value: string;
            edgar_link_to_filling: string;
        } = {
            symbol: this.props.symbolData?.symbol || '',
            accession_number: initialData?.accession_number || '',
            is_primary_issuer: initialData?.is_primary_issuer || '',
            cik: initialData?.cik || '',
            entity_name: initialData?.entity_name || '',
            street1: initialData?.street1 || '',
            street2: initialData?.street2 || '',
            city: initialData?.city || '',
            state: initialData?.state || '',
            zip_code: initialData?.zip_code || '',
            phone_number: initialData?.phone_number || '',
            jurisdiction: initialData?.jurisdiction || '',
            entity_type: initialData?.entity_type || '',
            year_of_financial_value: initialData?.year_of_financial_value || '',
            edgar_link_to_filling: initialData?.edgar_link_to_filling || '',
        };

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            isDeleting: false,
            focusedInitialOfferingDate: null,
            usaStates: usaStatesList,
        };

    }

    handleSubmit = async (values: ISECIssuer, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null})

        const request: Promise<any> = this.props.action == 'edit' ?
            formService.updateSECIssuer(values, this.props.data?.id || 0) :
            formService.createSECIssuer(values)

        await request
            .then(((res: any) => {
                this.props.onCallback('secIssuer');
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
        await formService.deleteSECIssuer(this.props.data?.id || 0)
            .then(((res: any) => {
                this.props.onCallback('secIssuer');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    cancel = () => {
        this.props.onCallback('secIssuer');
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
                                <Formik<ISECIssuer>
                                    initialValues={this.state.formInitialValues as ISECIssuer}
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
                                                    <div className="input__title">Accession Number <i>*</i>
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="accession_number"
                                                            id="accession_number"
                                                            render={({field}: FieldProps<any>) => (
                                                                <InputMask
                                                                    {...field}
                                                                    mask="9999999999-99-999999"
                                                                    placeholder="Type Accession Number"
                                                                    className="input__text"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                />
                                                            )}
                                                        />
                                                        <ErrorMessage name="accession_number" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Primary Issuer <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="is_primary_issuer"
                                                            id="is_primary_issuer"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select</option>
                                                            {Object.values(YesNoType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {getYesNoTypeName(type)}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="is_primary_issuer"
                                                                      component="div"
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
                                                            placeholder={'Type CIK'}
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

                                                <div className="input">
                                                    <div className="input__title">Entity Name <i>*</i></div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="entity_name"
                                                            id="entity_name"
                                                            type="text"
                                                            placeholder={'Type Entity Name'}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="entity_name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Street 1 <i>*</i></div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="street1"
                                                            id="street1"
                                                            type="text"
                                                            placeholder={'Type Street 1'}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="street1" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Street 2</div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="street2"
                                                            id="street2"
                                                            type="text"
                                                            placeholder={'Type Street 2'}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="street2" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">City <i>*</i></div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="city"
                                                            id="city"
                                                            type="text"
                                                            placeholder={'Type City'}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="city" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">State <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="state"
                                                            id="state"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select State
                                                            </option>
                                                            {this.state.usaStates.map((state) => (
                                                                <option key={state.abbreviation}
                                                                        value={state.abbreviation}>
                                                                    {state.name} ({state.abbreviation})
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="state"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Zip Code <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="zip_code"
                                                            id="zip_code"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Zip Code"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="zip_code" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Phone Number <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="phone_number"
                                                            id="phone_number"
                                                            component={PhoneInputField}
                                                            disabled={isSubmitting || this.isShow()}
                                                            country="us"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Jurisdiction <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="jurisdiction"
                                                            id="jurisdiction"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Jurisdiction"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="jurisdiction" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Entity Type <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="entity_type"
                                                            id="entity_type"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Entity Type"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="jurisdiction" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Year of Financial Value
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="year_of_financial_value"
                                                            id="year_of_financial_value"
                                                            type="text"
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                            maxLength={4}
                                                            placeholder="Type Year of Financial Value"
                                                            isThousandSeparator={false}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="year_of_financial_value" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Edgars Link to filing</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="edgar_link_to_filling"
                                                            id="edgar_link_to_filling"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Edgars Link to filing"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="edgar_link_to_filling" component="div"
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

export default SECIssuerForm;
