import React, {RefObject} from 'react';
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import {UsaStates} from "usa-states";
import {UnderpinningAssetValue} from "@/enums/underpinning-asset-value";
import {RedeemabilityType} from "@/enums/redeemability-type";
import formatterService from "@/services/formatter/formatter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faEdit} from "@fortawesome/free-solid-svg-icons";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import UserPermissionService from "@/services/user/user-permission-service";
import {IDataContext} from "@/interfaces/i-data-context";
import * as Yup from "yup";
import {getLotSize} from "@/enums/lot-size";
import dsinService from "@/services/dsin/dsin-service";
import {FormStatus, getApprovedFormStatus, getBuildableFormStatuses} from "@/enums/form-status";
import {ErrorMessage, Field, Form, Formik} from "formik";
import moment from 'moment';
import 'react-dates/initialize';
import {SingleDatePicker} from "react-dates";
import 'react-dates/lib/css/_datepicker.css';
import {FifthCharacterIdentifier} from "@/enums/fifth-character-identifier";
import {AlternativeAssetCategory, getAlternativeAssetSubCategory} from "@/enums/alternative-asset-category";
import {ExemptedOfferingType} from "@/enums/exempted-offering-type";
import {MarketSector} from "@/enums/market-sector";
import NumericInputField from "@/components/numeric-input-field";
import {DigitalAssetCategory, getDigitalAssetCategoryInstrument} from "@/enums/digital-asset-category";
import {IssuerType} from "@/enums/issuer-type";
import {RightsType} from "@/enums/rights-type";
import {EnforceabilityType} from "@/enums/enforceability-type";
import {FungibilityType} from "@/enums/fungibility-type";
import {NatureOfRecord} from "@/enums/nature-of-record";
import AlertBlock from "@/components/alert-block";


const formSchema = Yup.object().shape({
    reason_for_entry: Yup.string().required('Required').label('Reason for Entry'),
    symbol: Yup.string().min(2).max(5).required('Required').label('Symbol'),
    is_cusip: Yup.boolean().label('CUSIP'),
    cusip: Yup.string().min(3).max(9).label('CUSIP')
        .when('is_cusip', {
            is: (v: boolean) => v,
            then: (schema) => schema.required('Required')
        }),
    dsin: Yup.string().label('DSIN'),
    primary_ats: Yup.string().min(3).max(50).required('Required').label('Primary ATS'),
    transfer_agent: Yup.string().min(3).max(50).label('Transfer Agent'),
    custodian: Yup.string().min(3).max(50).label('Custodian'),
    market_sector: Yup.string().min(3).max(50).required('Required').label('Market Sector'),
    lot_size: Yup.number().required('Required')
        .required('Required')
        .test('is-valid-lot-size', `Invalid Lot Size. Example ${getLotSize().join(', ')}`, (value) => {
            return getLotSize().includes(value);
        })
        .label('Lot Size'),
    fractional_lot_size: Yup.number()
        .typeError('Invalid Fractional Lot Size')
        .test('is-fractional', 'Invalid Fractional Lot Size. Example: .01. .001, .0001 and etc.', function (value) {
            if (value === null || value === undefined) {
                return true;
            }

            return /^0\.0*1$/.test(formatterService.toPlainString(value.toString()));
        })
        .test('max-decimal-places', 'Maximum of 6 decimal places allowed.', function (value) {
            if (value === null || value === undefined) {
                return true;
            }

            const [, decimal] = formatterService.toPlainString(value.toString()).split('.');

            if (decimal) {
                return decimal.length <= 6;
            }
            return true;
        })
        .label('Fractional Lot Size'),

    mvp: Yup.number()
        .typeError('Invalid MVP')
        .test('is-fractional', 'Invalid MVP. Example: .01, 05, .10 and etc.', function (value) {
            if (value === null || value === undefined) {
                return true;
            }
            return Number.isFinite(value) && value % 1 !== 0;
        })
        .test('max-decimal-places', 'Maximum of 4 decimal places allowed.', function (value) {
            if (value === null || value === undefined) {
                return true;
            }

            const [, decimal] = formatterService.toPlainString(value.toString()).split('.');

            if (decimal) {
                return decimal.length <= 4;
            }
            return true;
        })
        .label('MVP'),
    security_name: Yup.string().min(3).max(50).required('Required').label('Security Name'),
    digital_asset_category: Yup.string().label('Digital Asset Category'),
    instrument_type: Yup.string().label('Instrument type'),
    alternative_asset_category: Yup.string().label('Alternative Asset'),
    alternative_asset_subcategory: Yup.string().label('Alternative Asset Category'),
    issuer_name: Yup.string().label('Issuer Name'),
    issuer_type: Yup.string().label('Issuer Type'),
    underpinning_asset_value: Yup.string().label('Underpinning Asset Value'),
    reference_asset: Yup.string().label('Reference Asset'),
    market_dynamics_description: Yup.string().label('Market Dynamics Description'),
    rights_type: Yup.string().label('Rights Type'),
    enforceability_type: Yup.string().label('Enforceability'),
    fungibility_type: Yup.string().label('Fungibility'),
    redeemability_type: Yup.string().label('Redeemable/Non-Redeemable'),
    redemption_asset_type: Yup.string().label('Redemption Asset Type'),
    fifth_character_identifier: Yup.string().label('Fifth Character Identifiers'),
    nature_of_record: Yup.string().label('Nature of Record'),
    is_change: Yup.boolean(),
    new_dsin: Yup.string().label('DSIN'),
    date_entered_change: Yup.string(),
    time_entered_change: Yup.string(),
    date_effective_change: Yup.string().when('is_change', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    time_effective_change: Yup.string().when('is_change', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    new_symbol: Yup.string().when('is_change', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    new_security_name: Yup.string().when('is_change', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    reason_change: Yup.string(),
    is_delete: Yup.boolean(),
    date_entered_delete: Yup.string(),
    time_entered_delete: Yup.string(),
    date_effective_delete: Yup.string().when('is_delete', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    time_effective_delete: Yup.string().when('is_delete', {
        is: (is_change: boolean) => is_change,
        then: (schema) => schema.required('Required')
    }),
    reason_delete: Yup.string()

});

interface SymbolPageFormProps extends ICallback {
    symbol?: string;
    action: string;
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

interface SymbolPageFormState extends IState, IModalState {
    isLoading: boolean;
    isOpenCompanyModal: boolean;
    formCompanyAction: string;
    errors: string[];
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    companyProfileAccess: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    },
    modalTitle: string;
    formAction: string;
    symbol: ISymbol | null;
    formCompanyData: ICompanyProfile | null;

    formInitialValues: {},
    focusedInputDateEntered: any;
    focusedInputDateEffective: any;
    focusedInputDateEnteredDelete: any;
    focusedInputDateEffectiveDelete: any;
}

class SymbolPageForm extends React.Component<SymbolPageFormProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: SymbolPageFormState;
    companyProfile: ICompanyProfile | null;
    symbol: ISymbol | null;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    targetTimeZone = 'UTC';
    formRef: RefObject<any>;

    constructor(props: SymbolPageFormProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;


        const companyProfileAccess = UserPermissionService.getAccessRulesByComponent(
            'CompanyProfileBlock',
            this.context.userProfile.access
        );

        this.companyProfile = null;
        this.symbol = null;
        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            errors: [],
            isOpenCompanyModal: false,
            formCompanyAction: 'add',
            usaStates: usaStatesList,
            companyProfileAccess: companyProfileAccess,
            modalTitle: '',
            formAction: 'edit',
            symbol: null,
            formCompanyData: null,

            formInitialValues: {},
            focusedInputDateEntered: null,
            focusedInputDateEffective: null,
            focusedInputDateEnteredDelete: null,
            focusedInputDateEffectiveDelete: null,
        }

        this.formRef = React.createRef();
    }

    initForm(data?: ISymbol) {
        const initialTime = moment().format('HH:mm');
        const initialData = data || {} as ISymbol;

        const initialValues: {
            reason_for_entry: string;
            symbol: string;
            is_cusip: boolean;
            cusip: string;
            dsin: string;
            primary_ats: string;
            transfer_agent: string;
            custodian: string;
            market_sector: string;
            lot_size: string;
            fractional_lot_size: string;
            mvp: string;
            security_name: string;
            fifth_character_identifier: string;
            digital_asset_category: string;
            instrument_type: string;
            alternative_asset_category: string;
            alternative_asset_subcategory: string;
            exempted_offerings: string;
            issuer_name: string;
            issuer_type: string;
            underpinning_asset_value: string;
            reference_asset: string;
            market_dynamics_description: string;
            rights_type: string;
            enforceability_type: string;
            fungibility_type: string;
            redeemability_type: string;
            redemption_asset_type: string;
            nature_of_record: string;
            is_change: boolean;
            new_dsin: string;
            new_symbol: string;
            new_security_name: string;
            date_entered_change: string;
            time_entered_change: string;
            date_effective_change: string;
            time_effective_change: string;
            reason_change: string;
            is_delete: boolean;
            date_entered_delete: string;
            time_entered_delete: string;
            date_effective_delete: string;
            time_effective_delete: string;
            reason_delete: string;
            status: string;
            edgar_cik: string;
        } = {
            reason_for_entry: initialData?.reason_for_entry || 'New Ticker Symbol',
            symbol: initialData?.symbol || '',
            cusip: initialData?.cusip || '',
            is_cusip: initialData?.is_cusip || false,
            dsin: initialData?.dsin || '',
            primary_ats: initialData?.primary_ats || '',
            transfer_agent: initialData?.transfer_agent || '',
            custodian: initialData?.custodian || '',
            market_sector: initialData?.market_sector || '',
            lot_size: (initialData?.lot_size || getLotSize()[0]).toString(),
            fractional_lot_size: formatterService.toPlainString(initialData?.fractional_lot_size?.toString()),
            mvp: formatterService.toPlainString(initialData?.mvp?.toString()),
            security_name: initialData?.security_name || '',
            fifth_character_identifier: initialData?.fifth_character_identifier || '',
            digital_asset_category: initialData?.digital_asset_category || '',
            instrument_type: initialData?.instrument_type || '',
            alternative_asset_category: initialData?.alternative_asset_category || '',
            alternative_asset_subcategory: initialData?.alternative_asset_subcategory || '',
            exempted_offerings: initialData?.exempted_offerings || '',
            issuer_name: initialData?.issuer_name || '',
            issuer_type: initialData?.issuer_type || '',
            underpinning_asset_value: initialData?.underpinning_asset_value || '',
            reference_asset: initialData?.reference_asset || '',
            market_dynamics_description: initialData?.market_dynamics_description || '',
            rights_type: initialData?.rights_type || '',
            enforceability_type: initialData?.enforceability_type || '',
            fungibility_type: initialData?.fungibility_type || '',
            redeemability_type: initialData?.redeemability_type || '',
            redemption_asset_type: initialData?.redemption_asset_type || '',
            nature_of_record: initialData?.nature_of_record || '',
            is_change: !!initialData?.new_symbol && !!initialData?.new_security_name,
            new_dsin: dsinService.generate(initialData?.new_symbol || ''),
            date_entered_change: initialData?.date_entered_change || moment().format('YYYY-MM-DD'),
            time_entered_change: initialData?.time_entered_change ? moment.tz(`${moment().format('YYYY-MM-DD')} ${initialData?.time_entered_change}`, 'YYYY-MM-DD HH:mm:ss', this.targetTimeZone)
                .tz(this.userTimeZone).format('HH:mm:ss') || moment().format('YYYY-MM-DD') : initialTime,
            date_effective_change: initialData?.date_effective_change || '',
            time_effective_change: initialData?.time_effective_change ? moment.tz(`${moment().format('YYYY-MM-DD')} ${initialData?.time_effective_change}`, 'YYYY-MM-DD HH:mm:ss', this.targetTimeZone)
                .tz(this.userTimeZone).format('HH:mm:ss') || moment().format('YYYY-MM-DD') : initialTime,
            new_symbol: initialData?.new_symbol || '',
            new_security_name: initialData?.new_security_name || '',
            reason_change: initialData?.reason_change || '',
            is_delete: this.props.action === 'delete',
            date_entered_delete: initialData?.date_entered_delete || moment().format('YYYY-MM-DD'),
            time_entered_delete: initialData?.time_entered_delete ? moment.tz(`${moment().format('YYYY-MM-DD')} ${initialData?.time_entered_delete}`, 'YYYY-MM-DD HH:mm:ss', this.targetTimeZone)
                .tz(this.userTimeZone).format('HH:mm:ss') || moment().format('YYYY-MM-DD') : initialTime,
            date_effective_delete: initialData?.date_effective_delete || '',
            time_effective_delete: initialData?.time_effective_delete ? moment.tz(`${moment().format('YYYY-MM-DD')} ${initialData?.time_effective_delete}`, 'YYYY-MM-DD HH:mm:ss', this.targetTimeZone)
                .tz(this.userTimeZone).format('HH:mm:ss') || moment().format('YYYY-MM-DD') : initialTime,
            reason_delete: initialData?.reason_delete || '',
            status: initialData?.status || '',
            edgar_cik: initialData?.edgar_cik || '',
        };

        this.setState({formInitialValues: initialValues})
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols();
    }

    isShow(): boolean {
        return this.props.action === 'view' || getBuildableFormStatuses().includes((this.state.formInitialValues as ISymbol)?.status.toLowerCase() as FormStatus);
    }

    handleSymbol(value: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
        const alphanumericValue = value.slice(0, 5).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setFieldValue('symbol', alphanumericValue);

        const dsin = dsinService.generate(alphanumericValue)
        setFieldValue('dsin', dsin);
    }

    handleNewSymbol(value: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
        const alphanumericValue = value.slice(0, 5).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setFieldValue('new_symbol', alphanumericValue);

        const dsin = dsinService.generate(alphanumericValue)
        setFieldValue('new_dsin', dsin);
    }

    handlePeggedChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("underpinning_asset_value", value);

        if (value == UnderpinningAssetValue.UNPEGED || value === '') {
            await setFieldValue("reference_asset", '');
        }

    };

    handleRedeemabilityChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("redeemability_type", value);

        if (value === RedeemabilityType.NON_REDEEMABLE || value === '') {
            await setFieldValue("redemption_asset_type", '');
        }
    };

    handleSecurityNameChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("security_name", value);
        await setFieldValue("issuer_name", value);
    };

    handleCusipChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isFinra = e.target.value === 'false';
        setFieldValue("is_cusip", isFinra);
        setFieldValue("cusip", "");
    };

    handleSubmit = async (values: ISymbol, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const data = {...values};

        if (data.time_entered_change !== '') {
            data.time_entered_change = moment.tz(`${moment().format('YYYY-MM-DD')} ${data.time_entered_change}`, 'YYYY-MM-DD HH:mm:ss', this.userTimeZone)
                .tz(this.targetTimeZone)
                .format('HH:mm:ss');
        }

        if (data.time_effective_change !== '') {
            data.time_effective_change = moment.tz(`${moment().format('YYYY-MM-DD')} ${data.time_effective_change}`, 'YYYY-MM-DD HH:mm:ss', this.userTimeZone)
                .tz(this.targetTimeZone)
                .format('HH:mm:ss');
        }

        if (data.time_entered_delete !== '') {
            data.time_entered_delete = moment.tz(`${moment().format('YYYY-MM-DD')} ${data.time_entered_delete}`, 'YYYY-MM-DD HH:mm:ss', this.userTimeZone)
                .tz(this.targetTimeZone)
                .format('HH:mm:ss');
        }

        if (data.time_effective_delete !== '') {
            data.time_effective_delete = moment.tz(`${moment().format('YYYY-MM-DD')} ${data.time_effective_delete}`, 'YYYY-MM-DD HH:mm:ss', this.userTimeZone)
                .tz(this.targetTimeZone)
                .format('HH:mm:ss');
        }

        const request: Promise<any> = this.props.action === 'edit' ?
            symbolService.updateSymbol(data, this.symbol?.id || 0) : symbolService.createSymbol(data);

        await request
            .then(((res: any) => {
                this.props.onCallback(data.symbol, 'view');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    getSymbols = () => {
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

                this.companyProfile = symbol?.company_profile || null;
                this.setState({symbol: this.symbol})
                this.initForm(symbol)
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }
    handleBack = () => {
        const router = useRouter();
        router.push('/symbols');
    }


    openModal = (mode: string) => {
        if (mode === 'edit') {
            this.props.onCallback(this.props.symbol, mode)
        } else {
            this.setState({isOpenModal: true, formAction: mode, modalTitle: this.modalTitle(mode)})
            this.cancelCompanyForm();
        }


    }

    openCompanyModal = (mode: string, data?: ICompanyProfile | null) => {
        this.setState({
            isOpenCompanyModal: true,
            formCompanyData: data || null,
            formCompanyAction: mode,
            modalTitle: this.modalTitle(mode)
        })
        this.closeModal();
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }

    cancelCompanyForm(): void {
        this.setState({isOpenCompanyModal: false});
    }

    modalCompanyTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Asset Profile'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Asset Profile`;
        }
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to delete this symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Symbol`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.closeModal();
        this.cancelCompanyForm()

        if (values?.symbol && values.symbol !== this.props.symbol) {
            this.props.onCallback(values.symbol);
        } else {
            this.getSymbols();
        }

    };

    buttonText = () => {
        const symbolTitle = 'Symbol';
        const actionMapping: Record<string, string> = {
            'add': `Save ${symbolTitle}`,
            'edit': `Save ${symbolTitle}`,
            'view': `View ${symbolTitle}`,
            'delete': 'Confirm',
        };

        return actionMapping[this.props.action] || '';
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <div>
                        <Formik<ISymbol>
                            initialValues={this.state.formInitialValues as ISymbol}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                            innerRef={this.formRef}
                        >
                            {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                return (
                                    <Form id="bank-form">
                                        <div className="flex-panel-box">
                                            {this.symbol && (
                                                <div className={'panel'}>
                                                    <div
                                                        className={'content__bottom d-flex justify-content-between'}>
                                                        <h2 className={'view_block_main_title'}>
                                                            {this.symbol?.security_name} ({this.symbol?.symbol})
                                                        </h2>
                                                    </div>
                                                </div>
                                            )}
                                            <div className={'profile__right'}>
                                                <div className={'profile__right-wrap-full'}>
                                                    <div className={'profile__panel'}>
                                                        <div className={'profile__info__panel view__input__box'}>
                                                            {(values.is_delete) && (
                                                                <>
                                                                    <div className="input">
                                                                        <div className="input__group">
                                                                            <div className="input">
                                                                                <div
                                                                                    className="input__title">Date <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap no-bg`}>
                                                                                    <SingleDatePicker

                                                                                        numberOfMonths={1}
                                                                                        date={values.date_entered_change ? moment(values.date_entered_delete) : null}
                                                                                        onDateChange={date => setFieldValue('date_entered_delete', date?.format('YYYY-MM-DD').toString())}
                                                                                        focused={this.state.focusedInputDateEntered}
                                                                                        onFocusChange={({focused}) => this.setState({focusedInputDateEntered: focused})}
                                                                                        id="date_entered_delete"
                                                                                        displayFormat="YYYY-MM-DD"
                                                                                        isOutsideRange={() => false}
                                                                                        readOnly={true}
                                                                                        disabled={true}
                                                                                        placeholder={'Select Date'}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="date_entered_delete"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>


                                                                            <div className="input">
                                                                                <div
                                                                                    className="input__title">Time <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap`}>
                                                                                    <Field
                                                                                        name="time_entered_delete"
                                                                                        id="time_entered_delete"
                                                                                        type="time"
                                                                                        placeholder="Type Time"
                                                                                        className="input__text no-bg"
                                                                                        readOnly={true}
                                                                                        disabled={true}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="time_entered_delete"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input__group">
                                                                            <div className="input">
                                                                                <div
                                                                                    className="input__title">Effective
                                                                                    Date <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap`}>
                                                                                    <SingleDatePicker
                                                                                        numberOfMonths={1}
                                                                                        date={values.date_effective_delete ? moment(values.date_effective_delete) : null}
                                                                                        onDateChange={date => setFieldValue('date_effective_delete', date?.format('YYYY-MM-DD').toString())}
                                                                                        focused={this.state.focusedInputDateEffectiveDelete}
                                                                                        onFocusChange={({focused}) => this.setState({focusedInputDateEffectiveDelete: focused})}
                                                                                        id="date_effective_delete"
                                                                                        displayFormat="YYYY-MM-DD"
                                                                                        isOutsideRange={() => false}
                                                                                        readOnly={true}
                                                                                        placeholder={'Select Date'}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="date_effective_delete"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>


                                                                            <div className="input">
                                                                                <div
                                                                                    className="input__title">Effective
                                                                                    Time <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap`}>
                                                                                    <Field
                                                                                        name="time_effective_delete"
                                                                                        id="time_effective_delete"
                                                                                        type="time"
                                                                                        placeholder="Type Time"
                                                                                        className="input__text no-bg"
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="time_effective_delete"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input">
                                                                            <div className="input__title">Delete
                                                                                Reason
                                                                            </div>
                                                                            <div className="input__wrap">
                                                                                <Field
                                                                                    name="reason_delete"
                                                                                    id="reason_delete"
                                                                                    as="textarea"
                                                                                    rows="3"
                                                                                    className="input__text no-bgarea"
                                                                                    placeholder="Type delete reason"
                                                                                    disabled={isSubmitting}
                                                                                />
                                                                                <ErrorMessage name="reason_delete"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {this.props.action !== 'delete' && (
                                                                <>

                                                                    {(!values.is_change) && (
                                                                        <div className="input__box">
                                                                            <div className="input__title">Reason for
                                                                                Entry <i>*</i>
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="reason_for_entry"
                                                                                    id="reason_for_entry"
                                                                                    as="select"
                                                                                    className="b-select no-bg"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                >
                                                                                    <option value="">Select a
                                                                                        Reason
                                                                                    </option>
                                                                                    <option
                                                                                        value="New Ticker Symbol">New
                                                                                        Ticker
                                                                                        Symbol
                                                                                    </option>
                                                                                    <option disabled={true}
                                                                                            value="New Ticker Symbol">New
                                                                                        Security Name
                                                                                    </option>
                                                                                    <option disabled={true}
                                                                                            value="Symbol Deletion">Symbol
                                                                                        Deletion
                                                                                    </option>
                                                                                </Field>
                                                                                <ErrorMessage
                                                                                    name="reason_for_entry"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className={'input__box full'}>
                                                                        <h4 className={'input__group__title'}>Symbol
                                                                            Information:</h4>
                                                                    </div>

                                                                    {(!values.is_change) && (
                                                                        <>
                                                                            <div className="input__box">
                                                                                <div
                                                                                    className="input__title">Security
                                                                                    Name <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="security_name"
                                                                                        id="security_name"
                                                                                        type="text"
                                                                                        className="input__text no-bg"
                                                                                        placeholder="Type Security Name"
                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                        onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="security_name"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="input__box">
                                                                                <div
                                                                                    className="input__title">Symbol <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap ${getApprovedFormStatus().includes(this.symbol?.status.toLowerCase() as FormStatus) ? 'input__btns ' : ''}  ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="symbol"
                                                                                        id="symbol"
                                                                                        type="text"
                                                                                        className="input__text no-bg"
                                                                                        placeholder="Type Symbol"
                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                        onChange={(e: any) => this.handleSymbol(e.target.value, setFieldValue)}
                                                                                    />
                                                                                    {getApprovedFormStatus().includes(this.symbol?.status.toLowerCase() as FormStatus) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className='border-grey-btn ripple'
                                                                                            onClick={() => {
                                                                                                setFieldValue('is_change', true);
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon
                                                                                                className="nav-icon"
                                                                                                icon={faEdit}/>
                                                                                        </button>
                                                                                    )}

                                                                                    <ErrorMessage name="symbol"
                                                                                                  component="div"
                                                                                                  className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    {(values.is_change) && (
                                                                        <>
                                                                            <div className="input__box full">
                                                                                <div className="input__group">
                                                                                    <div className="input">
                                                                                        <div
                                                                                            className="input__title">Date <i>*</i>
                                                                                        </div>
                                                                                        <div
                                                                                            className={`input__wrap no-border`}>
                                                                                            <SingleDatePicker
                                                                                                numberOfMonths={1}
                                                                                                date={values.date_entered_change ? moment(values.date_entered_change) : null}
                                                                                                onDateChange={date => setFieldValue('date_entered_change', date?.format('YYYY-MM-DD').toString())}
                                                                                                focused={this.state.focusedInputDateEntered}
                                                                                                onFocusChange={({focused}) => this.setState({focusedInputDateEntered: focused})}
                                                                                                id="date_entered_change"
                                                                                                displayFormat="YYYY-MM-DD"
                                                                                                isOutsideRange={() => false}
                                                                                                readOnly={true}
                                                                                                disabled={true}
                                                                                                placeholder={'Select Date'}
                                                                                            />
                                                                                            <ErrorMessage
                                                                                                name="date_entered_change"
                                                                                                component="div"
                                                                                                className="error-message"/>
                                                                                        </div>
                                                                                    </div>


                                                                                    <div className="input">
                                                                                        <div
                                                                                            className="input__title">Time <i>*</i>
                                                                                        </div>
                                                                                        <div
                                                                                            className={`input__wrap no-border`}>
                                                                                            <Field
                                                                                                name="time_entered_change"
                                                                                                id="time_entered_change"
                                                                                                type="time"
                                                                                                placeholder="Type Time"
                                                                                                className="input__text no-bg"
                                                                                                readOnly={true}
                                                                                                disabled={true}
                                                                                            />
                                                                                            <ErrorMessage
                                                                                                name="time_entered_change"
                                                                                                component="div"
                                                                                                className="error-message"/>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input__group">
                                                                                    <div className="input">
                                                                                        <div
                                                                                            className="input__title">Effective
                                                                                            Date <i>*</i>
                                                                                        </div>
                                                                                        <div
                                                                                            className={`input__wrap no-border`}>
                                                                                            <SingleDatePicker
                                                                                                numberOfMonths={1}
                                                                                                date={values.date_effective_change ? moment(values.date_effective_change) : null}
                                                                                                onDateChange={date => setFieldValue('date_effective_change', date?.format('YYYY-MM-DD').toString())}
                                                                                                focused={this.state.focusedInputDateEffective}
                                                                                                onFocusChange={({focused}) => this.setState({focusedInputDateEffective: focused})}
                                                                                                id="date_effective_change"
                                                                                                displayFormat="YYYY-MM-DD"
                                                                                                isOutsideRange={() => false}
                                                                                                readOnly={true}
                                                                                                placeholder={'Select Date'}
                                                                                            />
                                                                                            <ErrorMessage
                                                                                                name="date_effective_change"
                                                                                                component="div"
                                                                                                className="error-message"/>
                                                                                        </div>
                                                                                    </div>


                                                                                    <div className="input">
                                                                                        <div
                                                                                            className="input__title">Effective
                                                                                            Time <i>*</i>
                                                                                        </div>
                                                                                        <div
                                                                                            className={`input__wrap no-border`}>
                                                                                            <Field
                                                                                                name="time_effective_change"
                                                                                                id="time_effective_change"
                                                                                                type="time"
                                                                                                placeholder="Type Time"
                                                                                                className="input__text no-bg"
                                                                                            />
                                                                                            <ErrorMessage
                                                                                                name="time_effective_change"
                                                                                                component="div"
                                                                                                className="error-message"/>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Security
                                                                                        Name <i>*</i>
                                                                                    </div>
                                                                                    <div
                                                                                        className={`input__wrap no-border`}>
                                                                                        <Field
                                                                                            name="new_security_name"
                                                                                            id="new_security_name"
                                                                                            type="text"
                                                                                            className="input__text no-bg"
                                                                                            placeholder="Type Security Name"
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="new_security_name"
                                                                                            component="div"
                                                                                            className="error-message"/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Symbol <i>*</i>
                                                                                    </div>
                                                                                    <div
                                                                                        className={`input__wrap no-border`}>
                                                                                        <Field
                                                                                            name="new_symbol"
                                                                                            id="new_symbol"
                                                                                            type="text"
                                                                                            className="input__text no-bg"
                                                                                            placeholder="Type Symbol"
                                                                                            onChange={(e: any) => this.handleNewSymbol(e.target.value, setFieldValue)}
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="new_symbol"
                                                                                            component="div"
                                                                                            className="error-message"/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Change
                                                                                        Reason
                                                                                    </div>
                                                                                    <div
                                                                                        className="input__wrap no-border">
                                                                                        <Field
                                                                                            name="reason_change"
                                                                                            id="reason_change"
                                                                                            as="textarea"
                                                                                            rows="3"
                                                                                            className="input__text no-bgarea"
                                                                                            placeholder="Type change reason"
                                                                                            disabled={isSubmitting}
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="reason_change"
                                                                                            component="div"
                                                                                            className="error-message"/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Digital
                                                                                        Security
                                                                                        Identifier
                                                                                        Number -
                                                                                        DSIN
                                                                                    </div>
                                                                                    <div
                                                                                        className="input__group mb-0">
                                                                                        <div className="input">
                                                                                            <div
                                                                                                className="input__title">Current
                                                                                            </div>
                                                                                            <div
                                                                                                className={`input__wrap no-border`}>
                                                                                                <Field
                                                                                                    name="dsin"
                                                                                                    id="dsin"
                                                                                                    type="text"
                                                                                                    className="input__text no-bg dsin no-bg dsin-view"
                                                                                                    disabled={true}
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="dsin"
                                                                                                    component="div"
                                                                                                    className="error-message"/>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="input">
                                                                                            <div
                                                                                                className="input__title">Destination
                                                                                            </div>
                                                                                            <div
                                                                                                className={`input__wrap no-border`}>
                                                                                                <Field
                                                                                                    name="new_dsin"
                                                                                                    id="new_dsin"
                                                                                                    type="text"
                                                                                                    className="input__text no-bg dsin blue input__text no-bg dsin no-bg dsin-view"
                                                                                                    disabled={true}
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="new_dsin"
                                                                                                    component="div"
                                                                                                    className="error-message"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        className={'input__title mt-2'}>
                                                                            <span
                                                                                className={'fw-bold '}>Notice: </span> if
                                                                                        you change the Symbol
                                                                                        the DSIN is
                                                                                        changed

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <hr className={'mb-24'}/>

                                                                            <div className="input__box">
                                                                                <div
                                                                                    className="input__title">Security
                                                                                    Name <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="security_name"
                                                                                        id="security_name"
                                                                                        type="text"
                                                                                        className="input__text no-bg"
                                                                                        placeholder="Type Security Name"
                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                        onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="security_name"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                            <div className="input__box">
                                                                                <div
                                                                                    className="input__title">Symbol <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`${getApprovedFormStatus().includes(this.symbol?.status.toLowerCase() as FormStatus) ? 'input__btns' : 'input__wrap'}  ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="symbol"
                                                                                        id="symbol"
                                                                                        type="text"
                                                                                        className="input__text no-bg"
                                                                                        placeholder="Type Symbol"
                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                        onChange={(e: any) => this.handleSymbol(e.target.value, setFieldValue)}
                                                                                    />
                                                                                    <ErrorMessage name="symbol"
                                                                                                  component="div"
                                                                                                  className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}

                                                                    <div className={'input__box'}>
                                                                        <div className="input">
                                                                            <div
                                                                                className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? ' disable' : ''}`}>
                                                                                <Field
                                                                                    type="checkbox"
                                                                                    name="is_cusip"
                                                                                    id="is_cusip"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                    onClick={(e: any) => this.handleCusipChange(e, setFieldValue)}
                                                                                />
                                                                                <label htmlFor="is_cusip">
                                                                                    <span></span><i> Does it
                                                                                    have cusip number?
                                                                                </i>
                                                                                </label>
                                                                                <ErrorMessage name="is_cusip"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input__box">
                                                                            {values.is_cusip && (

                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="cusip"
                                                                                        id="cusip"
                                                                                        type="text"
                                                                                        className="input__text no-bg"
                                                                                        placeholder="Type CUSIP"
                                                                                        disabled={isSubmitting || this.isShow()}
                                                                                    />
                                                                                    <ErrorMessage name="cusip"
                                                                                                  component="div"
                                                                                                  className="error-message"/>
                                                                                </div>

                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Digital
                                                                            Security
                                                                            Identifier
                                                                            Number -
                                                                            DSIN
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap no-border`}>
                                                                            <Field
                                                                                name="dsin"
                                                                                id="dsin"
                                                                                type="text"
                                                                                className="input__text no-bg dsin no-bg dsin-view"
                                                                                disabled={true}
                                                                            />
                                                                            <ErrorMessage name="dsin"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Fifth
                                                                            Character
                                                                            Identifiers
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="fifth_character_identifier"
                                                                                id="fifth_character_identifier"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Fifth
                                                                                    Character
                                                                                    Identifiers
                                                                                </option>
                                                                                {Object.values(FifthCharacterIdentifier).map((identifier) => (
                                                                                    <option key={identifier}
                                                                                            value={identifier}>
                                                                                        {identifier}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="fifth_character_identifier"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div
                                                                            className="input__title">Alternative
                                                                            Asset
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="alternative_asset_category"
                                                                                id="alternative_asset_category"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select
                                                                                    Alternative Asset
                                                                                </option>
                                                                                {Object.values(AlternativeAssetCategory).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="alternative_asset_category"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {values.alternative_asset_category !== '' && getAlternativeAssetSubCategory(values.alternative_asset_category) && (
                                                                        <div className="input__box">
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="alternative_asset_subcategory"
                                                                                    id="alternative_asset_subcategory"
                                                                                    as="select"
                                                                                    className="b-select no-bg"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                >
                                                                                    <option value="">Select
                                                                                        category
                                                                                    </option>
                                                                                    {Object.values(getAlternativeAssetSubCategory(values.alternative_asset_category)).map((type: any) => (
                                                                                        <option key={type}
                                                                                                value={type}>
                                                                                            {type}
                                                                                        </option>
                                                                                    ))}

                                                                                </Field>

                                                                                <ErrorMessage
                                                                                    name="alternative_asset_subcategory"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="input__box">
                                                                        <div className="input__title">Exempted
                                                                            Offerings
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="exempted_offerings"
                                                                                id="exempted_offerings"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Exempted
                                                                                    Offering
                                                                                </option>
                                                                                {Object.values(ExemptedOfferingType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="exempted_offerings"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Market
                                                                            Sector <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="market_sector"
                                                                                id="market_sector"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Market
                                                                                    Sector
                                                                                </option>
                                                                                {Object.values(MarketSector).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage name="market_sector"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Lot Size
                                                                            ({getLotSize().join(', ')}) <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="lot_size"
                                                                                id="lot_size"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Lot Size"
                                                                                component={NumericInputField}
                                                                                decimalScale={0}
                                                                                isThousandSeparator={false}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="lot_size"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Fractional
                                                                            Lot Size
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="fractional_lot_size"
                                                                                id="fractional_lot_size"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Fractional Lot Size"
                                                                                component={NumericInputField}
                                                                                decimalScale={6}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage
                                                                                name="fractional_lot_size"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Minimum
                                                                            Price Variation
                                                                            (MPV)
                                                                            (.01,
                                                                            .05, .10)
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="mvp"
                                                                                id="mvp"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type MPV"
                                                                                component={NumericInputField}
                                                                                decimalScale={4}
                                                                                isThousandSeparator={false}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="mvp"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className={'input__box full'}>
                                                                        <h4 className={'input__group__title'}>Symbol
                                                                            Trading
                                                                            Information:</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Primary
                                                                            ATS <i>*</i></div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="primary_ats"
                                                                                id="primary_ats"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Primary ATS"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="primary_ats"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
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
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Transfer Agent"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="transfer_agent"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div
                                                                            className="input__title">Custodian
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="custodian"
                                                                                id="custodian"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Custodian"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="custodian"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className={'input__box full'}>
                                                                        <h4 className={'input__group__title'}>Digital
                                                                            Asset:</h4>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Digital
                                                                            Asset Category
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="digital_asset_category"
                                                                                id="digital_asset_category"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Digital
                                                                                    Asset Category
                                                                                </option>
                                                                                {Object.values(DigitalAssetCategory).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="digital_asset_category"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {values.digital_asset_category !== '' && getDigitalAssetCategoryInstrument(values.digital_asset_category) && (
                                                                        <div className="input__box">
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="instrument_type"
                                                                                    id="instrument_type"
                                                                                    as="select"
                                                                                    className="b-select no-bg"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                >
                                                                                    <option value="">Select
                                                                                        Instrument Type
                                                                                    </option>
                                                                                    {Object.values(getDigitalAssetCategoryInstrument(values.digital_asset_category)).map((type: any) => (
                                                                                        <option key={type}
                                                                                                value={type}>
                                                                                            {type}
                                                                                        </option>
                                                                                    ))}

                                                                                </Field>

                                                                                <ErrorMessage
                                                                                    name="instrument_type"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    )}


                                                                    <div className="input__box">
                                                                        <div className="input__title">Issuer
                                                                            Name
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="issuer_name"
                                                                                id="issuer_name"
                                                                                type="text"
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Issuer Name"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="issuer_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div className="input__title">Issuer
                                                                            Type
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="issuer_type"
                                                                                id="issuer_type"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Issuer
                                                                                    Type
                                                                                </option>
                                                                                {Object.values(IssuerType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage name="issuer_type"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className={'input__box'}>
                                                                        <div
                                                                            className="input__title">Underpinning
                                                                            Asset Value
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="underpinning_asset_value"
                                                                                id="underpinning_asset_value"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handlePeggedChange(e, setFieldValue)}
                                                                            >
                                                                                <option value="">Select
                                                                                    Underpinning Asset Value
                                                                                </option>
                                                                                {Object.values(UnderpinningAssetValue).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="underpinning_asset_value"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {values.underpinning_asset_value === UnderpinningAssetValue.PEGGED && (

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">Reference
                                                                                Asset
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="reference_asset"
                                                                                    id="reference_asset"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Enter the asset Type"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="reference_asset"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    )}


                                                                    <div className="input__box">
                                                                        <div className="input__title">Rights
                                                                            Type
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="rights_type"
                                                                                id="rights_type"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Rights
                                                                                    Type
                                                                                </option>
                                                                                {Object.values(RightsType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage name="rights_type"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className="input__box">
                                                                        <div
                                                                            className="input__title">Enforceability
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="enforceability_type"
                                                                                id="enforceability_type"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select
                                                                                    Enforceability
                                                                                </option>
                                                                                {Object.values(EnforceabilityType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="enforceability_type"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>


                                                                    <div className="input__box">
                                                                        <div
                                                                            className="input__title">Fungibility
                                                                            Type
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="fungibility_type"
                                                                                id="fungibility_type"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select
                                                                                    Fungibility Type
                                                                                </option>
                                                                                {Object.values(FungibilityType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="fungibility_type"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    <div className={'input__box'}>
                                                                        <div
                                                                            className="input__title">Redeemability
                                                                            Type
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="redeemability_type"
                                                                                id="redeemability_type"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleRedeemabilityChange(e, setFieldValue)}
                                                                            >
                                                                                <option value="">Select
                                                                                    Redeemability Type
                                                                                </option>
                                                                                {Object.values(RedeemabilityType).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="redeemability_type"
                                                                                component="div"
                                                                                className="error-message"/>
                                                                        </div>
                                                                    </div>

                                                                    {values.redeemability_type === RedeemabilityType.REDEEMABLE && (

                                                                        <div className="input__box">
                                                                            <div
                                                                                className="input__title">Redemption
                                                                                Asset Type
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="redemption_asset_type"
                                                                                    id="redemption_asset_type"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Enter the Redemption asset Type"
                                                                                    disabled={isSubmitting || this.isShow()}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="redemption_asset_type"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="input__box">
                                                                        <div className="input__title">Nature of
                                                                            record
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : 'no-border'}`}>
                                                                            <Field
                                                                                name="nature_of_record"
                                                                                id="nature_of_record"
                                                                                as="select"
                                                                                className="b-select no-bg"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            >
                                                                                <option value="">Select Nature
                                                                                    of record
                                                                                </option>
                                                                                {Object.values(NatureOfRecord).map((type) => (
                                                                                    <option key={type}
                                                                                            value={type}>
                                                                                        {type}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage
                                                                                name="nature_of_record"
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
                                                                                className="input__text no-bg"
                                                                                placeholder="Type Edgar CIK"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="edgar_cik"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {this.props.action !== 'view' && (
                                                                <div className="input__box full">
                                                                    <div className="input__box">
                                                                        <button id="add-bank-acc"
                                                                                className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : 'no-border'}`}
                                                                                type="submit"
                                                                                disabled={isSubmitting || !isValid || !dirty}>
                                                                            {this.buttonText()}
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

                    </div>
                )}
            </>
        );
    }

}

export default portalAccessWrapper(SymbolPageForm, 'SymbolBlock');
