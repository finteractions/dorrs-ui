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
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {countries} from "countries-list";
import PhoneInputField from "@/components/phone-input-field";
import {UsaStates} from "usa-states";
import UserImage from "@/components/user-image";
import slide3Img from "@/public/img/sl3.webp";
import Image from "next/image";
import NoDataBlock from "@/components/no-data-block";

const allowedFileSizeMB = 1
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;
const allowedExt = ['png', 'jpg', 'jpeg']

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required'),
    company_name: Yup.string().required('Required').label('Company Name'),
    logo_tmp: Yup.mixed()
        .test('logo_tmp', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('logo_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
});

interface CompanyProfileFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    selectedCountry: string;
    selectedFile: File | null;
}

interface CompanyProfileFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ICompanyProfile | null;
    symbolData: ISymbol | null;
    onCancel?: () => void;
}

class CompanyProfileForm extends React.Component<CompanyProfileFormProps, CompanyProfileFormState> {

    state: CompanyProfileFormState;

    constructor(props: CompanyProfileFormProps) {
        super(props);

        const initialData = this.props.data || {} as ICompanyProfile;

        const initialValues: {
            symbol: string;
            company_name: string;
            business_description: string;
            street_address_1: string;
            street_address_2: string;
            city: string;
            state: string;
            zip_code: string;
            country: string;
            phone: string;
            web_address: string;
            sic_industry_classification: string;
            incorporation_information: string;
            number_of_employees: string;
            company_officers_and_contacts: string;
            board_of_directors: string;
            product_and_services: string;
            company_facilities: string;
            transfer_agent: string;
            accounting_auditing_firm: string;
            investor_relations_marketing_communications: string;
            securities_counsel: string;
            us_reporting: string;
            edgar_cik: string;
            logo: string;
        } = {
            symbol: initialData?.symbol || this.props.symbolData?.symbol || '',
            company_name: initialData?.company_name || '',
            business_description: initialData?.business_description || '',
            street_address_1: initialData?.street_address_1 || '',
            street_address_2: initialData?.street_address_2 || '',
            city: initialData?.city || '',
            state: initialData?.state || '',
            zip_code: initialData?.zip_code || '',
            country: initialData?.country || '',
            phone: initialData?.phone || '',
            web_address: initialData?.web_address || '',
            sic_industry_classification: initialData?.sic_industry_classification || '',
            incorporation_information: initialData?.incorporation_information || '',
            number_of_employees: initialData?.number_of_employees || '',
            company_officers_and_contacts: initialData?.company_officers_and_contacts || '',
            board_of_directors: initialData?.board_of_directors || '',
            product_and_services: initialData?.product_and_services || '',
            company_facilities: initialData?.company_facilities || '',
            transfer_agent: initialData?.transfer_agent || '',
            accounting_auditing_firm: initialData?.accounting_auditing_firm || '',
            investor_relations_marketing_communications: initialData?.investor_relations_marketing_communications || '',
            securities_counsel: initialData?.securities_counsel || '',
            us_reporting: initialData?.us_reporting || '',
            edgar_cik: initialData?.edgar_cik || '',
            logo: initialData?.logo || '',
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
            usaStates: usaStatesList,
            selectedCountry: initialValues.country,
            selectedFile: null,
        };

    }

    handleSubmit = async (values: ICompanyProfile, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const formData = new FormData();
        for (const [key, value] of Object.entries(values)) {
            formData.append(key, value);
        }

        formData.delete('logo_tmp');
        formData.delete('logo');

        if (this.state.selectedFile) {
            formData.append('logo', this.state.selectedFile);
        }
        const request: Promise<any> = this.props.action == 'edit' ?
            !this.props?.isAdmin ? symbolService.updateCompanyProfile(formData, this.props.data?.id || 0) : adminService.updateCompanyProfile(formData, this.props.data?.id || 0) :
            !this.props?.isAdmin ? symbolService.createCompanyProfile(formData) : adminService.createCompanyProfile(formData);

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

    handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedRegion = e.target.value;
        setFieldValue("country", selectedRegion);
        setFieldValue("state", "");
        this.setState({selectedCountry: selectedRegion});
    };

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    };

    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
                return (
                    <>

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <Formik<ICompanyProfile>
                                    initialValues={this.state.formInitialValues as ICompanyProfile}
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

                                                {(this.isShow() && initialValues?.logo) && (
                                                    <div
                                                        className={"input d-flex justify-content-center company-profile-logo"}>
                                                        <img src={initialValues?.logo} alt="Logo"/>
                                                    </div>
                                                )}
                                                {!this.isShow() && (
                                                    <div className="input">
                                                        <div className="input__title">Logo</div>
                                                        <div className="input__wrap">
                                                            <input
                                                                id="logo_tmp"
                                                                name="logo_tmp"
                                                                type="file"
                                                                accept={'.' + allowedExt.join(',.')}
                                                                className="input__file"
                                                                disabled={isSubmitting}
                                                                onChange={(event) => {
                                                                    setFieldValue('logo_tmp', event.target?.files?.[0] || '');
                                                                    this.handleFileChange(event);
                                                                }}
                                                            />
                                                            {errors.logo_tmp && (
                                                                <div
                                                                    className="error-message">{errors.logo_tmp.toString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="input">
                                                    <div className="input__title">Symbol</div>
                                                    <div className="input__wrap">
                                                        {this.props.symbolData?.security_name} ({this.props.symbolData?.symbol})
                                                        <Field
                                                            name="symbol"
                                                            id="symbol"
                                                            type="hidden"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <div className="input__title">Company Name <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="company_name"
                                                            id="company_name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Company Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="company_name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Business Description</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="business_description"
                                                            id="business_description"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Business Description"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="business_description" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="itput__group">
                                                    <h4 className="input__group__title">Company Address:</h4>
                                                    <div className="input">
                                                        <div className="input__title">Street Address 1
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="street_address_1"
                                                                id="street_address_1"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Street Address 1"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="street_address_1" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Street Address 2
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="street_address_2"
                                                                id="street_address_2"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Street Address 2"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="street_address_2" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">City
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="city"
                                                                id="city"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type City"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="city" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Zip Code
                                                        </div>
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
                                                        <div className="input__title">Country</div>
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

                                                    {this.state.selectedCountry === selectedCountry && (
                                                        <div className="input">
                                                            <div className="input__title">State</div>
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
                                                        <div className="input__title">Phone
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="phone"
                                                                id="phone"
                                                                component={PhoneInputField}
                                                                disabled={isSubmitting || this.isShow()}
                                                                country="us"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">Web Address</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="web_address"
                                                            id="web_address"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Web Address"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="web_address" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="itput__group">
                                                    <h4 className="input__group__title">Company Profile Data</h4>
                                                    <div className="input">
                                                        <div className="input__title">SIC Industry Classification</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="sic_industry_classification"
                                                                id="sic_industry_classification"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type SIC Industry Classification"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="sic_industry_classification"
                                                                          component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Incorporation Information</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="incorporation_information"
                                                                id="incorporation_information"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Incorporation Information"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="incorporation_information"
                                                                          component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                    <div className="input">
                                                        <div className="input__title">Number of Employees</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="number_of_employees"
                                                                id="number_of_employees"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Number of Employees"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="number_of_employees" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">Company Officers & Contacts</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="company_officers_and_contacts"
                                                            id="company_officers_and_contacts"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Company Officers & Contacts"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="company_officers_and_contacts"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Board of Directors</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="board_of_directors"
                                                            id="board_of_directors"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Board of Directors"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="board_of_directors" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Product & Services</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="product_and_services"
                                                            id="product_and_services"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Product & Services"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="product_and_services" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Company Facilities</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="company_facilities"
                                                            id="company_facilities"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Company Facilities"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="company_facilities" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="itput__group">
                                                    <h4 className="input__group__title">Service Providers</h4>
                                                    <div className="input">
                                                        <div className="input__title">Transfer Agent</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="transfer_agent"
                                                                id="transfer_agent"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Transfer Agent"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="transfer_agent" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Accounting / Auditing Firm</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="accounting_auditing_firm"
                                                                id="accounting_auditing_firm"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Accounting / Auditing Firm"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="accounting_auditing_firm"
                                                                          component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Investor Relations / Marketing /
                                                            Communications
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="investor_relations_marketing_communications"
                                                                id="investor_relations_marketing_communications"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Investor Relations / Marketing / Communications"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage
                                                                name="investor_relations_marketing_communications"
                                                                component="div"
                                                                className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Securities Counsel</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="securities_counsel"
                                                                id="securities_counsel"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Securities Counsel"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="securities_counsel" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="itput__group input">
                                                    <h4 className="input__group__title">Financial Reporting</h4>
                                                    <div className="input">
                                                        <div className="input__title">US Reporting</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="us_reporting"
                                                                id="us_reporting"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type US Reporting"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="us_reporting" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <div className="input">
                                                        <div className="input__title">Edgar CIK</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="edgar_cik"
                                                                id="edgar_cik"
                                                                type="text"
                                                                className="input__text"
                                                                placeholder="Type Edgar CIK"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name="edgar_cik" component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>
                                                </div>

                                                {this.props.action !== 'view' && (
                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save Company Profile
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
            case 'view':
                return (
                    <>
                        {this.props.data ? (
                            <div>

                            <h2 className={'view_block_main_title'}>
                                {this.props.data?.logo && (
                                    <div className={"company-profile-logo"}>
                                        <img src={this.props.data?.logo} alt="Logo"/>
                                    </div>
                                )}

                                {this.props.data?.company_name} ({this.props.data?.security_name})
                            </h2>
                            <div className='view_panel'>
                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Company Address</div>
                                        <div>{[this.props.data?.street_address_1, this.props.data?.street_address_2, this.props.data?.city,this.props.data?.zip_code, this.props.data?.country].filter(i => i !== '').join(', ') || 'not filled'}</div>
                                        <div className="mt-2">{this.props.data?.phone}</div>
                                        <div className="mt-2">{this.props.data?.web_address}</div>
                                    </div>
                                </div>
                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Business Description</div>
                                        <div>{this.props.data?.business_description || 'not filled'}</div>
                                    </div>
                                </div>
                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Company Profile Data</div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">SIC Industry Classification</div>
                                            <div className="">{this.props.data?.sic_industry_classification || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Incorporation Information</div>
                                            <div className="">{this.props.data?.incorporation_information || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Number of Employees</div>
                                            <div className="">{this.props.data?.number_of_employees || 'not filled'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Company Officers & Contacts</div>
                                        <div>{this.props.data?.company_officers_and_contacts || 'not filled'}</div>
                                    </div>
                                </div>
                                <div className="view_block full_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Board of Directors</div>
                                        <div>{this.props.data?.board_of_directors || 'not filled'}</div>
                                    </div>
                                </div>
                                <div className="view_block full_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Product & Services</div>
                                        <div>{this.props.data?.product_and_services || 'not filled'}</div>
                                    </div>
                                </div>
                                <div className="view_block full_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Company Facilities</div>
                                        <div>{this.props.data?.company_facilities || 'not filled'}</div>
                                    </div>
                                </div>

                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Service Providers</div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Transfer Agent</div>
                                            <div className="">{this.props.data?.transfer_agent || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Accounting / Auditing Firm</div>
                                            <div className="">{this.props.data?.accounting_auditing_firm || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Investor Relations / Marketing / Communications</div>
                                            <div className="">{this.props.data?.investor_relations_marketing_communications || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Securities Counsel</div>
                                            <div className="">{this.props.data?.securities_counsel || 'not filled'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="view_block">
                                    <div className="view_block_body">
                                        <div className="view_block_title">Financial Reporting</div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">US Reporting</div>
                                            <div className="">{this.props.data?.us_reporting || 'not filled'}</div>
                                        </div>
                                        <div className="ver">
                                            <div className="view_block_sub_title">Edgar CIK</div>
                                            <div className="">{this.props.data?.edgar_cik || 'not filled'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            ) : (
                                <NoDataBlock/>
                            )
                        }
                    </>
                )
            // case 'delete':
            //     return (
            //         <>
            //             {/*<div className="confirm-btns-panel">*/}
            //             {/*    {this.props?.onCancel && (*/}
            //             {/*        <button className="border-btn ripple"*/}
            //             {/*                onClick={() => this.props.onCancel?.()}>Cancel</button>*/}
            //             {/*    )}*/}
            //             {/*    <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}*/}
            //             {/*            type="button" disabled={this.state.isDeleting}*/}
            //             {/*            onClick={() => this.handleDelete(this.props.data)}>Confirm*/}
            //             {/*    </button>*/}
            //             {/*</div>*/}
            //         </>
            //     );
        }


    }
}

export default CompanyProfileForm;
