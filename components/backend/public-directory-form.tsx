import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SingleDatePicker} from "react-dates";
import 'react-dates/lib/css/_datepicker.css';
import FormValidator from "@/services/form-validator/form-validator";
import PhoneInputField from "@/components/phone-input-field";
import formValidator from "@/services/form-validator/form-validator";
import {CompanyType} from "@/enums/company-type";
import moment from "moment/moment";
import Link from "next/link";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import {AssetClassType} from "@/enums/asset-class-type";
import {RegionType} from "@/enums/region-type";
import {NetworkType} from "@/enums/network-type";
import AssetImage from "@/components/asset-image";
import {FormStatus, getApprovedFormStatus, PublicDirectoryFormStatus} from "@/enums/form-status";

const allowedImageFileSizeMB = 1
const allowedImageFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedImageExt = ['png', 'jpg', 'jpeg']

const formSchema = Yup.object().shape({
    first_last_name: Yup.string().required('Required').label('Your Name'),
    email: Yup.string().email("Invalid email").required('Required').label('Email Address'),
    mobile_number: FormValidator.phoneNumberField(false).label('Mobile Number'),
    company_name: Yup.string().required('Required').label('Company Name'),
    company_type: Yup.string().required('Required').label('Company Type'),
    company_type_name: Yup.string().min(3)
        .when('company_type', {
            is: (v: string) => v === CompanyType.OTHER,
            then: (schema) => schema.required('Required')
        })
        .label('Company Type'),
    company_title: Yup.string().required('Required').label('Your title'),
    protocol_name: Yup.string().label('Protocol Name'),
    description: Yup.string().max(280).label('Description'),
    website_link: Yup.string().url('Invalid URL').label('Website Link'),
    founding_date: Yup.string().label('Founding Date'),
    logo_tmp: Yup.mixed().nullable()
        .test('logo_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            if (typeof value === 'string') return true;
            return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('logo_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            if (typeof value === 'string') return true;
            return value.size <= allowedImageFileSize;
        }),
    asset_class: Yup.array().of(Yup.string()).label('Asset Class(es)'),
    asset_region: Yup.array().of(Yup.string()).label('Asset Region(s)'),
    network: Yup.array().of(Yup.string()).label('Network(s)'),
    asset_listing: Yup.string().label('Asset Listing Request').label('Asset Listing Request'),
    additional_information: Yup.string().label('Additional Information'),
    profile_status: Yup.string().required('Required').label('Status')
});

interface PublicDirectoryFormState extends IState {
    loading: boolean;
    isDeleting: boolean;
    formInitialValues: IDirectoryCompanyProfile,
    focusedInputDateEntered: any;
    selectedFile: File | null;
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
}

interface PublicDirectoryFormProps extends ICallback {
    action: string;
    firmData: IDirectoryCompanyProfile | null;
    onCancel?: () => void;
}

const dateFormat = process.env.FORMAT_DATE || 'YYYY-MM-DD'

class PublicDirectoryForm extends React.Component<PublicDirectoryFormProps, PublicDirectoryFormState> {

    state: PublicDirectoryFormState;
    host: string = '';

    constructor(props: PublicDirectoryFormProps) {
        super(props);
        const initialData = this.props.firmData || {} as IDirectoryCompanyProfile;

        const initialValues: {
            id: number | null;
            first_last_name: string;
            email: string;
            mobile_number: string;
            company_name: string;
            company_type: string;
            company_type_name: string;
            company_title: string;
            protocol_name: string;
            description: string;
            website_link: string;
            founding_date: string;
            logo: string;
            asset_class: string[];
            asset_region: string[];
            network: string[];
            asset_listing: string;
            additional_information: string;
            profile_status: string;
            logo_tmp: any;
        } = {
            id: initialData.id || null,
            first_last_name: initialData.first_last_name || '',
            email: initialData.email || '',
            mobile_number: initialData.mobile_number || '',
            company_name: initialData.company_name || '',
            company_type: initialData.company_type || '',
            company_type_name: initialData.company_type ? initialData.company_type_name || '' : '',
            company_title: initialData.company_title || '',
            protocol_name: initialData.protocol_name || '',
            description: initialData.description || '',
            website_link: initialData.website_link || '',
            founding_date: initialData.founding_date || '',
            logo: initialData.logo || '',
            asset_class: initialData.asset_class || [],
            asset_region: initialData.asset_region || [],
            network: initialData.network || [],
            asset_listing: initialData.asset_listing || '',
            additional_information: initialData.additional_information || '',
            profile_status: initialData.profile_status || PublicDirectoryFormStatus.UNCLAIMED,
            logo_tmp: initialData.logo || null
        };


        this.state = {
            success: false,
            formInitialValues: initialValues as IDirectoryCompanyProfile,
            loading: false,
            isDeleting: false,
            focusedInputDateEntered: null,
            selectedFile: null,
            isApproving: null,
            isConfirmedApproving: false,
        };
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
    }

    handleSubmit = async (values: IDirectoryCompanyProfile, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {

        this.setState({errorMessages: null});

        let data = {...values};

        data = formValidator.castFormValues(data, formSchema);

        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value as any);
        }

        formData.delete('logo');
        formData.delete('logo_tmp');

        if (this.state.selectedFile) {
            formData.append('logo', this.state.selectedFile);
        }

        const request: Promise<any> = this.props.action == 'edit' ?
            adminService.updateDirectoryProfile(this.props.firmData?.id || 0, formData) :
            adminService.createDirectoryProfile(formData);

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

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deleteDirectoryProfile(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    }

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        const request: Promise<any> = adminService.approveDirectoryProfile(values.id, this.state.isApproving || false)

        await request
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    };


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
                                <Formik<IDirectoryCompanyProfile>
                                    initialValues={this.state.formInitialValues as IDirectoryCompanyProfile}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        formValidator.requiredFields(formSchema, values, errors);

                                        return (
                                            <Form id="firm-form">

                                                {['edit', 'view'].includes(this.props.action) && (
                                                    <>

                                                        <div className='approve-form'>
                                                            <div
                                                                className={`approve-form-text w-100 pt-1`}>
                                                                <>
                                                                    Profile
                                                                    Status: {this.props.firmData?.profile_status}
                                                                </>
                                                            </div>
                                                            <div
                                                                className={`approve-form-text w-100 ${this.props.firmData?.approved_date_time ? 'pt-1' : ''}`}>
                                                                <>
                                                                    Status: {this.props.firmData?.status} by {this.props.firmData?.approved_by || ''} at {formatterService.dateTimeFormat(this.props.firmData?.approved_date_time || '')}
                                                                </>
                                                            </div>
                                                            {!getApprovedFormStatus().includes(this.props.firmData?.status.toLowerCase() as FormStatus) && (
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
                                                                                    onClick={() => this.handleApprove(this.props.firmData)}>Confirm
                                                                            </button>
                                                                            <button
                                                                                className={`border-btn ripple`}
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
                                                                            <button
                                                                                className={`border-btn ripple`}
                                                                                type="button"
                                                                                onClick={() => this.setState({
                                                                                    isConfirmedApproving: true,
                                                                                    isApproving: false
                                                                                })}>Reject
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>

                                                    </>

                                                )}
                                                <div className="input">
                                                    <div
                                                        className="input__title">First and Last Name <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="first_last_name"
                                                            id="first_last_name"
                                                            type="text"
                                                            className="input__text no-bg"
                                                            placeholder="First and Last Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage
                                                            name="first_last_name"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title">Email <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="email"
                                                            id="email"
                                                            type="email"
                                                            className="input__text no-bg"
                                                            placeholder="Contact email address"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage
                                                            name="email"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Phone Number
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
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
                                                    <div className="input__title">Company
                                                        Name <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="company_name"
                                                            id="company_name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Name of your company"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="company_name"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Company Type <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="company_type"
                                                            id="company_type"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select Company Type
                                                            </option>
                                                            {Object.values(CompanyType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="company_type"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                {values.company_type === CompanyType.OTHER && (
                                                    <div className="input">
                                                        <div
                                                            className="input__title">Other Company Type <i>*</i>
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                            <Field
                                                                name="company_type_name"
                                                                id="company_type_name"
                                                                type="text"
                                                                className="input__text no-bg"
                                                                placeholder="Type Company Type"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage
                                                                name="company_type_name"
                                                                component="div"
                                                                className="error-message"/>
                                                        </div>
                                                    </div>
                                                )}

                                                {values.company_type === CompanyType.ISSUER && (
                                                    <div className="input">
                                                        <div
                                                            className="input__title">Asset Listing Request
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                            <Field
                                                                name="asset_listing"
                                                                id="asset_listing"
                                                                type="text"
                                                                className="input__text no-bg"
                                                                placeholder="Option to Issuer to list private securities and digital asset securities on the DORRS platform"
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage
                                                                name="asset_listing"
                                                                component="div"
                                                                className="error-message"/>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="input">
                                                    <div
                                                        className="input__title">Title <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="company_title"
                                                            id="company_title"
                                                            type="text"
                                                            className="input__text no-bg"
                                                            placeholder="Position within the company"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage
                                                            name="company_title"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title">Protocol Name
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="protocol_name"
                                                            id="protocol_name"
                                                            type="text"
                                                            className="input__text no-bg"
                                                            placeholder="Name of the tokenization protocol"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage
                                                            name="protocol_name"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title">Description
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="description"
                                                            id="description"
                                                            as="textarea"
                                                            rows={4}
                                                            className="input__textarea"
                                                            placeholder="A brief description of your protocol"
                                                            disabled={isSubmitting || this.isShow()}
                                                            maxLength={250}
                                                        />
                                                        <ErrorMessage
                                                            name="description"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title">Protocol Website
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="website_link"
                                                            id="website_link"
                                                            type="text"
                                                            className="input__text no-bg"
                                                            placeholder="URL of your protocol’s website"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage
                                                            name="website_link"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Founding Date
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <SingleDatePicker
                                                            numberOfMonths={1}
                                                            renderMonthElement={formatterService.renderMonthElement}
                                                            date={values.founding_date ? moment(values.founding_date) : null}
                                                            onDateChange={date => setFieldValue('founding_date', date?.format('YYYY-MM-DD').toString())}
                                                            focused={this.state.focusedInputDateEntered}
                                                            onFocusChange={({focused}) => this.setState({focusedInputDateEntered: focused})}
                                                            id="founding_date"
                                                            displayFormat={dateFormat}
                                                            isOutsideRange={() => false}
                                                            disabled={isSubmitting || this.isShow()}
                                                            readOnly={true}
                                                            placeholder={'Select Founding Date'}
                                                        />
                                                        <ErrorMessage
                                                            name="founding_date"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                {(this.isShow() && this.state?.formInitialValues?.logo) && (
                                                    <div className={"input justify-content-center"}>
                                                        <AssetImage alt=''
                                                                    src={this.state.formInitialValues?.logo}
                                                                    width={60}
                                                                    height={60}/>
                                                    </div>
                                                )}

                                                {!this.isShow() && (
                                                    <div className="input">
                                                        <div className="input__title">Logo</div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>

                                                            {this.state.formInitialValues?.logo && (
                                                                <div
                                                                    className="mb-2 d-flex">
                                                                    <Link
                                                                        className={'link info-panel-title-link'}
                                                                        href={`${this.host}${this.state?.formInitialValues?.logo}`}
                                                                        target={'_blank'}>
                                                                        Image {' '}
                                                                        <FontAwesomeIcon
                                                                            className="nav-icon"
                                                                            icon={faArrowUpRightFromSquare}/>
                                                                    </Link>
                                                                </div>
                                                            )}

                                                            <input
                                                                id="logo_tmp"
                                                                name="logo_tmp"
                                                                type="file"
                                                                accept={'.' + allowedImageExt.join(',.')}
                                                                className="input__file"
                                                                disabled={isSubmitting || this.isShow()}
                                                                onChange={(event) => {
                                                                    setFieldValue('logo_tmp', event.target?.files?.[0] || '');
                                                                    this.handleFileChange(event);
                                                                }}
                                                            />

                                                            {errors.logo_tmp && values.logo_tmp !== null && (
                                                                <div
                                                                    className="error-message">{errors.logo_tmp.toString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="input">
                                                    <div className="input__title">Asset Class(es)</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="asset_class"
                                                            id="asset_class"
                                                            as={Select}
                                                            className={`b-select-search`}
                                                            placeholder="Select relevant asset classes"
                                                            classNamePrefix="select__react"
                                                            isMulti={true}
                                                            isDisabled={isSubmitting || this.isShow()}
                                                            options={Object.values(AssetClassType).map((type) => ({
                                                                value: type,
                                                                label: type
                                                            }))}
                                                            onChange={(selectedOptions: any) => {
                                                                const values = selectedOptions.map((s: any) => s.value)
                                                                setFieldValue('asset_class', values)
                                                            }}
                                                            value={(values.asset_class || []).map((value: string) => ({
                                                                value,
                                                                label: value
                                                            }))}
                                                        />
                                                        <ErrorMessage name="asset_class"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Asset Region(s)</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="asset_region"
                                                            id="asset_region"
                                                            as={Select}
                                                            className={`b-select-search`}
                                                            placeholder="Regions where the protocol operates"
                                                            classNamePrefix="select__react"
                                                            isMulti={true}
                                                            isDisabled={isSubmitting || this.isShow()}
                                                            options={Object.values(RegionType).map((type) => ({
                                                                value: type,
                                                                label: type
                                                            }))}
                                                            onChange={(selectedOptions: any) => {
                                                                const values = selectedOptions.map((s: any) => s.value)
                                                                setFieldValue('asset_region', values)
                                                            }}
                                                            value={(values.asset_region || []).map((value: string) => ({
                                                                value,
                                                                label: value
                                                            }))}
                                                        />
                                                        <ErrorMessage name="asset_region"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Networks Currently Live</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="network"
                                                            id="network"
                                                            as={Select}
                                                            className={`b-select-search`}
                                                            placeholder="Select all blockchain networks where your protocol is currently live"
                                                            classNamePrefix="select__react"
                                                            isMulti={true}
                                                            isDisabled={isSubmitting || this.isShow()}
                                                            options={Object.values(NetworkType).map((type) => ({
                                                                value: type,
                                                                label: type
                                                            }))}
                                                            onChange={(selectedOptions: any) => {
                                                                const values = selectedOptions.map((s: any) => s.value)
                                                                setFieldValue('network', values)
                                                            }}
                                                            value={(values.network || []).map((value: string) => ({
                                                                value,
                                                                label: value
                                                            }))}
                                                        />
                                                        <ErrorMessage name="network"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title">Additional Information
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                        <Field
                                                            name="additional_information"
                                                            id="additional_information"
                                                            as="textarea"
                                                            rows={4}
                                                            className="input__textarea"
                                                            placeholder="Any other relevant details you want to provide"
                                                            disabled={isSubmitting || this.isShow()}
                                                            maxLength={250}
                                                        />
                                                        <ErrorMessage
                                                            name="additional_information"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>


                                                {!this.isShow() && (
                                                    <>
                                                        <hr/>
                                                        <div className="input">
                                                            <div className="input__title">Profile Status <i>*</i></div>
                                                            <div
                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                <Field
                                                                    name="profile_status"
                                                                    id="profile_status"
                                                                    as="select"
                                                                    className="b-select"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                >
                                                                    <option value="">Select Status
                                                                    </option>
                                                                    {Object.values(PublicDirectoryFormStatus).map((status) => (
                                                                        <option key={status} value={status}>
                                                                            {status}
                                                                        </option>
                                                                    ))}
                                                                </Field>
                                                                <ErrorMessage name="profile_status"
                                                                              component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {this.props.action !== 'view' && (
                                                    <button id="add-bank-acc"
                                                        className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save Firm
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
            case'delete'    :
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.firmData)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }

    }
}

export default PublicDirectoryForm;
