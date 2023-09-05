import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import FormValidator from "@/services/form-validator/form-validator";
import PhoneInputField from "@/components/phone-input-field";
import {countries} from "countries-list";
import {UsaStates} from 'usa-states';
import {ANNUAL_FEES} from "@/constants/annual-fees";
import clientService from "@/services/client/client-service";
import {FormStatus} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    region: Yup.string().uppercase().required('Required').label('Region Information'),
    state: Yup.string().uppercase().required('Required').label('State'),
    is_finra: Yup.boolean().label('FINRA'),
    crd: Yup.string().min(3).max(12).required('Required').label('CRD'),
    company_name: Yup.string().min(3).max(99).required('Required').label('Legal Company Name'),
    email: Yup.string().email("Invalid email").label('Email Address').required("Required"),
    mobile_number: FormValidator.phoneNumberField,
    address1: Yup.string().min(3).max(99).required('Required').label('Address 1'),
    address2: Yup.string().min(3).max(99).label('Address 2'),
    city: Yup.string().min(3).max(99).required('Required').label('City'),
    zip_code: Yup.string().min(3).max(99).required('Required').label('ZIP code'),
    country: Yup.string().required('Required').label('Country'),
    annual_fees: Yup.string().required('Required').label('Annual Fees'),
});

interface MembershipFormState extends IState {
    formInitialValues: {},
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    selectedCountry: string;
    isFinra: boolean;
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
}

interface MembershipFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: IMembershipForm | null;
    onCancel?: () => void;
}

class MembershipForm extends React.Component<MembershipFormProps, MembershipFormState> {

    state: MembershipFormState;

    commentTextarea = React.createRef<HTMLTextAreaElement>();

    constructor(props: MembershipFormProps) {
        super(props);
        const initialData = this.props.data || {} as IMembershipForm;

        const initialValues: {
            region: string;
            state: string;
            is_finra: boolean;
            crd: string;
            company_name: string;
            email: string;
            mobile_number: string;
            address1: string;
            address2: string;
            city: string;
            zip_code: string;
            country: string;
            annual_fees: string;
        } = {
            region: initialData?.region || selectedCountry,
            state: initialData?.state || "",
            is_finra: initialData?.is_finra || false,
            crd: initialData?.crd || "",
            company_name: initialData?.company_name || "",
            email: initialData?.email || "",
            mobile_number: initialData?.mobile_number || "",
            address1: initialData?.address1 || "",
            address2: initialData?.address2 || "",
            city: initialData?.city || "",
            zip_code: initialData?.zip_code || "",
            country: initialData?.country || "",
            annual_fees: initialData?.annual_fees || "",
        };

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            formInitialValues: initialValues,
            usaStates: usaStatesList,
            selectedCountry: selectedCountry,
            isFinra: false,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false
        };

    }

    handleSubmit = async (values: Record<string, string | boolean | null>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        values.name = 'membership';

        const request: Promise<any> = this.props.action == 'edit' ?
            clientService.updateUserForm(values, this.props.data?.id || 0) :
            clientService.createUserForm(values);

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

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedRegion = e.target.value;
        setFieldValue("region", selectedRegion);
        setFieldValue("state", "");
        this.setState({selectedCountry: selectedRegion});
    };

    handleFinraChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isFinra = e.target.value === 'false';
        setFieldValue("is_finra", isFinra);
        this.setState({isFinra: isFinra});
    };

    handleApprove = async (values: any, comment: string) => {
        this.setState({loading: true});

        await adminService.approveMembershipForm(values.id, this.state.isApproving || false, comment)
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading:false}))
    };

    render() {

        return (
            <>

                {this.state.loading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <Formik
                            initialValues={this.state.formInitialValues}
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
                                                                Status: {this.props.data?.status}
                                                            </>
                                                        </div>

                                                        {this.props.data?.comment && (
                                                            <div className="approve-form-comment">
                                                                <div className="approve-form-comment-text-panel">
                                                                    <div className="approve-form-comment-text-title">Comment:
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
                                                                    <div className='approve-form-confirm-title mb-2'>Are you
                                                                        sure
                                                                        you want
                                                                        to {this.state.isApproving ? 'approve' : 'reject'}?
                                                                    </div>
                                                                    <button className={`b-btn ripple`} type="button"
                                                                            onClick={() => this.handleApprove(this.props.data, this.commentTextarea?.current?.value ?? '')}>Confirm
                                                                    </button>
                                                                    <button className={`border-btn ripple`} type="button"
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
                                                                    <button className={`border-btn ripple`} type="button"
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
                                            <div className="input__title">Region Information <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="region"
                                                    id="region"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting || this.isShow()}
                                                    onChange={(e: any) => this.handleRegionChange(e, setFieldValue)}
                                                >
                                                    <option value="">Select a Region</option>
                                                    {Object.keys(countries).map((countryCode: string) => (
                                                        <option key={countryCode} value={countryCode}>
                                                            {countries[countryCode as keyof typeof countries]?.name}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="region" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        {this.state.selectedCountry === selectedCountry && (
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
                                                        <option value="">Select a State</option>
                                                        {this.state.usaStates.map((state) => (
                                                            <option key={state.abbreviation} value={state.abbreviation}>
                                                                {state.name}
                                                            </option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name="state" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                        )}

                                        <div className="input">
                                            <div
                                                className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    type="checkbox"
                                                    name="is_finra"
                                                    id="is_finra"
                                                    disabled={isSubmitting || this.isShow()}
                                                    onClick={(e: any) => this.handleFinraChange(e, setFieldValue)}
                                                />
                                                <label htmlFor="is_finra">
                                                    <span></span><i> FINRA Member
                                                </i>
                                                </label>
                                                <ErrorMessage name="agreement" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>


                                        {this.state.isFinra && (
                                            <div className="input">
                                                <div className="input__title">MPID</div>
                                                <div
                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                    <Field
                                                        name="mpid"
                                                        id="mpid"
                                                        type="text"
                                                        className="input__text"
                                                        placeholder="Type MPID"
                                                        disabled={isSubmitting || this.isShow()}
                                                    />
                                                    <ErrorMessage name="mpid" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                        )}
                                        <div className="input">
                                            <div className="input__title">CRD#</div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="crd"
                                                    id="crd"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type CRD#"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="crd" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Legal name of the company <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="company_name"
                                                    id="company_name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type a Company Name"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="mpid" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Email Address <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="email"
                                                    id="email"
                                                    type="email"
                                                    className="input__text input-class-3"
                                                    placeholder="Type an Email Address"
                                                    autoComplete="username"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="email" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Phone Number <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="mobile_number"
                                                    id="mobile_number"
                                                    component={PhoneInputField}
                                                    disabled={isSubmitting || this.isShow()}
                                                    country="us"
                                                />
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title"><span
                                                className="strong">Primary Address</span></div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Address 1 <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="address1"
                                                    id="address1"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type an Address 1"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="address1" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Address 2 (optional)</div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="address2"
                                                    id="address2"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type an Address 2"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="address2" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">City <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="city"
                                                    id="city"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type a City"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="city" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">ZIP code <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="zip_code"
                                                    id="zip_code"
                                                    type="text"
                                                    className="input__text input-class-4"
                                                    placeholder="Type a ZIP code"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                <ErrorMessage name="house_number" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Country <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="country"
                                                    id="country"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting || this.isShow()}
                                                >
                                                    <option value="">Select a Country</option>
                                                    {Object.keys(countries).map((countryCode: string) => (
                                                        <option key={countryCode} value={countryCode}>
                                                            {countries[countryCode as keyof typeof countries]?.name}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="country" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Annual fees <i>*</i></div>
                                            <div className="modal-terms mb-10px">
                                        <span
                                            className="list-head">The annual fee for {process.env.APP_TITLE} membership is based on the level of contribution to the plan. There are three levels of membership by Firm Size:<br/>A Large, B Medium, C Small:</span>
                                            </div>
                                            <div className="input">
                                                <div
                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                    <Field
                                                        name="annual_fees"
                                                        id="annual_fees"
                                                        as="select"
                                                        className="b-select"
                                                        disabled={isSubmitting || this.isShow()}
                                                    >
                                                        <option value="">Select an Annual Fees</option>
                                                        {ANNUAL_FEES.map(fees => (
                                                            <option value={fees.level}
                                                                    key={fees.level}>{fees.level}: {fees.budget}</option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name="annual_fees" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                        </div>

                                        {this.props.action !== 'view' && (
                                            <button id="add-bank-acc"
                                                    className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                    type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                Save Membership Form
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
