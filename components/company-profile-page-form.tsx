import React, {RefObject} from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import NoDataBlock from "@/components/no-data-block";
import {UsaStates} from "usa-states";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import {ErrorMessage, Field, FieldProps, Form, Formik} from "formik";
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
import InputMask from "react-input-mask";
import formatterService from "@/services/formatter/formatter-service";
import formValidator from "@/services/form-validator/form-validator";

const allowedImageFileSizeMB = 1
const allowedImageFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedImageExt = ['png', 'jpg', 'jpeg']
const allowedFileSizeMB = 5
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;
const allowedFileExt = ['pdf']

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    symbol: Yup.string().required('Required').label('Symbol'),
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
    asset_type_image_tmp: Yup.array().of(
        Yup.mixed()
            .test('asset_type_image_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('asset_type_image_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedFileSize;
            })
    ),
    issuer_profile_image_tmp: Yup.array().of(
        Yup.mixed()
            .test('issuer_profile_image_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('issuer_profile_image_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedFileSize;
            })
    ),
    issuer_profile_file_tmp: Yup.array().of(
        Yup.mixed()
            .test('issuer_profile_image_tmp', `File is not a valid. Only ${allowedFileExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedFileExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('issuer_profile_image_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedFileSize;
            })),
    spv_name: Yup.string().label('SPV Name'),
    fund_manager: Yup.string().label('Fund Manager'),
    investment_objective: Yup.string().label('Investment Objective'),
    sec_filing: Yup.string().label('SEC Filing'),
    sec_image_tmp: Yup.array().of(
        Yup.mixed()
            .test('sec_image_tmp', `File is not a valid image. Only ${allowedImageExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedImageExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('sec_image_tmp', `File is too large. Maximum size: ${allowedImageFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedImageFileSize;
            }),
    ),
    sec_file_tmp: Yup.array().of(
        Yup.mixed()
            .test('sec_file_tmp', `File is not a valid. Only ${allowedFileExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedFileExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('sec_file_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedFileSize;
            })),
    email: Yup.string().email("Invalid email").label('Email Address'),
    total_shares_outstanding: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Total Equity Funding Amount').label('Total Equity Funding Amount'),
    number_of_employees: Yup.number().transform((value, originalValue) => {
        return Number(originalValue.toString().replace(/,/g, ''));
    }).typeError('Invalid Number of Employees').label('Number of Employees'),
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
    selectedAssetTypeImages: File[] | null;
    selectedIssuerProfileImages: File[] | null;
    selectedIssuerProfileFiles: File[] | null;
    focusedInitialOfferingDate: any;
    focusedInitialPricePerShare: {
        [key: number]: boolean;
    };
    selectedSecImages: File[] | null;
    selectedSecFiles: File[] | null;
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
            selectedAssetTypeImages: [],
            selectedIssuerProfileImages: [],
            selectedIssuerProfileFiles: [],
            focusedInitialOfferingDate: null,
            focusedInitialPricePerShare: {},
            selectedSecFiles: [],
            selectedSecImages: []
        }

        this.formRef = React.createRef();
    }

    initForm(data?: ICompanyProfile | null) {
        const action = data ? 'edit' : 'add';

        const initialData = {...data || {}} as ICompanyProfile;

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

        if (typeof initialData?.price_per_share_value === 'string') {
            try {
                const price_per_share_value = JSON.parse(initialData.price_per_share_value)
                initialData.price_per_share_value = price_per_share_value;
            } catch (error) {
                initialData.price_per_share_value = [""];
            }
        }

        if (typeof initialData?.price_per_share_date === 'string') {
            try {
                const price_per_share_date = JSON.parse(initialData.price_per_share_date)
                initialData.price_per_share_date = price_per_share_date;
            } catch (error) {
                initialData.price_per_share_date = [""];
            }
        }

        try {
            const asset_type_description = JSON.parse(initialData.asset_type_description.toString());
            initialData.asset_type_description = asset_type_description;
        } catch (error) {
            initialData.asset_type_description = [""];
        }

        try {
            const asset_type_images = JSON.parse(initialData.asset_type_images.toString().replace(/'/g, '"'));
            initialData.asset_type_images = asset_type_images;
        } catch (error) {
            initialData.asset_type_images = [];
        }

        try {
            const issuer_profile_description = JSON.parse(initialData.issuer_profile_description.toString());
            initialData.issuer_profile_description = issuer_profile_description;
        } catch (error) {
            initialData.issuer_profile_description = [""];
        }

        try {
            const issuer_profile_images = JSON.parse(initialData.issuer_profile_images.toString().replace(/'/g, '"'));
            initialData.issuer_profile_images = issuer_profile_images;
        } catch (error) {
            initialData.issuer_profile_images = [];
        }

        try {
            const issuer_profile_files = JSON.parse(initialData.issuer_profile_files.toString().replace(/'/g, '"'));
            initialData.issuer_profile_files = issuer_profile_files;
        } catch (error) {
            initialData.issuer_profile_files = [];
        }

        try {
            const sec_description = JSON.parse(initialData.sec_description.toString());
            initialData.sec_description = sec_description;
        } catch (error) {
            initialData.sec_description = [""];
        }

        try {
            const sec_images = JSON.parse(initialData.sec_images.toString().replace(/'/g, '"'));
            initialData.sec_images = sec_images;
        } catch (error) {
            initialData.sec_images = [];
        }

        try {
            const sec_files = JSON.parse(initialData.sec_files.toString().replace(/'/g, '"'));
            initialData.sec_files = sec_files;
        } catch (error) {
            initialData.sec_files = [];
        }


        const initialValues: {
            symbol: string;
            asset_type: string;
            asset_type_option: string;
            asset_type_description: string[];
            asset_type_images: string[];
            total_shares_outstanding: string;
            initial_offering_date: string;
            price_per_share_value: string[];
            price_per_share_date: string[];
            company_name: string;
            business_description: string;
            street_address_1: string;
            street_address_2: string;
            city: string;
            state: string;
            zip_code: string;
            country: string;
            email: string;
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
            issuer_profile_description: string[];
            issuer_profile_images: string[];
            issuer_profile_files: string[];
            spv_name: string;
            fund_manager: string;
            investment_objective: string;
            sec_filing: string;
            sec_description: string[];
            sec_images: string[];
            sec_files: string[];
        } = {
            symbol: initialData?.symbol || this.props.symbol || '',
            total_shares_outstanding: initialData?.total_shares_outstanding || '',
            initial_offering_date: initialData?.initial_offering_date || '',
            price_per_share_value: initialData?.price_per_share_value || [""],
            price_per_share_date: initialData?.price_per_share_date || [""],
            asset_type: initialData?.asset_type || '',
            asset_type_option: initialData?.asset_type_option || '',
            asset_type_description: initialData?.asset_type_description || [""],
            asset_type_images: initialData?.asset_type_images || [],
            issuer_profile_option: initialData?.issuer_profile_option || '',
            issuer_profile_description: initialData?.issuer_profile_description || [""],
            issuer_profile_images: initialData?.issuer_profile_images || [],
            issuer_profile_files: initialData?.issuer_profile_files || [],
            company_name: initialData?.company_name || '',
            business_description: initialData?.business_description || '',
            street_address_1: initialData?.street_address_1 || '',
            street_address_2: initialData?.street_address_2 || '',
            city: initialData?.city || '',
            state: initialData?.state || '',
            zip_code: initialData?.zip_code || '',
            country: initialData?.country || selectedCountry,
            email: initialData?.email || '',
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
            spv_name: initialData?.spv_name || '',
            fund_manager: initialData?.fund_manager || '',
            investment_objective: initialData?.investment_objective || '',
            sec_filing: initialData?.sec_filing || '',
            sec_description: initialData?.sec_description || [""],
            sec_images: initialData?.sec_images || [],
            sec_files: initialData?.sec_files || [],
        };

        const selectedAssetTypeImages = initialData.asset_type_images as any
        const selectedIssuerProfileImages = initialData.issuer_profile_images as any
        const selectedIssuerProfileFiles = initialData.issuer_profile_files as any

        this.setState({
            formInitialValues: initialValues,
            selectedCountry: initialValues.country,
            action: action,
            selectedAssetTypeImages: selectedAssetTypeImages,
            selectedIssuerProfileImages: selectedIssuerProfileImages,
            selectedIssuerProfileFiles: selectedIssuerProfileFiles,
        })
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getSymbols()
                .finally(() => this.setState({isLoading: false}))
        });

    }

    getSymbols = () => {
        return new Promise(resolve => {
            symbolService.getSymbols(this.props.symbol)
                .then((res: Array<ISymbol>) => {
                    let data = res || [];

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

        let data = {...values};

        data = formValidator.castFormValues(data, formSchema);

        data.total_shares_outstanding = (Number(data.total_shares_outstanding) == 0 ? '' : data.total_shares_outstanding).toString()
        data.number_of_employees = (Number(data.number_of_employees) == 0 ? '' : data.number_of_employees).toString()

        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value as any);
        }

        formData.delete('asset_type_description');
        const asset_type_description = data.asset_type_description;
        formData.append('asset_type_description', JSON.stringify(asset_type_description));

        formData.delete('issuer_profile_description');
        const issuer_profile_description = data.issuer_profile_description;
        formData.append('issuer_profile_description', JSON.stringify(issuer_profile_description));

        const officerValues = data.company_officers_and_contacts;
        formData.append('company_officers_and_contacts', JSON.stringify(officerValues));

        const directorsValues = data.board_of_directors;
        formData.append('board_of_directors', JSON.stringify(directorsValues));

        const pricePerShareValues = data.price_per_share_value;
        pricePerShareValues.forEach((s, index) => {
            const value = Number((pricePerShareValues[index]).toString().replace(/,/g, ''));
            pricePerShareValues[index] = (Number(value) === 0 ? '' : s).toString();
        });
        formData.append('price_per_share_value', JSON.stringify(pricePerShareValues));

        const pricePerShareDates = data.price_per_share_date;
        formData.append('price_per_share_date', JSON.stringify(pricePerShareDates));

        formData.delete('sec_description');
        const sec_description = data.sec_description;
        formData.append('sec_description', JSON.stringify(sec_description));

        formData.delete('logo');
        formData.delete('logo_tmp');
        formData.delete('asset_type_images');
        formData.delete('asset_type_image_tmp');
        formData.delete('issuer_profile_images');
        formData.delete('issuer_profile_image_tmp');
        formData.delete('issuer_profile_files');
        formData.delete('issuer_profile_file_tmp');
        formData.delete('sec_images');
        formData.delete('sec_image_tmp');
        formData.delete('sec_files');
        formData.delete('sec_file_tmp');


        if (this.state.selectedFile) {
            formData.append('logo', this.state.selectedFile);
        }

        if (this.state.selectedAssetTypeImages && this.state.selectedAssetTypeImages.length > 0) {
            for (const file of Array.from(this.state.selectedAssetTypeImages)) {
                formData.append('asset_type_images[]', file);
            }
        }

        if (this.state.selectedIssuerProfileImages && this.state.selectedIssuerProfileImages.length > 0) {
            for (const file of Array.from(this.state.selectedIssuerProfileImages)) {
                formData.append('issuer_profile_images[]', file);
            }
        }

        if (this.state.selectedIssuerProfileFiles && this.state.selectedIssuerProfileFiles.length > 0) {
            for (const file of Array.from(this.state.selectedIssuerProfileFiles)) {
                formData.append('issuer_profile_files[]', file);
            }
        }

        if (this.state.selectedSecImages && this.state.selectedSecImages.length > 0) {
            for (const file of Array.from(this.state.selectedSecImages)) {
                formData.append('sec_images[]', file);
            }
        }

        if (this.state.selectedSecFiles && this.state.selectedSecFiles.length > 0) {
            for (const file of Array.from(this.state.selectedSecFiles)) {
                formData.append('sec_files[]', file);
            }
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

    handleSecImageChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedSecImages || [])];
            updatedFiles[index] = selectedFile;
            return {selectedSecImages: updatedFiles} as CompanyProfilePageFormState;
        });
    };


    handleSecImageRemove = (index: number) => {
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles = (prevState.selectedSecImages || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedSecImages: updatedFiles};
        });
    };

    handleSecFileChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedSecFiles || [])];
            updatedFiles[index] = selectedFile;
            return {selectedSecFiles: updatedFiles} as CompanyProfilePageFormState;
        });
    };


    handleSecFileRemove = (index: number) => {
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles = (prevState.selectedSecFiles || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedSecFiles: updatedFiles};
        });
    };

    handleAssetTypeImageChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedAssetTypeImages || [])];
            updatedFiles[index] = selectedFile;
            return {...prevState, selectedAssetTypeImages: updatedFiles};
        });
    };


    handleAssetTypeImageRemove = (index: number) => {
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles = (prevState.selectedAssetTypeImages || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedAssetTypeImages: updatedFiles};
        });
    };


    handleIssuerProfileImageChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedIssuerProfileImages || [])];
            updatedFiles[index] = selectedFile;
            return {selectedIssuerProfileImages: updatedFiles} as CompanyProfilePageFormState;
        });
    };


    handleIssuerProfileImageRemove = (index: number) => {
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles = (prevState.selectedIssuerProfileImages || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedIssuerProfileImages: updatedFiles};
        });
    };

    handleIssuerProfileFileChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedIssuerProfileFiles || [])];
            updatedFiles[index] = selectedFile;
            return {selectedIssuerProfileFiles: updatedFiles} as CompanyProfilePageFormState;
        });
    };


    handleIssuerProfileFileRemove = (index: number) => {
        this.setState((prevState: CompanyProfilePageFormState) => {
            const updatedFiles = (prevState.selectedIssuerProfileFiles || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedIssuerProfileFiles: updatedFiles};
        });
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
                                        formValidator.requiredFields(formSchema, values, errors);
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

                                                                                {this.companyProfile?.logo && (
                                                                                    <div
                                                                                        className="mb-2 d-flex">
                                                                                        <Link
                                                                                            className={'link info-panel-title-link'}
                                                                                            href={`${this.host}${this.companyProfile?.logo}`}
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
                                                                        <div className="input__wrap mt-2">
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
                                                                                placeholder="Type Total Equity Funding Amount"
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
                                                                                renderMonthElement={formatterService.renderMonthElement}
                                                                                date={values.initial_offering_date ? moment(values.initial_offering_date) : null}
                                                                                onDateChange={date => setFieldValue('initial_offering_date', date?.format('YYYY-MM-DD').toString())}
                                                                                focused={this.state.focusedInitialOfferingDate}
                                                                                onFocusChange={({focused}) => this.setState({focusedInitialOfferingDate: focused})}
                                                                                id="initial_offering_date"
                                                                                displayFormat="YYYY-MM-DD"
                                                                                isOutsideRange={() => false}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                readOnly={true}
                                                                                placeholder={'Select Founded Date'}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="initial_offering_date"
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

                                                                    <div className="input__box full">
                                                                        <div className={'input__btns'}>
                                                                            <h4 className="input__group__title">Last
                                                                                Funding Amount:</h4>
                                                                            <button
                                                                                type="button"
                                                                                className={`border-grey-btn ripple ${isSubmitting || this.isShow() ? 'disable' : ''}`}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onClick={() => {
                                                                                    const updatedPricePerShareValues = [...values.price_per_share_value, ''];
                                                                                    const updatedPricePerShareDates = [...values.price_per_share_date, ''];
                                                                                    setFieldValue('price_per_share_value', updatedPricePerShareValues);
                                                                                    setFieldValue('price_per_share_date', updatedPricePerShareDates);
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon"
                                                                                    icon={faPlus}/>
                                                                            </button>
                                                                        </div>

                                                                    </div>
                                                                    <div className={'input__box full'}>
                                                                        <div className="input">
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <div className="officer-input">
                                                                                    {values.price_per_share_value.map((description, index) => (
                                                                                        <React.Fragment key={index}>
                                                                                            <div
                                                                                                className={'input__btns gap-20 align-items-start'}
                                                                                                key={index}>

                                                                                                <Field
                                                                                                    name={`price_per_share_value.${index}`}
                                                                                                    id={`price_per_share_value.${index}`}
                                                                                                    type="text"
                                                                                                    className="input__text"
                                                                                                    placeholder="Type Last Funding Amount"
                                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                                    component={NumericInputField}
                                                                                                    decimalScale={decimalPlaces}
                                                                                                />

                                                                                                <SingleDatePicker
                                                                                                    id={`price_per_share_date.${index}`}
                                                                                                    numberOfMonths={1}
                                                                                                    renderMonthElement={formatterService.renderMonthElement}
                                                                                                    date={values.price_per_share_date[index] ? moment(values.price_per_share_date[index]) : null}
                                                                                                    onDateChange={date => setFieldValue(`price_per_share_date.${index}`, date?.format('YYYY-MM-DD').toString())}
                                                                                                    focused={this.state.focusedInitialPricePerShare[index] || false}
                                                                                                    onFocusChange={({focused}) => {
                                                                                                        this.setState((prevState: any) => ({
                                                                                                            focusedInitialPricePerShare: {
                                                                                                                ...prevState.focusedInitialPricePerShare,
                                                                                                                [index]: focused
                                                                                                            }
                                                                                                        }));
                                                                                                    }}
                                                                                                    displayFormat="YYYY-MM-DD"
                                                                                                    isOutsideRange={() => false}
                                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                                    readOnly={true}
                                                                                                    placeholder={'Select Date'}
                                                                                                />

                                                                                                <button
                                                                                                    type="button"
                                                                                                    disabled={isSubmitting || this.isShow() || values.price_per_share_value.length < 2}
                                                                                                    className={`border-grey-btn ripple ${values.price_per_share_value.length < 2 ? 'disable' : ''}`}
                                                                                                    onClick={() => {
                                                                                                        const updatedPricePerShareValues = [...values.price_per_share_value];
                                                                                                        updatedPricePerShareValues.splice(index, 1)
                                                                                                        const updatedPricePerShareDates = [...values.price_per_share_date];
                                                                                                        updatedPricePerShareDates.splice(index, 1)
                                                                                                        setFieldValue('price_per_share_value', updatedPricePerShareValues);
                                                                                                        setFieldValue('price_per_share_date', updatedPricePerShareDates);
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faMinus}/>
                                                                                                </button>
                                                                                            </div>
                                                                                        </React.Fragment>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {values.asset_type !== '' && (
                                                                        <>
                                                                            <div className="input__box full">
                                                                                <div className={'input__btns'}>
                                                                                    <h4 className="input__group__title">{values.asset_type} Additional
                                                                                        Fields:</h4>
                                                                                    <button
                                                                                        type="button"
                                                                                        className='border-grey-btn ripple'
                                                                                        onClick={() => {
                                                                                            const updatedDescriptions = [...values.asset_type_description, ''];
                                                                                            const index = updatedDescriptions.length - 1 || 0
                                                                                            setFieldValue('asset_type_description', updatedDescriptions);
                                                                                            this.handleAssetTypeImageChange(null, index);
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faPlus}/>
                                                                                    </button>
                                                                                </div>

                                                                            </div>
                                                                            <div className={'input__box full'}>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                        <div className="officer-input">
                                                                                            {values.asset_type_description.map((description, index) => (
                                                                                                <React.Fragment
                                                                                                    key={index}>
                                                                                                    <div
                                                                                                        className={'input__btns gap-20'}>
                                                                                                        <div
                                                                                                            className={`input__wrap no-border margin-top-unset ${(isSubmitting || this.isShow()) ? 'disable' : ''} pb-0`}>
                                                                                                            {!this.isShow() && values.asset_type_images[index] && (
                                                                                                                <div
                                                                                                                    key={index}
                                                                                                                    className="mb-2 d-flex">
                                                                                                                    <Link
                                                                                                                        className={'link info-panel-title-link'}
                                                                                                                        href={`${this.host}${values.asset_type_images[index]}`}
                                                                                                                        target={'_blank'}>
                                                                                                                        Image
                                                                                                                        #{index + 1} {' '}
                                                                                                                        <FontAwesomeIcon
                                                                                                                            className="nav-icon"
                                                                                                                            icon={faArrowUpRightFromSquare}/>
                                                                                                                    </Link>
                                                                                                                </div>
                                                                                                            )}
                                                                                                            <input
                                                                                                                id={`asset_type_image_tmp.${index}`}
                                                                                                                name={`asset_type_image_tmp.${index}`}
                                                                                                                type="file"
                                                                                                                accept={'.' + allowedImageExt.join(',.')}
                                                                                                                className={`input__file`}
                                                                                                                disabled={isSubmitting}
                                                                                                                onChange={(event) => {
                                                                                                                    setFieldValue(`asset_type_image_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                                    this.handleAssetTypeImageChange(event, index);
                                                                                                                }}
                                                                                                            />
                                                                                                        </div>
                                                                                                        <Field
                                                                                                            name={`asset_type_description.${index}`}
                                                                                                            as="textarea"
                                                                                                            rows={4}
                                                                                                            className="input__textarea"
                                                                                                            placeholder={''}
                                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                                        />

                                                                                                        <button
                                                                                                            type="button"
                                                                                                            disabled={isSubmitting || this.isShow() || values.asset_type_description.length < 2}
                                                                                                            className={`border-grey-btn ripple ${isSubmitting || this.isShow() || values.asset_type_description.length < 2 ? 'disable' : ''}`}
                                                                                                            onClick={() => {
                                                                                                                const updatedDescriptions = [...values.asset_type_description];
                                                                                                                updatedDescriptions.splice(index, 1);
                                                                                                                setFieldValue('asset_type_description', updatedDescriptions);
                                                                                                                this.handleAssetTypeImageRemove(index)
                                                                                                            }}
                                                                                                        >
                                                                                                            <FontAwesomeIcon
                                                                                                                className="nav-icon"
                                                                                                                icon={faMinus}/>
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    {errors.asset_type_image_tmp && errors.asset_type_image_tmp[index] && (
                                                                                                        <div
                                                                                                            className="error-message input__btns">{errors.asset_type_image_tmp[index].toString()}</div>
                                                                                                    )}
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>


                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    <div className="input__box full">
                                                                        <div className={'input__btns'}>
                                                                            <h4 className="input__group__title">Issuer
                                                                                Profile Fields:</h4>
                                                                            <button
                                                                                type="button"
                                                                                className={`border-grey-btn ripple ${isSubmitting || this.isShow() ? 'disable' : ''}`}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onClick={() => {
                                                                                    const updatedDescriptions = [...values.issuer_profile_description, ''];
                                                                                    const index = updatedDescriptions.length - 1 || 0
                                                                                    setFieldValue('issuer_profile_description', updatedDescriptions);
                                                                                    this.handleIssuerProfileImageChange(null, index);
                                                                                    this.handleIssuerProfileFileChange(null, index);
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon"
                                                                                    icon={faPlus}/>
                                                                            </button>
                                                                        </div>

                                                                    </div>
                                                                    <div className={'input__box full'}>
                                                                        <div className="input">
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <div className="officer-input">
                                                                                    {values.issuer_profile_description.map((description, index) => (
                                                                                        <React.Fragment key={index}>
                                                                                            <div
                                                                                                className={'input__btns gap-20'}
                                                                                                key={index}>
                                                                                                <div
                                                                                                    className={`input__wrap no-border margin-top-unset ${(isSubmitting || this.isShow()) ? 'disable' : ''} pb-0`}>
                                                                                                    {!this.isShow() && values.issuer_profile_images[index] && (
                                                                                                        <div key={index}
                                                                                                             className="mb-2 d-flex">
                                                                                                            <Link
                                                                                                                className={'link info-panel-title-link'}
                                                                                                                href={`${this.host}${values.asset_type_images[index]}`}
                                                                                                                target={'_blank'}>
                                                                                                                Image
                                                                                                                #{index + 1} {' '}
                                                                                                                <FontAwesomeIcon
                                                                                                                    className="nav-icon"
                                                                                                                    icon={faArrowUpRightFromSquare}/>
                                                                                                            </Link>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <input
                                                                                                        id={`issuer_profile_image_tmp.${index}`}
                                                                                                        name={`issuer_profile_image_tmp.${index}`}
                                                                                                        type="file"
                                                                                                        accept={'.' + allowedImageExt.join(',.')}
                                                                                                        className={`input__file`}
                                                                                                        disabled={isSubmitting}
                                                                                                        onChange={(event) => {
                                                                                                            setFieldValue(`issuer_profile_image_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                            this.handleIssuerProfileImageChange(event, index);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>

                                                                                                <Field
                                                                                                    name={`issuer_profile_description.${index}`}
                                                                                                    as="textarea"
                                                                                                    rows={4}
                                                                                                    className="input__textarea"
                                                                                                    placeholder={''}
                                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                                />
                                                                                                <div
                                                                                                    className={`input__wrap no-border margin-top-unset ${(isSubmitting || this.isShow()) ? 'disable' : ''} pb-0`}>
                                                                                                    {!this.isShow() && values.issuer_profile_files[index] && (
                                                                                                        <div key={index}
                                                                                                             className="mb-2 d-flex">
                                                                                                            <Link
                                                                                                                className={'link info-panel-title-link'}
                                                                                                                href={`${this.host}${values.issuer_profile_files[index]}`}
                                                                                                                target={'_blank'}>
                                                                                                                File
                                                                                                                {' '}
                                                                                                                <FontAwesomeIcon
                                                                                                                    className="nav-icon"
                                                                                                                    icon={faArrowUpRightFromSquare}/>
                                                                                                            </Link>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <input
                                                                                                        id={`issuer_profile_file_tmp.${index}`}
                                                                                                        name={`issuer_profile_file_tmp.${index}`}
                                                                                                        type="file"
                                                                                                        accept={'.' + allowedFileExt.join(',.')}
                                                                                                        className={`input__file`}
                                                                                                        disabled={isSubmitting}
                                                                                                        onChange={(event) => {
                                                                                                            setFieldValue(`issuer_profile_file_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                            this.handleIssuerProfileFileChange(event, index);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>

                                                                                                <button
                                                                                                    type="button"
                                                                                                    disabled={isSubmitting || this.isShow() || values.issuer_profile_description.length < 2}
                                                                                                    className={`border-grey-btn ripple ${values.issuer_profile_description.length < 2 ? 'disable' : ''}`}
                                                                                                    onClick={() => {
                                                                                                        const updatedDescriptions = [...values.issuer_profile_description];
                                                                                                        updatedDescriptions.splice(index, 1);
                                                                                                        setFieldValue('issuer_profile_description', updatedDescriptions);
                                                                                                        this.handleIssuerProfileImageRemove(index)
                                                                                                        this.handleIssuerProfileFileRemove(index)
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faMinus}/>
                                                                                                </button>
                                                                                            </div>
                                                                                            {errors.asset_type_image_tmp && errors.asset_type_image_tmp[index] && (
                                                                                                <div
                                                                                                    className="error-message input__btns">{errors.asset_type_image_tmp[index].toString()}</div>
                                                                                            )}
                                                                                        </React.Fragment>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>


                                                                    </div>

                                                                    <div className={'d-none'}>
                                                                        <div
                                                                            className={'input__box full'}>
                                                                            <h4 className={'input__group__title'}>Details:</h4>
                                                                        </div>

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">SPV
                                                                                Name
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="spv_name"
                                                                                    id="spv_name"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type SPV Name"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="spv_name"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">Fund
                                                                                Manager
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="fund_manager"
                                                                                    id="fund_manager"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type Fund Manager"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="fund_manager"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">Investment
                                                                                Objective
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="investment_objective"
                                                                                    id="investment_objective"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type Investment Objective"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="investment_objective"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">SEC
                                                                                Filing
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="sec_filing"
                                                                                    id="sec_filing"
                                                                                    render={({field}: FieldProps<any>) => (
                                                                                        <InputMask
                                                                                            {...field}
                                                                                            mask="9999-9999-99"
                                                                                            placeholder="Type SEC Filing"
                                                                                            className="input__text"
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="sec_filing"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input__box full">
                                                                            <div className={'input__btns'}>
                                                                                <h4 className="input__group__title">SEC
                                                                                    Documents:</h4>
                                                                                <button
                                                                                    type="button"
                                                                                    className={`border-grey-btn ripple ${isSubmitting || this.isShow() ? 'disable' : ''}`}
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                    onClick={() => {
                                                                                        const updatedDescriptions = [...values.sec_description, ''];
                                                                                        const index = updatedDescriptions.length - 1 || 0
                                                                                        setFieldValue('sec_description', updatedDescriptions);
                                                                                        this.handleSecImageChange(null, index);
                                                                                        this.handleSecFileChange(null, index);
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon
                                                                                        className="nav-icon"
                                                                                        icon={faPlus}/>
                                                                                </button>
                                                                            </div>

                                                                        </div>

                                                                        <div className={'input__box full'}>
                                                                            <div className="input">
                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <div
                                                                                        className="officer-input">
                                                                                        {values.sec_description.map((description, index) => (
                                                                                            <React.Fragment key={index}>
                                                                                                <div
                                                                                                    className={'input__btns gap-20'}>
                                                                                                    <div
                                                                                                        className={`input__wrap no-border margin-top-unset ${(isSubmitting || this.isShow()) ? 'disable' : ''} pb-0`}>
                                                                                                        {!this.isShow() && values.sec_images[index] && (
                                                                                                            <div
                                                                                                                key={index}
                                                                                                                className="mb-2 d-flex">
                                                                                                                <Link
                                                                                                                    className={'link info-panel-title-link'}
                                                                                                                    href={`${this.host}${values.sec_images[index]}`}
                                                                                                                    target={'_blank'}>
                                                                                                                    Image
                                                                                                                    #{index + 1} {' '}
                                                                                                                    <FontAwesomeIcon
                                                                                                                        className="nav-icon"
                                                                                                                        icon={faArrowUpRightFromSquare}/>
                                                                                                                </Link>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <input
                                                                                                            id={`sec_image_tmp.${index}`}
                                                                                                            name={`sec_image_tmp.${index}`}
                                                                                                            type="file"
                                                                                                            accept={'.' + allowedImageExt.join(',.')}
                                                                                                            className={`input__file`}
                                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                                            onChange={(event) => {
                                                                                                                setFieldValue(`sec_image_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                                this.handleSecImageChange(event, index);
                                                                                                            }}
                                                                                                        />
                                                                                                    </div>

                                                                                                    <Field
                                                                                                        name={`sec_description.${index}`}
                                                                                                        as="textarea"
                                                                                                        rows={4}
                                                                                                        className="input__textarea"
                                                                                                        placeholder={''}
                                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                                    />
                                                                                                    <div
                                                                                                        className={`input__wrap no-border margin-top-unset ${(isSubmitting || this.isShow()) ? 'disable' : ''} pb-0`}>
                                                                                                        {!this.isShow() && values.sec_files[index] && (
                                                                                                            <div
                                                                                                                key={index}
                                                                                                                className="mb-2 d-flex">
                                                                                                                <Link
                                                                                                                    className={'link info-panel-title-link'}
                                                                                                                    href={`${this.host}${values.sec_files[index]}`}
                                                                                                                    target={'_blank'}>
                                                                                                                    File
                                                                                                                    {' '}
                                                                                                                    <FontAwesomeIcon
                                                                                                                        className="nav-icon"
                                                                                                                        icon={faArrowUpRightFromSquare}/>
                                                                                                                </Link>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <input
                                                                                                            id={`sec_file_tmp.${index}`}
                                                                                                            name={`sec_file_tmp.${index}`}
                                                                                                            type="file"
                                                                                                            accept={'.' + allowedFileExt.join(',.')}
                                                                                                            className={`input__file`}
                                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                                            onChange={(event) => {
                                                                                                                setFieldValue(`sec_file_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                                this.handleSecFileChange(event, index);
                                                                                                            }}
                                                                                                        />
                                                                                                    </div>

                                                                                                    <button
                                                                                                        type="button"
                                                                                                        disabled={isSubmitting || this.isShow() || values.sec_description.length < 2}
                                                                                                        className={`border-grey-btn ripple ${values.sec_description.length < 2 ? 'disable' : ''}`}
                                                                                                        onClick={() => {
                                                                                                            const updatedDescriptions = [...values.sec_description];
                                                                                                            updatedDescriptions.splice(index, 1);
                                                                                                            setFieldValue('sec_description', updatedDescriptions);
                                                                                                            this.handleSecImageRemove(index)
                                                                                                            this.handleSecFileRemove(index)
                                                                                                        }}
                                                                                                    >
                                                                                                        <FontAwesomeIcon
                                                                                                            className="nav-icon"
                                                                                                            icon={faMinus}/>
                                                                                                    </button>
                                                                                                </div>
                                                                                                {errors.sec_image_tmp && errors.sec_image_tmp[index] && (
                                                                                                    <div
                                                                                                        className="error-message input__btns">{errors.sec_image_tmp[index].toString()}</div>
                                                                                                )}
                                                                                            </React.Fragment>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>


                                                                        </div>
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
                                                                                className="input__title">State
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
                                                                        <div className="input__title">Email
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="email"
                                                                                id="email"
                                                                                type="email"
                                                                                className="input__text"
                                                                                placeholder="Type an Email Address"
                                                                                autoComplete="username"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="email"
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
                                                                                className={`border-grey-btn ripple ${isSubmitting || this.isShow() ? 'disable' : ''}`}
                                                                                disabled={isSubmitting || this.isShow()}
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
                                                                                            disabled={isSubmitting || this.isShow() || values.company_officers_and_contacts.length < 2}
                                                                                            className={`border-grey-btn ripple ${isSubmitting || this.isShow() || values.company_officers_and_contacts.length < 2 ? 'disable' : ''}`}
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
                                                                                className={`border-grey-btn ripple ${isSubmitting || this.isShow() ? 'disable' : ''}`}
                                                                                disabled={isSubmitting || this.isShow()}
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
                                                                                            disabled={isSubmitting || this.isShow() || values.board_of_directors.length < 2}
                                                                                            className={`border-grey-btn ripple ${isSubmitting || this.isShow() || values.board_of_directors.length < 2 ? 'disable' : ''}`}
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
