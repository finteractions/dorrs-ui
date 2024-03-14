import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import FormValidator from "@/services/form-validator/form-validator";
import PhoneInputField from "@/components/phone-input-field";
import {countries} from "countries-list";
import {UsaStates} from 'usa-states';
import {ANNUAL_FEES} from "@/constants/annual-fees";
import formService from "@/services/form/form-service";
import {FormStatus} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {CustomerType, getCustomerTypeDescription, getCustomerTypeName} from "@/enums/customer-type";
import Link from "next/link";
import downloadFile from "@/services/download-file/download-file";
import {PARTICIPANT_AGREEMENT} from "@/constants/settings";

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    state: Yup.string()
        .when('country', {
            is: (v: string) => v === selectedCountry,
            then: (schema) => schema.required('Required')
        }),
    is_finra: Yup.boolean().label('FINRA'),
    mpid: Yup.string().min(3).max(12).label('MPID')
        .when('is_finra', {
            is: (v: boolean) => v,
            then: (schema) => schema.required('Required')
        }),
    crd: Yup.string().min(16).max(16).label('CRD')
        .when('is_finra', {
            is: (v: boolean) => v,
            then: (schema) => schema.required('Required')
        }),
    company_name: Yup.string().min(3).max(50).required('Required').label('Legal Company Name'),
    email: Yup.string().email("Invalid email").label('Email Address').required("Required"),
    mobile_number: FormValidator.phoneNumberField,
    address1: Yup.string().min(3).max(50).required('Required').label('Address 1'),
    address2: Yup.string().min(3).max(50).label('Address 2'),
    city: Yup.string().min(3).max(50).required('Required').label('City'),
    zip_code: Yup.string().min(3).max(50).required('Required').label('ZIP code'),
    country: Yup.string().required('Required').label('Country'),
    annual_fees: Yup.string().required('Required').label('Annual Fees'),
    customer_type: Yup.string().required('Required').label('Customer'),
    firm: Yup.string(),
    create_firm: Yup.boolean().when('firm', {
        is: (firm: any) => !firm || firm.trim() === '',
        then: (schema) => schema.oneOf([true], 'You must accept'),
    }),
});

interface MembershipFormState extends IState {
    formInitialValues: {},
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    isFinra: boolean;
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    selectedCountry: string;
    selectedCompany: ICompanySearch | null
    availableCompanies: ICompanySearch[] | [],
    availableCompaniesLoading: boolean

}

interface MembershipFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: IMembership | null;
    onCancel?: () => void;
}

class MembershipForm extends React.Component<MembershipFormProps, MembershipFormState> {

    state: MembershipFormState;

    commentTextarea = React.createRef<HTMLTextAreaElement>();

    constructor(props: MembershipFormProps) {
        super(props);
        const initialData = this.props.data || {} as IMembership;

        const initialValues: {
            state: string;
            is_finra: boolean;
            mpid: string;
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
            customer_type: string;
            firm: string;
            create_firm: boolean;
        } = {
            state: initialData?.state || "",
            is_finra: initialData?.is_finra || false,
            mpid: initialData?.mpid || "",
            crd: initialData?.crd || "",
            company_name: initialData?.company_name || "",
            email: initialData?.email || "",
            mobile_number: initialData?.mobile_number || "",
            address1: initialData?.address1 || "",
            address2: initialData?.address2 || "",
            city: initialData?.city || "",
            zip_code: initialData?.zip_code || "",
            country: initialData?.country || selectedCountry,
            annual_fees: initialData?.annual_fees || "",
            firm: initialData?.firm || "",
            customer_type: initialData?.customer_type || "",
            create_firm: !!initialData?.company_name
        };

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            formInitialValues: initialValues,
            usaStates: usaStatesList,
            selectedCountry: initialValues.country,
            isFinra: initialValues.is_finra,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            availableCompanies: [],
            selectedCompany: null,
            availableCompaniesLoading: false,
        };

    }

    handleSubmit = async (values: IMembership, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const request: Promise<any> = this.props.action == 'edit' ?
            formService.updateMembershipForm(values, this.props.data?.id || 0) :
            formService.createMembershipForm(values);

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
        setFieldValue("country", selectedRegion);
        setFieldValue("state", "");
        this.setState({selectedCountry: selectedRegion});
    };

    handleFinraChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isFinra = e.target.value === 'false';
        setFieldValue("is_finra", isFinra);
        setFieldValue("mpid", "");
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
            .finally(() => this.setState({loading: false}))
    };

    handleCompanySearch = async (values: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        if (values.company_name && !this.state.selectedCompany) {
            this.setState({availableCompaniesLoading: true});
            await formService.searchCompany(values.company_name)
                .then((res: Array<ICompanySearch>) => {
                    if (res.length === 1 && res[0].name === values.company_name) {
                        this.handleSetSearchedCompany(res[0], setFieldValue);
                    } else {
                        this.setState({availableCompanies: res});
                    }

                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                })
                .finally(() => {
                    this.setState({availableCompaniesLoading: false});
                });
        }
    }

    handleSetSearchedCompany = (item: ICompanySearch, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        this.setState({availableCompanies: [], selectedCompany: item}, () => {
            setFieldValue('company_name', item.name);
            setFieldValue('firm', item.id);
        });
    }

    handleResetSearchedCompany = (value: string, values: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        setFieldValue('company_name', value);

        if (value !== this.state.selectedCompany?.name) {
            setFieldValue('firm', '');
            this.setState({availableCompanies: [], selectedCompany: null});
        }
    }

    render() {

        return (
            <>

                {this.state.loading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <Formik<IMembership>
                            initialValues={this.state.formInitialValues as IMembership}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, setFieldValue, isValid, dirty, values, errors, validateField}) => {
                                return (
                                    <Form id="bank-form">
                                        {this.props.isAdmin && (
                                            <div className='approve-form'>
                                                {this.props.data?.created_by && (
                                                    <div
                                                        className={`approve-form-text w-100 ${this.props.data?.created_by ? 'pb-1' : ''}`}>
                                                        <>
                                                            Created
                                                            by {this.props.data?.created_by} at {formatterService.dateTimeFormat(this.props.data?.created_date_time || '')}
                                                        </>
                                                    </div>
                                                )}

                                                {this.props.data?.status.toLowerCase() === FormStatus.APPROVED.toLowerCase() ? (
                                                    <>
                                                        <div
                                                            className={`approve-form-text w-100 ${this.props.data?.created_by ? 'pt-1' : ''}`}>
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
                                                                        to {this.state.isApproving ? 'approve' : 'reject'}
                                                                        {this.state.isApproving && !this.props.data?.firm && (
                                                                            <span
                                                                                className='company_text'> (company &quot;{this.props.data?.company_name}&quot; will be created) </span>
                                                                        )}?

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
                                            <div
                                                className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? ' disable' : ''}`}>
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
                                                <ErrorMessage name="is_finra" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>


                                        {this.state.isFinra && (
                                            <>
                                                <div className="input">
                                                    <div className="input__title">MPID <i>*</i></div>
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
                                                <div className="input">
                                                    <div className="input__title">CRD# <i>*</i></div>
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
                                            </>

                                        )}

                                        <div className="input">
                                            <div className="input__title">Legal name of the company <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(this.state.availableCompaniesLoading || isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="company_name"
                                                    id="company_name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type a Company Name"
                                                    onBlur={() => {
                                                        this.handleCompanySearch(values, setFieldValue);
                                                    }}
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        this.handleResetSearchedCompany(event.target.value, values, setFieldValue)
                                                    }}
                                                    disabled={this.state.availableCompaniesLoading || isSubmitting || this.isShow()}
                                                />
                                                <Field
                                                    name="firm"
                                                    id="firm"
                                                    type="hidden"
                                                    disabled={isSubmitting || this.isShow()}
                                                />
                                                {this.props.action === 'add' && !this.state.selectedCompany && (
                                                    <div
                                                        className={`mt-2 b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="create_firm"
                                                            id="create_firm"
                                                            disabled={this.state.availableCompaniesLoading || isSubmitting || this.isShow()}
                                                        />
                                                        <label htmlFor="create_firm">
                                                            <span></span><i> I want to create a new company
                                                        </i>
                                                        </label>
                                                        <ErrorMessage name="create_firm" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                )}

                                                <div className="input__wrap__search_company">
                                                    {this.state.availableCompanies.map((item: ICompanySearch) => (
                                                        <button
                                                            disabled={this.state.availableCompaniesLoading || isSubmitting || this.isShow()}
                                                            className="b-btn ripple search_company_item"
                                                            onClick={() => this.handleSetSearchedCompany(item, setFieldValue)}
                                                            key={item.id}>{item.name}</button>
                                                    ))}
                                                </div>

                                                <ErrorMessage name="company_name" component="div"
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
                                                            <option key={state.abbreviation}
                                                                    value={state.abbreviation}>
                                                                {state.name} ({state.abbreviation})
                                                            </option>
                                                        ))}
                                                    </Field>
                                                    <ErrorMessage name="state" component="div"
                                                                  className="error-message"/>
                                                </div>
                                            </div>
                                        )}

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
                                                <ErrorMessage name="zip_code" component="div"
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
                                                    onChange={(e: any) => this.handleRegionChange(e, setFieldValue)}
                                                >
                                                    <option value="">Select a Country</option>
                                                    {Object.keys(countries)
                                                        .sort((a, b) => countries[a as keyof typeof countries]?.name.localeCompare(countries[b as keyof typeof countries]?.name))
                                                        .map((countryCode: string) => (
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
                                            className="list-head">The annual fee for {process.env.APP_TITLE} membership is based on the level of contribution to the plan. There are three levels of membership by Firm Size:<br/>A Large, B Medium, C Small, D Extra Small:</span>
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
                                        <div className="input">
                                            <div className="input__title">Customer <i>*</i></div>
                                            <div
                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                <Field
                                                    name="customer_type"
                                                    id="customer_type"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting || this.isShow()}
                                                >
                                                    <option value="">Select a Customer</option>
                                                    {Object.values(CustomerType).map((customer: string) => (
                                                        <option key={customer} value={customer}>
                                                            {getCustomerTypeName(customer as CustomerType)}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="customer_type" component="div"
                                                              className="error-message"/>
                                            </div>
                                            {values?.customer_type && (
                                                <>
                                                    <div className={'mt-2 text-justify'}>
                                                        <span className={'list-head'}>
                                                            {getCustomerTypeDescription(values.customer_type as CustomerType)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className={'list-head'}>Please complete this <Link
                                                            className="link"
                                                            href=""
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile.PDF(PARTICIPANT_AGREEMENT)
                                                            }}
                                                            download
                                                        >
                                                            form
                                                        </Link></span>
                                                    </div>
                                                    <div className={'mt-2'}>
                                                        <span className={'list-head'}>Please note: The DORRS signature area
                                                            should be
                                                            left
                                                            blank.</span>
                                                    </div>
                                                    <div className={'mt-2'}>
                                                        <span className={'list-head'}>Return the electronic form by emailing it
                                                            to <Link className={'link'}
                                                                     href={'mailto:info@dorrs.io'}>info@dorrs.io</Link></span>
                                                    </div>
                                                </>

                                            )}
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
