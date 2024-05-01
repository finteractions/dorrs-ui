import React, {RefObject} from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import NoDataBlock from "@/components/no-data-block";
import {UsaStates} from "usa-states";
import {FormFieldOptionType, FormFieldOptionType2, getFormFieldOptionTypeName} from "@/enums/form-field-option-type";
import fileService from "@/services/file/file-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {SingleDatePicker} from "react-dates";
import moment from "moment/moment";
import NumericInputField from "@/components/numeric-input-field";
import AlertBlock from "@/components/alert-block";
import {AssetType} from "@/enums/asset-type";
import {countries} from "countries-list";
import PhoneInputField from "@/components/phone-input-field";
import Select from "react-select";
import {SicIndustryClassification} from "@/enums/sic-industry-classification";
import 'react-dates/initialize';

const allowedImageFileSizeMB = 1
const allowedImageFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedImageExt = ['png', 'jpg', 'jpeg']
const allowedFileSizeMB = 5
const allowedFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedFileExt = ['pdf']

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required'),
    company_name: Yup.string().required('Required').label('Company Name'),
    logo_tmp: Yup.mixed()
        .test('logo_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('logo_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedImageFileSize;
        }),
    asset_type_image_tmp: Yup.mixed()
        .test('asset_type_image_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('asset_type_image_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedImageFileSize;
        }),
    issuer_profile_image_tmp: Yup.mixed()
        .test('issuer_profile_image_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('issuer_profile_image_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedImageFileSize;
        }),
    issuer_profile_file_tmp: Yup.mixed()
        .test('issuer_profile_file_tmp', `File is not a valid image. Only ${allowedFileExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedFileExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('issuer_profile_file_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
});

interface CompanyProfilePageFormProps extends ICallback {
    symbol?: string;
    action: string
}

interface CompanyProfilePageFormState extends IState {
    isLoading: boolean;
    action: string;
    errors: string[];
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    formInitialValues: {},
    selectedCountry: string;
    selectedFile: File | null;
    selectedFileAssetTypeLogo: File | null;
    selectedFileIssuerProfileImage: File | null;
    selectedFileIssuerProfileFile: File | null;
    focusedInitialOfferingDate: any;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')


class CompanyProfilePageFormBlock extends React.Component<CompanyProfilePageFormProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: CompanyProfilePageFormState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;
    host = `${window.location.protocol}//${window.location.host}`;
    formRef: RefObject<any>;

    constructor(props: CompanyProfilePageFormProps) {
        super(props);

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.companyProfile = null;

        this.symbol = null;
        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            action: this.props.action,
            usaStates: usaStatesList,
            formInitialValues: {},
            selectedCountry: '',
            selectedFile: null,
            selectedFileAssetTypeLogo: null,
            selectedFileIssuerProfileImage: null,
            selectedFileIssuerProfileFile: null,
            focusedInitialOfferingDate: null,
        }

        this.formRef = React.createRef();
    }

    initForm(data?: ICompanyProfile | null) {
        const action = data ? 'edit' : 'add';

        const initialData = data || {} as ICompanyProfile;
        if (typeof initialData?.company_officers_and_contacts === 'string') {
            try {
                const company_officers_and_contacts = JSON.parse(initialData.company_officers_and_contacts);
                initialData.company_officers_and_contacts = company_officers_and_contacts;
            } catch (error) {
                initialData.company_officers_and_contacts = [""];
            }
        }

        if (typeof initialData?.board_of_directors === 'string') {
            try {
                const board_of_directors = JSON.parse(initialData.board_of_directors)
                initialData.board_of_directors = board_of_directors;
            } catch (error) {
                initialData.board_of_directors = [""];
            }
        }

        const initialValues: {
            symbol: string;
            asset_type: string;
            asset_type_option: string;
            asset_type_description: string;
            asset_type_image: string;
            total_shares_outstanding: string;
            initial_offering_date: string;
            price_per_share: string;
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
            company_officers_and_contacts: string[];
            board_of_directors: string[];
            product_and_services: string;
            company_facilities: string;
            transfer_agent: string;
            accounting_auditing_firm: string;
            investor_relations_marketing_communications: string;
            securities_counsel: string;
            us_reporting: string;
            edgar_cik: string;
            logo: string;
            issuer_profile_option: string;
            issuer_profile_description: string;
            issuer_profile_image: string;
            issuer_profile_file: string;
        } = {
            symbol: initialData?.symbol || this.props.symbol || '',
            total_shares_outstanding: initialData?.total_shares_outstanding || '',
            initial_offering_date: initialData?.initial_offering_date || '',
            price_per_share: initialData?.price_per_share || '',
            asset_type: initialData?.asset_type || '',
            asset_type_option: initialData?.asset_type_option || '',
            asset_type_description: initialData?.asset_type_description || '',
            asset_type_image: initialData?.asset_type_image || '',
            issuer_profile_option: initialData?.issuer_profile_option || '',
            issuer_profile_description: initialData?.issuer_profile_description || '',
            issuer_profile_image: initialData?.issuer_profile_image || '',
            issuer_profile_file: initialData?.issuer_profile_file || '',
            company_name: initialData?.company_name || this.symbol?.security_name || '',
            business_description: initialData?.business_description || '',
            street_address_1: initialData?.street_address_1 || '',
            street_address_2: initialData?.street_address_2 || '',
            city: initialData?.city || '',
            state: initialData?.state || '',
            zip_code: initialData?.zip_code || '',
            country: initialData?.country || selectedCountry,
            phone: initialData?.phone || '',
            web_address: initialData?.web_address || '',
            sic_industry_classification: initialData?.sic_industry_classification || '',
            incorporation_information: initialData?.incorporation_information || '',
            number_of_employees: initialData?.number_of_employees || '',
            company_officers_and_contacts: initialData?.company_officers_and_contacts || [""],
            board_of_directors: initialData?.board_of_directors || [""],
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

        this.setState({formInitialValues: initialValues, selectedCountry: initialValues.country, action: action})
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
            .finally(() => this.setState({isLoading: false}))
    }

    getSymbols = () => {
        return new Promise(resolve => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const data = res || [];

                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;

                        if (s.company_profile && s.company_profile?.status) {
                            s.company_profile.status = `${s.company_profile.status.charAt(0).toUpperCase()}${s.company_profile.status.slice(1).toLowerCase()}`;
                        }

                        if (typeof s.company_profile?.company_officers_and_contacts === 'string') {
                            try {
                                s.company_profile.company_officers_and_contacts = JSON.parse(s.company_profile.company_officers_and_contacts);
                            } catch (error) {
                                s.company_profile.company_officers_and_contacts = [""];
                            }
                        }

                        if (typeof s.company_profile?.board_of_directors === 'string') {
                            try {
                                s.company_profile.board_of_directors = JSON.parse(s.company_profile.board_of_directors);
                            } catch (error) {
                                s.company_profile.board_of_directors = [""];
                            }
                        }
                    });

                    this.symbols = data;
                    const symbol = this.symbols.find((s: ISymbol) => s.symbol === this.props.symbol);
                    this.symbol = symbol || null;
                    const companyProfile = symbol?.company_profile || null;
                    this.companyProfile = companyProfile;

                    this.initForm(companyProfile)
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                    this.props.onCallback(this.companyProfile?.logo);
                });
        })

    }

    handleBack = () => {
        const router = useRouter();
        router.push('/asset-profiles');
    }

    handleSubmit = async (values: ICompanyProfile, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const formData = new FormData();
        for (const [key, value] of Object.entries(values)) {
            formData.append(key, value);
        }

        const officerValues = values.company_officers_and_contacts;
        formData.append('company_officers_and_contacts', JSON.stringify(officerValues));

        const directorsValues = values.board_of_directors;
        formData.append('board_of_directors', JSON.stringify(directorsValues));

        formData.delete('logo');
        formData.delete('logo_tmp');
        formData.delete('asset_type_image');
        formData.delete('asset_type_image_tmp');
        formData.delete('issuer_profile_image');
        formData.delete('issuer_profile_image_tmp');
        formData.delete('issuer_profile_file');
        formData.delete('issuer_profile_file_tmp');


        if (this.state.selectedFileAssetTypeLogo) {
            formData.append('asset_type_image', this.state.selectedFileAssetTypeLogo);
        }


        if (this.state.selectedFile) {
            formData.append('logo', this.state.selectedFile);
        }

        if (this.state.selectedFileIssuerProfileImage) {
            formData.append('issuer_profile_image', this.state.selectedFileIssuerProfileImage);
        }

        if (this.state.selectedFileIssuerProfileFile) {
            formData.append('issuer_profile_file', this.state.selectedFileIssuerProfileFile);
        }


        const request: Promise<any> = this.state.action == 'edit' ?
            symbolService.updateCompanyProfile(formData, this.companyProfile?.id || 0) :
            symbolService.createCompanyProfile(formData)

        await request
            .then(((res: any) => {
                this.props.onCallback(this.symbol?.symbol, 'view');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    isShow(): boolean {
        return this.state.action === 'view';
    }

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

    handleFileAssetLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFileAssetTypeLogo: selectedFile});
    };

    handleFileIssuerProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFileIssuerProfileImage: selectedFile});
    };

    handleFileIssuerProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFileIssuerProfileFile: selectedFile});
    };

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className="d-flex align-items-center justify-content-between flex-1">
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/> <Link
                                    className="login__link"
                                    href="/asset-profiles"

                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>
                        <div className={'profile section'}>
                            {this.symbol ? (
                                <Formik<ICompanyProfile>
                                    initialValues={this.state.formInitialValues as ICompanyProfile}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="bank-form">
                                                <div className="flex-panel-box">
                                                    <div className={'panel'}>
                                                        <div
                                                            className={'content__bottom d-flex justify-content-between'}>
                                                            <h2 className={'view_block_main_title'}>
                                                                {this.companyProfile?.company_name || this.symbol?.security_name} ({this.symbol?.symbol})
                                                            </h2>
                                                        </div>
                                                    </div>
                                                    <div className={'profile__right'}>
                                                        <div className={'profile__right-wrap-full'}>
                                                            <div className={'profile__panel'}>
                                                                <div
                                                                    className={'profile__info__panel view__input__box'}>


                                                                    <div className="input__box">
                                                                        <div className="input__title">Asset Type
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="asset_type"
                                                                                id="asset_type"
                                                                                as="select"
                                                                                className="b-select"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Asset Type
                                                                                </option>
                                                                                {Object.values(AssetType).map((type) => (
                                                                                    <option key={type} value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage name="asset_type"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {(this.isShow() && initialValues?.logo) && (
                                                                        <div
                                                                            className={"input__box d-flex justify-content-center company-profile-logo"}>
                                                                            <img src={initialValues?.logo}
                                                                                 alt="Logo"/>
                                                                        </div>
                                                                    )}
                                                                    {!this.isShow() && (
                                                                        <div className="input__box">
                                                                            <div className="input__title">Logo</div>
                                                                            <div className="input__wrap">
                                                                                <input
                                                                                    id="logo_tmp"
                                                                                    name="logo_tmp"
                                                                                    type="file"
                                                                                    accept={'.' + allowedImageExt.join(',.')}
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

                                                                    <div className="input__box">
                                                                        <div className="input__title">Symbol</div>
                                                                        <div className="input__wrap">
                                                                            {this.symbol?.security_name} ({this.symbol?.symbol})
                                                                            <Field
                                                                                name="symbol"
                                                                                id="symbol"
                                                                                type="hidden"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Total Shares
                                                                            Outstanding
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="total_shares_outstanding"
                                                                                id="number_of_employees"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Total Shares Outstanding"
                                                                                component={NumericInputField}
                                                                                decimalScale={0}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="number_of_employees"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Initial
                                                                            Offering Date
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <SingleDatePicker
                                                                                numberOfMonths={1}
                                                                                date={values.initial_offering_date ? moment(values.initial_offering_date) : null}
                                                                                onDateChange={date => setFieldValue('initial_offering_date', date?.format('YYYY-MM-DD').toString())}
                                                                                focused={this.state.focusedInitialOfferingDate}
                                                                                onFocusChange={({focused}) => this.setState({focusedInitialOfferingDate: focused})}
                                                                                id="initial_offering_date"
                                                                                displayFormat="YYYY-MM-DD"
                                                                                isOutsideRange={() => false}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                readOnly={true}
                                                                                placeholder={'Select Initial Offering Date'}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="initial_offering_date"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Price Per
                                                                            Share
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="price_per_share"
                                                                                id="price_per_share"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Price Per Share"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                component={NumericInputField}
                                                                                decimalScale={decimalPlaces}
                                                                            />
                                                                            <ErrorMessage name="bid_price"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Company
                                                                            Name <i>*</i></div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="company_name"
                                                                                id="company_name"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Company Name"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="company_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Business
                                                                            Description
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="business_description"
                                                                                id="business_description"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Business Description"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="business_description"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {values.asset_type !== '' && (
                                                                        <>
                                                                            <div className="input__box full">
                                                                                <h4 className="input__group__title">{values.asset_type} Additional
                                                                                    Fields:</h4>
                                                                            </div>
                                                                            <div className={'input__box full'}>
                                                                                <div className="input__box">
                                                                                    <div
                                                                                        className="input__title">Choose
                                                                                        either a Free Text Box
                                                                                        or Upload Image Option
                                                                                    </div>
                                                                                    <div
                                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                        <Field
                                                                                            name="asset_type_option"
                                                                                            id="asset_type_option"
                                                                                            as="select"
                                                                                            className="b-select"
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        >
                                                                                            <option value="">Select
                                                                                            </option>
                                                                                            {Object.values(FormFieldOptionType).map((type) => (
                                                                                                <option key={type}
                                                                                                        value={type}>
                                                                                                    {getFormFieldOptionTypeName(type as FormFieldOptionType)}
                                                                                                </option>
                                                                                            ))}
                                                                                        </Field>
                                                                                    </div>
                                                                                </div>

                                                                                {values.asset_type_option === FormFieldOptionType.TEXT && (
                                                                                    <div className="input__box">
                                                                                        <div
                                                                                            className="input__wrap">
                                                                                            <Field
                                                                                                name="asset_type_description"
                                                                                                id="asset_type_description"
                                                                                                as="textarea"
                                                                                                rows="4"
                                                                                                className="input__textarea"
                                                                                                placeholder=""
                                                                                                maxLength={255}
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                            <ErrorMessage
                                                                                                name="asset_type_description"
                                                                                                component="div"
                                                                                                className="error-message"/>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {values.asset_type_option === FormFieldOptionType.IMAGE && (
                                                                                    <>
                                                                                        {(this.isShow() && initialValues?.asset_type_image) && (
                                                                                            <div
                                                                                                className={"input__box d-flex justify-content-center company-profile-logo"}>
                                                                                                <img
                                                                                                    src={initialValues?.asset_type_image}
                                                                                                    alt="Logo"/>
                                                                                            </div>
                                                                                        )}
                                                                                        {!this.isShow() && (
                                                                                            <div
                                                                                                className="input__box">
                                                                                                <div
                                                                                                    className="input__wrap">
                                                                                                    <input
                                                                                                        id="asset_type_image_tmp"
                                                                                                        name="asset_type_image_tmp"
                                                                                                        type="file"
                                                                                                        accept={'.' + allowedImageExt.join(',.')}
                                                                                                        className="input__file"
                                                                                                        disabled={isSubmitting}
                                                                                                        onChange={(event) => {
                                                                                                            setFieldValue('asset_type_image_tmp', event.target?.files?.[0] || '');
                                                                                                            this.handleFileAssetLogoChange(event);
                                                                                                        }}
                                                                                                    />
                                                                                                    {errors.asset_type_image_tmp && (
                                                                                                        <div
                                                                                                            className="error-message">{errors.asset_type_image_tmp.toString()}</div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}

                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    <div className="input__box full">
                                                                        <h4 className="input__group__title">Issuer
                                                                            Profile Fields:</h4>
                                                                    </div>
                                                                    <div className="input__box full">
                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">Information
                                                                                on Offering
                                                                                Prospective, Financials and other
                                                                                details can be loaded on
                                                                                the Issuance of the company so
                                                                                broker-dealers can use the
                                                                                data as due diligence.
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="issuer_profile_option"
                                                                                    id="issuer_profile_option"
                                                                                    as="select"
                                                                                    className="b-select"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                >
                                                                                    <option value="">Select</option>
                                                                                    {Object.values(FormFieldOptionType2).map((type) => (
                                                                                        <option key={type}
                                                                                                value={type}>
                                                                                            {getFormFieldOptionTypeName(type as FormFieldOptionType2)}
                                                                                        </option>
                                                                                    ))}
                                                                                </Field>
                                                                            </div>
                                                                        </div>

                                                                        {values.issuer_profile_option === FormFieldOptionType2.TEXT && (
                                                                            <div className="input__box">
                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="issuer_profile_description"
                                                                                        id="issuer_profile_description"
                                                                                        as="textarea"
                                                                                        rows="4"
                                                                                        className="input__textarea"
                                                                                        placeholder=""
                                                                                        maxLength={255}
                                                                                        disabled={isSubmitting}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="issuer_profile_description"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {values.issuer_profile_option === FormFieldOptionType2.IMAGE && (
                                                                            <>
                                                                                {(this.isShow() && initialValues?.issuer_profile_image) && (
                                                                                    <div
                                                                                        className={"input__box d-flex justify-content-center company-profile-logo"}>
                                                                                        <img
                                                                                            src={initialValues?.issuer_profile_image}
                                                                                            alt="Logo"/>
                                                                                    </div>
                                                                                )}
                                                                                {!this.isShow() && (
                                                                                    <div className="input__box">
                                                                                        <div
                                                                                            className="input__wrap">
                                                                                            <input
                                                                                                id="issuer_profile_image_tmp"
                                                                                                name="issuer_profile_image_tmp"
                                                                                                type="file"
                                                                                                accept={'.' + allowedImageExt.join(',.')}
                                                                                                className="input__file"
                                                                                                disabled={isSubmitting}
                                                                                                onChange={(event) => {
                                                                                                    setFieldValue('issuer_profile_image_tmp', event.target?.files?.[0] || '');
                                                                                                    this.handleFileIssuerProfileImageChange(event);
                                                                                                }}
                                                                                            />
                                                                                            {errors.issuer_profile_image_tmp && (
                                                                                                <div
                                                                                                    className="error-message">{errors.issuer_profile_image_tmp.toString()}</div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {values.issuer_profile_option === FormFieldOptionType2.FILE && (
                                                                            <>
                                                                                {(this.isShow() && initialValues?.issuer_profile_file) && (
                                                                                    <div
                                                                                        className={"input__box d-flex justify-content-center company-profile-logo"}>
                                                                                        <Link
                                                                                            className={'link info-panel-title-link'}
                                                                                            href={`${this.host}${initialValues?.issuer_profile_file}`}
                                                                                            target={'_blank'}>
                                                                                            {fileService.getFileNameFromUrl(initialValues?.issuer_profile_file)}
                                                                                            <FontAwesomeIcon
                                                                                                className="nav-icon"
                                                                                                icon={faArrowUpRightFromSquare}/>
                                                                                        </Link>
                                                                                    </div>
                                                                                )}
                                                                                {!this.isShow() && (
                                                                                    <div className="input__box">
                                                                                        <div
                                                                                            className="input__wrap">
                                                                                            <input
                                                                                                id="issuer_profile_file_tmp"
                                                                                                name="issuer_profile_file_tmp"
                                                                                                type="file"
                                                                                                accept={'.' + allowedFileExt.join(',.')}
                                                                                                className="input__file"
                                                                                                disabled={isSubmitting}
                                                                                                onChange={(event) => {
                                                                                                    setFieldValue('issuer_profile_file_tmp', event.target?.files?.[0] || '');
                                                                                                    this.handleFileIssuerProfileFileChange(event);
                                                                                                }}
                                                                                            />
                                                                                            {errors.issuer_profile_file_tmp && (
                                                                                                <div
                                                                                                    className="error-message">{errors.issuer_profile_file_tmp.toString()}</div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                    </div>

                                                                    <div className="input__box full">
                                                                        <h4 className="input__group__title">Company
                                                                            Address:</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Street
                                                                            Address 1
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="street_address_1"
                                                                                id="street_address_1"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Street Address 1"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="street_address_1"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Street
                                                                            Address 2
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="street_address_2"
                                                                                id="street_address_2"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Street Address 2"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="street_address_2"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">City
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="city"
                                                                                id="city"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type City"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="city"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {this.state.selectedCountry === selectedCountry && (
                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">State <i>*</i>
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="state"
                                                                                    id="state"
                                                                                    as="select"
                                                                                    className="b-select"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                >
                                                                                    <option value="">Select a
                                                                                        State
                                                                                    </option>
                                                                                    {this.state.usaStates.map((state) => (
                                                                                        <option
                                                                                            key={state.abbreviation}
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
                                                                    )}

                                                                    <div className="input__box">
                                                                        <div className="input__title">Zip Code
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="zip_code"
                                                                                id="zip_code"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Zip Code"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="zip_code"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Country
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="country"
                                                                                id="country"
                                                                                as="select"
                                                                                className="b-select"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleRegionChange(e, setFieldValue)}
                                                                            >
                                                                                <option value="">Select a
                                                                                    Country
                                                                                </option>
                                                                                {Object.keys(countries)
                                                                                    .sort((a, b) => countries[a as keyof typeof countries]?.name.localeCompare(countries[b as keyof typeof countries]?.name))
                                                                                    .map((countryCode: string) => (
                                                                                        <option
                                                                                            key={countryCode}
                                                                                            value={countryCode}>
                                                                                            {countries[countryCode as keyof typeof countries]?.name}
                                                                                        </option>
                                                                                    ))}
                                                                            </Field>
                                                                            <ErrorMessage name="country"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Phone
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="phone"
                                                                                id="phone"
                                                                                component={PhoneInputField}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                country="us"
                                                                            />
                                                                        </div>
                                                                    </div>


                                                                    <div className="input__box">
                                                                        <div className="input__title">Web Address
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="web_address"
                                                                                id="web_address"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Web Address"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="web_address"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box full">
                                                                        <h4 className="input__group__title">Asset
                                                                            Profile Data</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">SIC
                                                                            Industry Classification
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="sic_industry_classification"
                                                                                id="sic_industry_classification"
                                                                                as={Select}
                                                                                className="b-select-search"
                                                                                placeholder="Select SIC Industry Classification"
                                                                                classNamePrefix="select__react"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                options={Object.values(SicIndustryClassification).map((item) => ({
                                                                                    value: item,
                                                                                    label: item,
                                                                                }))}
                                                                                onChange={(selectedOption: any) => {
                                                                                    setFieldValue('sic_industry_classification', selectedOption.value);
                                                                                }}
                                                                                value={
                                                                                    Object.values(SicIndustryClassification).filter(i => i === values.sic_industry_classification).map((item) => ({
                                                                                        value: item,
                                                                                        label: item,
                                                                                    }))?.[0] || null
                                                                                }
                                                                            />

                                                                            <ErrorMessage
                                                                                name="sic_industry_classification"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div
                                                                            className="input__title">Incorporation
                                                                            Information
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="incorporation_information"
                                                                                id="incorporation_information"
                                                                                as="select"
                                                                                className="b-select"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select
                                                                                    Incorporation Information
                                                                                </option>
                                                                                {this.state.usaStates.map((state) => (
                                                                                    <option
                                                                                        key={state.abbreviation}
                                                                                        value={state.abbreviation}>
                                                                                        {state.name} ({state.abbreviation})
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="incorporation_information"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Number of
                                                                            Employees
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="number_of_employees"
                                                                                id="number_of_employees"
                                                                                component={NumericInputField}
                                                                                decimalScale={0}
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Number of Employees"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="number_of_employees"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className="input__box full">
                                                                        <div
                                                                            className="input__title input__btns">Company
                                                                            Officers &
                                                                            Contacts
                                                                            <button
                                                                                type="button"
                                                                                className='border-grey-btn ripple'
                                                                                onClick={() => {
                                                                                    const updatedOfficers = [...values.company_officers_and_contacts, ''];
                                                                                    setFieldValue('company_officers_and_contacts', updatedOfficers);
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon"
                                                                                    icon={faPlus}/>
                                                                            </button></div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <div className="officer-input">
                                                                                {values.company_officers_and_contacts.map((officer, index) => (
                                                                                    <div className={'input__btns'}
                                                                                         key={index}>
                                                                                        <Field
                                                                                            name={`company_officers_and_contacts.${index}`}
                                                                                            type="text"
                                                                                            className="input__text"
                                                                                            placeholder="Type Company Officers & Contacts"
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            className='border-grey-btn ripple'
                                                                                            onClick={() => {
                                                                                                const updatedOfficers = [...values.company_officers_and_contacts];
                                                                                                updatedOfficers.splice(index, 1);
                                                                                                setFieldValue('company_officers_and_contacts', updatedOfficers);
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon
                                                                                                className="nav-icon"
                                                                                                icon={faMinus}/>
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            {errors.company_officers_and_contacts && (
                                                                                <div
                                                                                    className="error-message">{errors.company_officers_and_contacts.toString()}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box full">
                                                                        <div
                                                                            className="input__title input__btns">Board
                                                                            of Directors
                                                                            <button
                                                                                type="button"
                                                                                className='border-grey-btn ripple'
                                                                                onClick={() => {
                                                                                    const updatedBoardOfDirectors = [...values.board_of_directors, ''];
                                                                                    setFieldValue('board_of_directors', updatedBoardOfDirectors);
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon"
                                                                                    icon={faPlus}/>
                                                                            </button></div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <div className="officer-input">
                                                                                {values.board_of_directors.map((director, index) => (
                                                                                    <div className={'input__btns'}
                                                                                         key={index}>
                                                                                        <Field
                                                                                            name={`board_of_directors.${index}`}
                                                                                            type="text"
                                                                                            className="input__text"
                                                                                            placeholder="Type Board of Directors"
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            className='border-grey-btn ripple'
                                                                                            onClick={() => {
                                                                                                const updatedBoardOfDirectors = [...values.board_of_directors];
                                                                                                updatedBoardOfDirectors.splice(index, 1);
                                                                                                setFieldValue('board_of_directors', updatedBoardOfDirectors);
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon
                                                                                                className="nav-icon"
                                                                                                icon={faMinus}/>
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            {errors.board_of_directors && (
                                                                                <div
                                                                                    className="error-message">{errors.board_of_directors.toString()}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>


                                                                    <div className="input__box">
                                                                        <div className="input__title">Product &
                                                                            Services
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="product_and_services"
                                                                                id="product_and_services"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Product & Services"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="product_and_services"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Company
                                                                            Facilities
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="company_facilities"
                                                                                id="company_facilities"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Company Facilities"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="company_facilities"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box full">
                                                                        <h4 className="input__group__title">Service
                                                                            Providers</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Transfer
                                                                            Agent
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="transfer_agent"
                                                                                id="transfer_agent"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Transfer Agent"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="transfer_agent"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Accounting
                                                                            / Auditing Firm
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="accounting_auditing_firm"
                                                                                id="accounting_auditing_firm"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Accounting / Auditing Firm"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="accounting_auditing_firm"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Investor
                                                                            Relations / Marketing /
                                                                            Communications
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
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

                                                                    <div className="input__box">
                                                                        <div className="input__title">Securities
                                                                            Counsel
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="securities_counsel"
                                                                                id="securities_counsel"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Securities Counsel"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="securities_counsel"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className="input__box full">
                                                                        <h4 className="input__group__title">Financial
                                                                            Reporting</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">US
                                                                            Reporting
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="us_reporting"
                                                                                id="us_reporting"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type US Reporting"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="us_reporting"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Edgar CIK
                                                                            <Link
                                                                                className={'link info-panel-title-link'}
                                                                                href={'https://www.sec.gov/edgar/searchedgar/companysearch'}
                                                                                target={'_blank'}>
                                                                                Company Filings <FontAwesomeIcon
                                                                                className="nav-icon"
                                                                                icon={faArrowUpRightFromSquare}/>
                                                                            </Link>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="edgar_cik"
                                                                                id="edgar_cik"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Edgar CIK"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="edgar_cik"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    {this.state.action !== 'view' && (
                                                                        <div className="input__box full">
                                                                            <div className="input__box">
                                                                                <button
                                                                                    className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : 'no-border'}`}
                                                                                    type="submit"
                                                                                    disabled={isSubmitting || !isValid || !dirty}>
                                                                                    Save Asset Profile
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {this.state.errorMessages && (
                                                                        <AlertBlock type={"error"}
                                                                                    messages={this.state.errorMessages}/>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            ) : (
                                <div className={'flex-panel-box'}>
                                    <div className={'panel'}>
                                        <div className={'content__bottom'}>
                                            <NoDataBlock/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default CompanyProfilePageFormBlock;
