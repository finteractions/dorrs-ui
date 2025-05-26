import React, {RefObject} from 'react';
import {Formik, Form, Field, ErrorMessage, FieldProps} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {
    FormStatus,
    getApprovedFormStatus
} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {ISymbol} from "@/interfaces/i-symbol";
import symbolService from "@/services/symbol/symbol-service";
import dsinService from "@/services/dsin/dsin-service";
import {getMarketSectorCategory, MarketSector} from "@/enums/market-sector";
import {FifthCharacterIdentifier} from "@/enums/fifth-character-identifier";
import moment from 'moment-timezone';
import 'moment-timezone/builds/moment-timezone-with-data';
import 'react-dates/initialize';
import {SingleDatePicker} from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import {createColumnHelper} from "@tanstack/react-table";
import {IActivityStorage} from "@/interfaces/i-activity-storage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faCheck,
    faClose,
    faEdit,
    faMagicWandSparkles,
    faMinus,
    faPlus
} from "@fortawesome/free-solid-svg-icons";
import NumericInputField from "@/components/numeric-input-field";
import {
    DigitalAssetCategory,
    getDigitalAssetCategoryInstrument
} from "@/enums/digital-asset-category";
import {IssuerType} from "@/enums/issuer-type";
import {RightsType} from "@/enums/rights-type";
import {EnforceabilityType} from "@/enums/enforceability-type";
import {UnderpinningAssetValue} from "@/enums/underpinning-asset-value";
import {FungibilityType} from "@/enums/fungibility-type";
import {RedeemabilityType} from "@/enums/redeemability-type";
import {NatureOfRecord} from "@/enums/nature-of-record";
import {getLotSize} from "@/enums/lot-size";
import {AlternativeAssetCategory, getAlternativeAssetSubCategory} from "@/enums/alternative-asset-category";
import {ExemptedOfferingType} from "@/enums/exempted-offering-type";
import Link from "next/link";
import Select from "react-select";
import InputMask from "react-input-mask";
import AssetImage from "@/components/asset-image";
import formValidator from "@/services/form-validator/form-validator";
import SubSymbolBlock from "@/components/backend/sub-symbol-block";
import formService from "@/services/form/form-service";
import {PrimaryATS} from "@/constants/primary-ats";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {AssetStatus} from "@/enums/asset-status";
import {DebtInstrument} from "@/enums/debt-instrument";
import {PaymentFrequency} from "@/enums/payment-frequency";
import {BackingCollateralDetails} from "@/enums/backing-collateral-details";
import {SettlementMethod} from "@/enums/settlement-method";
import {CustodyArrangement} from "@/enums/custody-arrangement";
import {AssociatedNetwork} from "@/enums/associated-network";
import aiToolService from "@/services/ai-tool/ai-tool-service";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {Button} from "react-bootstrap";
import {boolean, ValidationError} from "yup";
import {countries} from "countries-list";
import {SicIndustryClassification} from "@/enums/sic-industry-classification";
import forgeGlobalService from "@/services/forge-global/forge-global-service";
import {ForgeGlobalCompany, ForgeGlobalCompanyDetail} from "@/interfaces/i-forge-global-company";


const allowedImageFileSizeMB = 1
const allowedImageFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedImageExt = ['png', 'jpg', 'jpeg']
const allowedFileSizeMB = 5
const allowedFileSize = allowedImageFileSizeMB * 1024 * 1024;
const allowedFileExt = ['pdf']

const formSchema = Yup.object().shape({
    reason_for_entry: Yup.string().required('Required').label('Reason for Entry'),
    symbol: Yup.string().min(2).max(12).required('Required').label('Symbol'),
    asset_status: Yup.string().required('Required').label('Asset Status'),
    edgar_cik: Yup.string().label('Edgar CIK'),
    debt_instrument: Yup.string().label('Debt Instrument'),
    face_value_par_value: Yup.number()
        .when('debt_instrument', {
            is: (v: string | null | undefined) => !!v && v.trim() !== '',
            then: (schema) =>
                schema
                    .transform((value, originalValue) => {
                        return Number(originalValue.toString().replace(/,/g, ''));
                    })
                    .required('Required')
                    .moreThan(0, 'Must be greater than 0')
                    .label('Face Value/Par Value'),
        }),
    coupon_interest_rate: Yup.number()
        .when('debt_instrument', {
            is: (v: string | null | undefined) => !!v && v.trim() !== '',
            then: (schema) =>
                schema
                    .transform((value, originalValue) => {
                        return Number(originalValue.toString().replace(/,/g, ''));
                    })
                    .required('Required')
                    .moreThan(0, 'Must be greater than 0')
                    .label('Coupon/Interest Rate'),
        }),
    maturity_date: Yup.string()
        .when('debt_instrument', {
            is: (v: string | null | undefined) => !!v && v.trim() !== '',
            then: (schema) =>
                schema
                    .required('Required')
                    .label('Maturity Date'),
        }),
    payment_frequency: Yup.string()
        .when('debt_instrument', {
            is: (v: string | null | undefined) => !!v && v.trim() !== '',
            then: (schema) =>
                schema
                    .required('Required')
                    .label('Payment Frequency'),
        }),
    issue_date: Yup.string().label('Date of Issue / Creation'),
    governance_notes: Yup.string().label('Issuance / Governance Notes'),
    backing_collateral_details: Yup.string().label('Backing / Collateral Details'),
    backing_collateral_details_text: Yup.string().label('Backing / Collateral Details Text'),
    settlement_method: Yup.string().label('Settlement Method'),
    custody_arrangement: Yup.string().label('Custody Arrangements'),
    associated_network: Yup.string().label('Associated Network / Ledger'),
    notes: Yup.string().label('Free-Form Notes'),

    symbol_id: Yup.string().nullable(),
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
    is_cusip: Yup.boolean().label('CUSIP'),
    cusip: Yup.string().min(3).max(9).label('CUSIP')
        .when('is_cusip', {
            is: (v: boolean) => v,
            then: (schema) => schema.required('Required')
        }),
    dsin: Yup.string().label('DSIN'),
    primary_ats: Yup.string().min(3).max(50).required('Required').label('Primary ATS'),
    new_primary_ats: Yup.string().min(3).max(50)
        .when('primary_ats', {
            is: (v: string) => v === PrimaryATS.ADD_NEW.value,
            then: (schema) => schema.required('Required').label('Primary ATS')
        }),
    transfer_agent: Yup.string().min(3).max(50).label('Transfer Agent'),
    custodian: Yup.string().min(3).max(50).label('Custodian'),
    market_sector: Yup.string().min(3).max(50).required('Required').label('Market Sector'),
    market_sector_category: Yup.string().label('Market Sector Category'),
    lot_size: Yup.number().required('Required')
        .required('Required')
        .test('is-valid-lot-size', `Invalid Lot Size. Example ${getLotSize().join(', ')}`, (value) => {
            return getLotSize().includes(value);
        })
        .label('Lot Size'),
    fractional_lot_size: Yup.number()
        .transform((value, originalValue) => {
            return Number(originalValue.toString().replace(/,/g, ''));
        })
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
        .transform((value, originalValue) => {
            return Number(originalValue.toString().replace(/,/g, ''));
        })
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
        then: (schema) => schema.min(3).max(50).required('Required').label('Security Name')
    }),
    reason_change: Yup.string().label('Change Reason'),
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
    reason_delete: Yup.string().label('Delete Reason'),
    status: Yup.string().label('Status')

});

const AIInitialValues = {
    aiAgreement: false,
};

interface PendingSymbolFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
    focusedInputDateEntered: any;
    focusedInputDateEffective: any;
    focusedInputDateEnteredDelete: any;
    focusedInputDateEffectiveDelete: any;
    history: Array<IActivityStorage>;
    selectedSecImages: File[] | null;
    selectedSecFiles: File[] | null;
    getSymbolProcessing: boolean;
    isSymbolCodeChange: boolean;
    symbolCode: string;
    symbol?: ISymbol | null;
    focusedMaturityDate: any;
    focusedIssueDate: any;
    isShow: boolean;
    isAILoader: boolean;
    isGlobalForgeLoader: boolean;
    aiGeneratedFields: string[];
    aiErrorMessages: Array<string> | null;
    formAIInitialValues: any,
    formForgeGlobalInitialValues: any,
    aiAgreement: Record<string, boolean>;
    forgeGlobalAgreement: Record<string, boolean>;
}

interface SymbolFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISymbol | null;
    onCancel?: () => void;
    onLoading?: () => void;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

const columnDeleteHelper = createColumnHelper<any>();
let deleteColumns: any[] = [];

const dateFormat = process.env.FORMAT_DATE || 'YYYY-MM-DD';


class PendingSymbolForm extends React.Component<SymbolFormProps, PendingSymbolFormState> {

    state: PendingSymbolFormState;
    masterSymbols: Array<ISymbol> = new Array<ISymbol>();
    primaryATS: Array<{ value: string, label: string }> = new Array<{ value: string, label: string }>();
    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    targetTimeZone = 'UTC';

    formRef: RefObject<any>;
    host: string = ''
    typingTimeout: NodeJS.Timeout | null = null;

    constructor(props: SymbolFormProps) {
        super(props);

        const initialData = {} as ISymbol;
        this.initForm(initialData);
        this.state = {
            success: false,
            formInitialValues: {},
            loading: true,
            isApproving: null,
            isConfirmedApproving: false,
            isDeleting: false,
            focusedInputDateEntered: null,
            focusedInputDateEffective: null,
            focusedInputDateEnteredDelete: null,
            focusedInputDateEffectiveDelete: null,
            history: [],
            selectedSecFiles: [],
            selectedSecImages: [],
            getSymbolProcessing: false,
            isSymbolCodeChange: false,
            symbolCode: this.props.data?.symbol || '',
            symbol: null,
            focusedMaturityDate: null,
            focusedIssueDate: null,
            isShow: this.props.action === 'view',
            isAILoader: false,
            isGlobalForgeLoader: false,
            aiGeneratedFields: [],
            aiErrorMessages: null,
            formAIInitialValues: {},
            formForgeGlobalInitialValues: {},
            aiAgreement: {},
            forgeGlobalAgreement: {},
        };

        columns = [
            columnHelper.accessor((row) => ({
                details: row.log?.details,
                before: row.record_before,
                after: row.record_after,
            }), {
                id: "details",
                cell: (item) => {
                    const changes = this.getChanges(item.getValue().before, item.getValue().after) ?? []
                    return (
                        <>
                            <div className={changes.length > 0 ? 'mb-2' : ''}>{item.getValue().details}</div>
                            {changes.length > 0 && (
                                <div className={'mb-3'}>
                                    {changes.map((s: { key: string, value: string }, index: number) => (
                                        <div key={index}>
                                            <span className={'bold'}>{s.key}: </span>
                                            <span>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )
                },
                header: () => <span>Details</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ]

        deleteColumns = [
            columnDeleteHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Source</span>,
            }),
            columnDeleteHelper.accessor((row) => row.count, {
                id: "count",
                cell: (item) => item.getValue(),
                header: () => <span>Count</span>,
            }),
        ]

        this.formRef = React.createRef();

    }

    initForm(initialData: ISymbol, validate = false) {
        return new Promise(resolve => {
            const currentDateTime = new Date();
            const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
            const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
            const initialTime = `${currentHour}:${currentMinute}`;
            const initialDate = moment().format('YYYY-MM-DD').toString();

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
                reason_for_entry: string;
                symbol: string;
                asset_status: string;
                debt_instrument: string;
                face_value_par_value: string;
                coupon_interest_rate: string;
                maturity_date: string;
                payment_frequency: string;
                issue_date: string;
                governance_notes: string;
                backing_collateral_details: string;
                backing_collateral_details_text: string;
                settlement_method: string;
                custody_arrangement: string;
                associated_network: string;
                notes: string;
                symbol_id: number | null;
                company_profile_id: number | null;
                spv_name: string;
                fund_manager: string;
                investment_objective: string;
                sec_filing: string;
                sec_description: string[];
                sec_images: string[];
                sec_files: string[];
                is_cusip: boolean;
                cusip: string;
                dsin: string;
                primary_ats: string;
                transfer_agent: string;
                custodian: string;
                market_sector: string;
                market_sector_category: string;
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
                version: string;
            } = {
                reason_for_entry: initialData?.reason_for_entry || 'New Ticker Symbol',
                symbol: initialData?.symbol || '',
                asset_status: initialData?.asset_status || '',
                debt_instrument: initialData?.debt_instrument || '',
                face_value_par_value: formatterService.toPlainString(initialData?.face_value_par_value?.toString()),
                coupon_interest_rate: formatterService.toPlainString(initialData?.coupon_interest_rate?.toString()),
                maturity_date: initialData?.maturity_date || '',
                payment_frequency: initialData?.payment_frequency || '',
                issue_date: initialData?.issue_date || '',
                governance_notes: initialData?.governance_notes || '',
                backing_collateral_details: initialData?.backing_collateral_details || '',
                backing_collateral_details_text: initialData?.backing_collateral_details_text || '',
                settlement_method: initialData?.settlement_method || '',
                custody_arrangement: initialData?.custody_arrangement || '',
                associated_network: initialData?.associated_network || '',
                notes: initialData?.notes || '',
                symbol_id: initialData?.symbol_id || null,
                company_profile_id: initialData?.company_profile_id || null,
                spv_name: initialData?.spv_name || '',
                fund_manager: initialData?.fund_manager || '',
                investment_objective: initialData?.investment_objective || '',
                sec_filing: initialData?.sec_filing || '',
                sec_description: initialData?.sec_description || [""],
                sec_images: initialData?.sec_images || [],
                sec_files: initialData?.sec_files || [],
                cusip: initialData?.cusip || '',
                is_cusip: initialData?.is_cusip || false,
                dsin: initialData?.dsin || '',
                primary_ats: initialData?.primary_ats || '',
                transfer_agent: initialData?.transfer_agent || '',
                custodian: initialData?.custodian || '',
                market_sector: initialData?.market_sector || '',
                market_sector_category: initialData?.market_sector_category || '',
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
                date_effective_change: initialData?.date_effective_change || initialDate,
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
                version: initialData?.version || '',
            };

            this.setState({formInitialValues: initialValues}, () => {
                setTimeout(() => {
                    this.formRef?.current?.validateForm?.()
                }, 350)
            });

            resolve(true);
        })

    }


    initAIForm(data?: ISymbol | null) {
        return new Promise(resolve => {

            const initialData = {...data || {}} as ISymbol;

            const currentDateTime = new Date();
            const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
            const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
            const initialTime = `${currentHour}:${currentMinute}`;
            const initialDate = moment().format('YYYY-MM-DD').toString();

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
                reason_for_entry: string;
                symbol: string;
                asset_status: string;
                debt_instrument: string;
                face_value_par_value: string;
                coupon_interest_rate: string;
                maturity_date: string;
                payment_frequency: string;
                issue_date: string;
                governance_notes: string;
                backing_collateral_details: string;
                backing_collateral_details_text: string;
                settlement_method: string;
                custody_arrangement: string;
                associated_network: string;
                notes: string;
                symbol_id: number | null;
                company_profile_id: number | null;
                spv_name: string;
                fund_manager: string;
                investment_objective: string;
                sec_filing: string;
                sec_description: string[];
                sec_images: string[];
                sec_files: string[];
                is_cusip: boolean;
                cusip: string;
                dsin: string;
                primary_ats: string;
                transfer_agent: string;
                custodian: string;
                market_sector: string;
                market_sector_category: string;
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
                version: string;
            } = {
                reason_for_entry: initialData?.reason_for_entry || 'New Ticker Symbol',
                symbol: initialData?.symbol || '',
                asset_status: initialData?.asset_status || '',
                debt_instrument: initialData?.debt_instrument || '',
                face_value_par_value: formatterService.toPlainString(initialData?.face_value_par_value?.toString()),
                coupon_interest_rate: formatterService.toPlainString(initialData?.coupon_interest_rate?.toString()),
                maturity_date: initialData?.maturity_date || '',
                payment_frequency: initialData?.payment_frequency || '',
                issue_date: initialData?.issue_date || '',
                governance_notes: initialData?.governance_notes || '',
                backing_collateral_details: initialData?.backing_collateral_details || '',
                backing_collateral_details_text: initialData?.backing_collateral_details_text || '',
                settlement_method: initialData?.settlement_method || '',
                custody_arrangement: initialData?.custody_arrangement || '',
                associated_network: initialData?.associated_network || '',
                notes: initialData?.notes || '',
                symbol_id: initialData?.symbol_id || null,
                company_profile_id: initialData?.company_profile_id || null,
                spv_name: initialData?.spv_name || '',
                fund_manager: initialData?.fund_manager || '',
                investment_objective: initialData?.investment_objective || '',
                sec_filing: initialData?.sec_filing || '',
                sec_description: initialData?.sec_description || [""],
                sec_images: initialData?.sec_images || [],
                sec_files: initialData?.sec_files || [],
                cusip: initialData?.cusip || '',
                is_cusip: initialData?.is_cusip || false,
                dsin: initialData?.dsin || '',
                primary_ats: initialData?.primary_ats || '',
                transfer_agent: initialData?.transfer_agent || '',
                custodian: initialData?.custodian || '',
                market_sector: initialData?.market_sector || '',
                market_sector_category: initialData?.market_sector_category || '',
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
                date_effective_change: initialData?.date_effective_change || initialDate,
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
                version: initialData?.version || '',
            };

            const keys = Object.keys(initialValues);

            const aiAgreement: Record<string, boolean> = keys.reduce((acc: Record<string, boolean>, key) => {
                acc[key] = false;
                return acc;
            }, {} as Record<string, boolean>);

            this.setState({
                formAIInitialValues: initialValues,
                aiAgreement: aiAgreement
            }, () => {
                resolve(true);
            })
        })
    }

    initForgeGlobalForm(data?: ForgeGlobalCompany | null) {
        return new Promise(resolve => {
            if (data) {
                const companyDetail: ForgeGlobalCompanyDetail | null = data?.forge_global_company_detail?.[0] || null;

                const initialData = {} as ISymbol;

                const currentDateTime = new Date();
                const currentHour = currentDateTime.getHours().toString().padStart(2, '0');
                const currentMinute = currentDateTime.getMinutes().toString().padStart(2, '0');
                const initialTime = `${currentHour}:${currentMinute}`;
                const initialDate = moment().format('YYYY-MM-DD').toString();

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

                const issue_date: string =
                    /^\d{4}$/.test(companyDetail?.founded ?? '') ? `${companyDetail!.founded}-01-01` : '';

                const marketSector = Object.values(MarketSector);
                const normalizeSector = (input: string): string | '' => {
                    const manualMap: Record<string, string> = {
                        "Industrial": "Industrials",
                        "Financial": "Financials",
                        "Consumer Discretionary": "Consumer Discretionary", // можно убрать, если 1:1
                        "Consumer": "Consumer",
                        "Energy and Materials": "Energy & Materials"
                    };

                    if (manualMap[input]) {
                        return manualMap[input];
                    }

                    const match = marketSector.find(
                        sector => sector.toLowerCase() === input.toLowerCase()
                    );
                    return match || '';
                };

                const rawSector = data?.sector ?? '';
                const normalizedSector = normalizeSector(rawSector);

                const rawFifthCharacterIndetifier = data?.share_class ?? '';
                const shareClass = Object.values(FifthCharacterIdentifier);
                const extractSeriesLetter = (raw: string): string | null => {
                    const match = raw.match(/series\s+([a-z])/i) || raw.match(/series[-\s]*([a-z])/i);
                    return match ? match[1].toUpperCase() : '';
                };

                const normalizeFifthCharacterIdentifier = (rawShareClass: string): string => {
                    const letter = extractSeriesLetter(rawShareClass);
                    if (!letter) return '';

                    const match = shareClass.find(opt => opt.startsWith(`${letter} Class ${letter}`));
                    return match || '';
                };

                const normalizedFifthCharacterIdentifier = normalizeFifthCharacterIdentifier(rawFifthCharacterIndetifier)

                const initialValues: {
                    reason_for_entry: string;
                    symbol: string;
                    asset_status: string;
                    debt_instrument: string;
                    face_value_par_value: string;
                    coupon_interest_rate: string;
                    maturity_date: string;
                    payment_frequency: string;
                    issue_date: string;
                    governance_notes: string;
                    backing_collateral_details: string;
                    backing_collateral_details_text: string;
                    settlement_method: string;
                    custody_arrangement: string;
                    associated_network: string;
                    notes: string;
                    symbol_id: number | null;
                    company_profile_id: number | null;
                    spv_name: string;
                    fund_manager: string;
                    investment_objective: string;
                    sec_filing: string;
                    sec_description: string[];
                    sec_images: string[];
                    sec_files: string[];
                    is_cusip: boolean;
                    cusip: string;
                    dsin: string;
                    primary_ats: string;
                    transfer_agent: string;
                    custodian: string;
                    market_sector: string;
                    market_sector_category: string;
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
                    version: string;
                } = {
                    reason_for_entry: initialData?.reason_for_entry || 'New Ticker Symbol',
                    symbol: initialData?.symbol || '',
                    asset_status: initialData?.asset_status || 'Active',
                    debt_instrument: initialData?.debt_instrument || '',
                    face_value_par_value: formatterService.toPlainString(initialData?.face_value_par_value?.toString()),
                    coupon_interest_rate: formatterService.toPlainString(initialData?.coupon_interest_rate?.toString()),
                    maturity_date: initialData?.maturity_date || '',
                    payment_frequency: initialData?.payment_frequency || '',
                    issue_date: issue_date,
                    governance_notes: companyDetail?.description || '',
                    backing_collateral_details: initialData?.backing_collateral_details || '',
                    backing_collateral_details_text: initialData?.backing_collateral_details_text || '',
                    settlement_method: initialData?.settlement_method || '',
                    custody_arrangement: initialData?.custody_arrangement || '',
                    associated_network: initialData?.associated_network || '',
                    notes: initialData?.notes || '',
                    symbol_id: initialData?.symbol_id || null,
                    company_profile_id: initialData?.company_profile_id || null,
                    spv_name: initialData?.spv_name || '',
                    fund_manager: initialData?.fund_manager || '',
                    investment_objective: initialData?.investment_objective || '',
                    sec_filing: initialData?.sec_filing || '',
                    sec_description: initialData?.sec_description || [""],
                    sec_images: initialData?.sec_images || [],
                    sec_files: initialData?.sec_files || [],
                    cusip: initialData?.cusip || '',
                    is_cusip: initialData?.is_cusip || false,
                    dsin: initialData?.dsin || '',
                    primary_ats: initialData?.primary_ats || '',
                    transfer_agent: initialData?.transfer_agent || '',
                    custodian: initialData?.custodian || '',
                    market_sector: normalizedSector,
                    market_sector_category: initialData?.market_sector_category || '',
                    lot_size: (initialData?.lot_size || getLotSize()[0]).toString(),
                    fractional_lot_size: formatterService.toPlainString(initialData?.fractional_lot_size?.toString()),
                    mvp: formatterService.toPlainString(initialData?.mvp?.toString()),
                    security_name: data?.company_name || '',
                    fifth_character_identifier: normalizedFifthCharacterIdentifier,
                    digital_asset_category: initialData?.digital_asset_category || '',
                    instrument_type: initialData?.instrument_type || '',
                    alternative_asset_category: AlternativeAssetCategory.PRIVATE_FUNDS,
                    alternative_asset_subcategory: initialData?.alternative_asset_subcategory || '',
                    exempted_offerings: initialData?.exempted_offerings || '',
                    issuer_name: data?.company_name || '',
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
                    date_effective_change: initialData?.date_effective_change || initialDate,
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
                    version: initialData?.version || '',
                };

                const keys = Object.keys(initialValues);

                const aiAgreement: Record<string, boolean> = keys.reduce((acc: Record<string, boolean>, key) => {
                    acc[key] = false;
                    return acc;
                }, {} as Record<string, boolean>);

                this.setState({
                    formForgeGlobalInitialValues: initialValues,
                    aiAgreement: aiAgreement
                }, () => {
                    resolve(true);
                })
            } else {
                resolve(true);
            }
        })
    }

    getChanges(before: any, after: any) {
        const changes = [];

        for (const key in before) {
            if (before.hasOwnProperty(key) && after.hasOwnProperty(key)) {
                const beforeValue = before[key];
                const afterValue = after[key];

                if ((beforeValue === null && afterValue === '') || (beforeValue === '' && afterValue === null)) {
                    continue;
                }

                if (beforeValue !== afterValue) {
                    const label = this.getLabelFromSchema(key);
                    if (label === '') continue;
                    changes.push({key: label, value: `${beforeValue} -> ${afterValue}`});
                }
            }
        }

        return changes;
    }

    getLabelFromSchema(key: string): string {
        const fieldSchema = (formSchema as any).fields[key];
        if (fieldSchema && fieldSchema.describe) {
            const description = fieldSchema.describe();
            return description.label || key;
        }
        return '';
    }

    handleSubmit = async (values: ISymbol, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null, successMessage: null, aiErrorMessages: []});

        const data = {...values};

        if (data.face_value_par_value.toString() !== '') {
            data.face_value_par_value = Number(data.face_value_par_value.toString().replace(/,/g, ''));
        }

        if (data.coupon_interest_rate.toString() !== '') {
            data.coupon_interest_rate = Number(data.coupon_interest_rate.toString().replace(/,/g, ''));
        }

        if (data.primary_ats === PrimaryATS.ADD_NEW.value) {
            data.primary_ats = data.new_primary_ats.trim();
        }

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

        const formData = new FormData();

        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value as any);
        }

        formData.delete('sec_description');
        const sec_description = data.sec_description;
        formData.append('sec_description', JSON.stringify(sec_description));


        formData.delete('sec_images');
        formData.delete('sec_image_tmp');
        formData.delete('sec_files');
        formData.delete('sec_file_tmp');

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

        const request: Promise<any> = adminService.updatePendingAsset(formData, this.props.data?.id || 0)


        await request
            .then(((res: any) => {
                this.props.onCallback(false);
                let action;
                const status = this.props.data?.status;
                if (status?.toLowerCase() === 'pending') {
                    action = 'created'
                } else {
                    action = 'updated'
                }
                this.setState({successMessage: [`Symbol was successfully ${action}`]});
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                setTimeout(() => {
                    this.setState({successMessage: null});
                }, 3000);
            });
    };

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;

        if (this.props.isAdmin) {
            this.setState({loading: true}, async () => {
                await this.getAssets();
            });

        }
    }

    getPrimaryMarkets() {
        return new Promise(async resolve => {
            await adminService.getAssets()
                .then((res: ISymbol[]) => {
                    const data = res || [];

                    const primaryATS: Array<{
                        value: string,
                        label: string
                    }> = [...new Set(data.map(s => s.primary_ats).filter(s => s.length > 0).filter(s => s !== PrimaryATS.NONE.value))].sort().map((i) => {
                        return {
                            value: i,
                            label: i
                        }
                    });
                    primaryATS.unshift({value: PrimaryATS.ADD_NEW.value, label: PrimaryATS.ADD_NEW.label});
                    primaryATS.unshift({value: PrimaryATS.NONE.value, label: PrimaryATS.NONE.label});
                    this.primaryATS = primaryATS;
                    resolve(true);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {

                });
        })
    }

    getAssets = async () => {
        const symbolData = this.props.data!;

        if (this.props.action !== 'delete') {
            this.getPrimaryMarkets()
                .then(() => {
                    if (symbolData.status !== 'Pending') {
                        this.initForm(symbolData)
                            .then(() => {
                                this.setState({loading: false});
                                this.props.onLoading?.();
                            });
                    } else {
                        this.getAiGenerateSymbol()
                            .then(() => {
                                this.getForgeGlobalSymbol()
                            })
                    }
                })
        } else {
            this.setState({loading: false});
            await this.initForm(symbolData)
            this.props.onLoading?.();
        }
    }

    getAiGenerateSymbol() {
        return new Promise(resolve => {
            const symbolId = this.props.data?.id;
            this.setState({isShow: true, isAILoader: true, aiGeneratedFields: [], aiErrorMessages: null,});

            this.setState((prevState: any) => ({
                isShow: true, isAILoader: true, aiGeneratedFields: [], aiErrorMessages: null,
                formInitialValues: {
                    ...prevState.formInitialValues
                },
            }), async () => {
                await this.initAIForm();
                this.formRef?.current?.setSubmitting(true);
            });


            aiToolService.aiGenerateSymbol(Number(symbolId) ?? 0)
                .then(async (res: Array<ISymbol>) => {
                    const symbol = res?.[0] || null;
                    await this.initAIForm(symbol);
                })
                .catch(async (errors: IError) => {
                    await this.initForm(this.props.data!);
                    this.setState({aiErrorMessages: errors.messages, isAILoader: false});
                })
                .finally(() => {
                    this.setState({loading: false, isShow: false, isAILoader: false});
                    this.props.onLoading?.();
                    resolve(true);
                });

        })
    }

    getForgeGlobalSymbol() {
        return new Promise(resolve => {
            const symbolId = this.props.data?.id;
            this.setState({isGlobalForgeLoader: true});

            forgeGlobalService.getSymbol(Number(symbolId) ?? 0)
                .then(async (res: Array<ForgeGlobalCompany>) => {
                    const symbol = res?.[0] || null;
                    await this.initForgeGlobalForm(symbol);
                })
                .catch(async (errors: IError) => {
                    await this.initForm(this.props.data!);
                })
                .finally(() => {
                    this.setState({isGlobalForgeLoader: false});
                    this.props.onLoading?.();
                    resolve(true);
                });

        })
    }

    getAIValue = (field: string): string => {
        const excludedNumericFields = ['zip_code', 'phone', 'sic_industry_classification'];
        const aiCompanyProfile = {...this.state.formAIInitialValues} as any;
        let value = '';
        const aiValue = aiCompanyProfile[field];

        if (aiValue) {
            if (Array.isArray(aiValue)) {
                if (aiValue.length > 0) {
                    value = aiValue.join(', ');
                }
            } else {
                const numberValue = Number(aiValue);
                if (!isNaN(numberValue) && !excludedNumericFields.includes(field)) {
                    const decimals = (numberValue.toString().split('.')[1] || '').length;
                    value = formatterService.numberFormat(numberValue, decimals);
                } else {
                    value = aiValue;
                }
            }
        }

        return value;
    };

    getForgeGlobalValue = (field: string): string => {
        const excludedNumericFields = ['zip_code', 'phone', 'sic_industry_classification'];
        const forgeGlobalCompanyProfile = {...this.state.formForgeGlobalInitialValues} as any;
        let value = '';
        const aiValue = forgeGlobalCompanyProfile[field];

        if (aiValue) {
            if (Array.isArray(aiValue)) {
                if (aiValue.length > 0) {
                    value = aiValue.join(', ');
                }
            } else {
                const numberValue = Number(aiValue);
                if (!isNaN(numberValue) && !excludedNumericFields.includes(field)) {
                    const decimals = (numberValue.toString().split('.')[1] || '').length;
                    value = formatterService.numberFormat(numberValue, decimals);
                } else {
                    value = aiValue;
                }
            }
        }

        return value;
    };


    getRenderedForgeGlobalField = (field: string) => {
        const value = this.getForgeGlobalValue(field);
        const checked = this.state.forgeGlobalAgreement[field] ?? false;
        const self = this;

        const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const {checked} = event.target;
            this.setState((prevState: any) => ({
                forgeGlobalAgreement: {
                    ...prevState.forgeGlobalAgreement,
                    [field]: checked
                }
            }));
        };

        const applyChanges = () => {
            this.setState((prevState: any) => ({
                formInitialValues: {
                    ...prevState.formInitialValues,
                    [field]: (this.state.formForgeGlobalInitialValues as any)[field]
                },
                formForgeGlobalInitialValues: field === "logo"
                    ? prevState.formForgeGlobalInitialValues
                    : {
                        ...prevState.formForgeGlobalInitialValues,
                        [field]: "",
                    },
            }), async () => {

            });

            setTimeout(() => {
                self.formRef?.current.handleChange({
                    target: {
                        name: 'time',
                        value: Date.now(),
                    },
                });
                this.formRef?.current.setFieldTouched(field, true);
            }, 350);

        }

        return (
            <>
                {value && value.length > 0 && (
                    <div className={`ai-info-block input__wrap no-border mt-3 mb-2 d-flex-1`}>
                        <div className={'d-flex gap-10 align-items-center'}>
                            <div>
                                <FontAwesomeIcon icon={faMagicWandSparkles} title={'Forge Global Generated'}/>
                            </div>
                            <div>{value}</div>
                        </div>
                        <>
                            <div className={'d-flex-1'}>
                                <div className="b-checkbox b-checkbox">
                                    <input
                                        type={'checkbox'}
                                        id={`checkbox_${field}_forge_global`}
                                        checked={checked}
                                        disabled={this.state.isGlobalForgeLoader || this.state.isAILoader}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor={`checkbox_${field}_forge_global`}>
                                        <span></span><i> I agree with generated data (Forge Global)</i>
                                    </label>
                                </div>
                            </div>
                            <div className='admin-table-actions'>
                                <button
                                    className={`admin-table-btn ripple ${!checked || this.state.isGlobalForgeLoader || this.state.isAILoader ? 'disable' : ''}`}
                                    disabled={!checked || this.state.isGlobalForgeLoader || this.state.isAILoader}
                                    onClick={applyChanges}
                                    type={'button'}>
                                    Apply changes
                                    <FontAwesomeIcon
                                        className="nav-icon" icon={faEdit}/></button>
                            </div>
                        </>
                    </div>
                )}
            </>
        );
    };

    getRenderedAIField = (field: string) => {
        const value = this.getAIValue(field);
        const checked = this.state.aiAgreement[field] ?? false;
        const self = this;

        const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const {checked} = event.target;
            this.setState((prevState: any) => ({
                aiAgreement: {
                    ...prevState.aiAgreement,
                    [field]: checked
                }
            }));
        };

        const applyChanges = () => {
            this.setState((prevState: any) => ({
                formInitialValues: {
                    ...prevState.formInitialValues,
                    [field]: (this.state.formAIInitialValues as any)[field]
                },
                formAIInitialValues: field === "logo"
                    ? prevState.formAIInitialValues
                    : {
                        ...prevState.formAIInitialValues,
                        [field]: "",
                    },
            }), async () => {

            });

            setTimeout(() => {
                self.formRef?.current.handleChange({
                    target: {
                        name: 'time',
                        value: Date.now(),
                    },
                });
                this.formRef?.current.setFieldTouched(field, true);
            }, 350);

        }

        return (
            <>
                {value && value.length > 0 && (
                    <div className={`ai-info-block input__wrap no-border mt-3 mb-2 d-flex-1`}>
                        <div className={'d-flex gap-10 align-items-center'}>
                            <div>
                                <FontAwesomeIcon icon={faMagicWandSparkles} title={'AI Generated'}/>
                            </div>
                            <div>{value}</div>
                        </div>
                        <>
                            <div className={'d-flex-1'}>
                                <div className="b-checkbox b-checkbox">
                                    <input
                                        type={'checkbox'}
                                        id={`checkbox_${field}`}
                                        checked={checked}
                                        disabled={this.state.isGlobalForgeLoader || this.state.isAILoader}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor={`checkbox_${field}`}>
                                        <span></span><i> I agree with generated data (AI Assistant)</i>
                                    </label>
                                </div>
                            </div>
                            <div className='admin-table-actions'>
                                <button
                                    className={`admin-table-btn ripple ${!checked ? 'disable' : ''}`}
                                    disabled={!checked || this.state.isGlobalForgeLoader || this.state.isAILoader}
                                    onClick={applyChanges}
                                    type={'button'}>
                                    Apply changes
                                    <FontAwesomeIcon
                                        className="nav-icon" icon={faEdit}/></button>
                            </div>
                        </>
                    </div>
                )}
            </>
        );
    };

    isShow(): boolean {
        const {action, data} = this.props;
        return action === 'view' || !!data?.is_approved;
    }


    isDelete(): boolean {
        return this.props.action === 'delete'
    }

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        const request: Promise<any> = adminService.approvePendingAsset(values.id, this.state.isApproving || false);

        await request
            .then(((res: any) => {
                this.props.onCallback(false);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

    buttonText = () => {
        const symbolTitle = 'Symbol';
        const actionMapping: Record<string, string> = {
            'add': `Save ${symbolTitle}`,
            'edit': `Save ${symbolTitle}`,
            'view': `Save ${symbolTitle}`,
            'delete': 'Confirm',
        };

        return actionMapping[this.props.action] || '';
    }

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deletePendingAsset(values.id)
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    };

    handlePeggedChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("underpinning_asset_value", value);

        if (value == UnderpinningAssetValue.UNPEGED || value === '') {
            await setFieldValue("reference_asset", '');
        }

    };

    handleBackingCollateralDetailsChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("backing_collateral_details", value);

        if (value !== BackingCollateralDetails.ENTER_TEXT) {
            await setFieldValue("backing_collateral_details_text", '');
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

        this.processSymbolChange(value, setFieldValue, "symbol", "dsin");
    };

    handleNewSecurityNameChange = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        let value: string | null = e.target.value;

        await setFieldValue("new_security_name", value);
        await setFieldValue("new_issuer_name", value);

        this.processSymbolChange(value, setFieldValue, "new_symbol", "new_dsin");
    };

    handleCusipChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isFinra = e.target.value === 'false';
        setFieldValue("is_cusip", isFinra);
        setFieldValue("cusip", "");
    };

    processSymbolChange = async (
        value: string | null,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
        symbolField: string,
        dsinField: string
    ) => {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        const values = this.state.formInitialValues as ISymbol;
        const symbol = values.symbol;

        this.typingTimeout = setTimeout(() => {
            if (value && value.length >= 3) {
                this.setState({getSymbolProcessing: true}, () => {
                    formService.searchSymbol(value, symbol)
                        .then((res: Array<ISymbolSearch>) => {
                            const symbol = res[0].symbol || null;
                            setFieldValue(symbolField, symbol);

                            if (symbol !== null) {
                                this.setState({symbolCode: symbol}, () => {
                                    const dsin = dsinService.generate(symbol);
                                    setFieldValue(dsinField, dsin);
                                });
                            }
                        })
                        .finally(() => this.setState({getSymbolProcessing: false}));
                })
            }
        }, 1000);

    };

    handleSecImageChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: PendingSymbolFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedSecImages || [])];
            updatedFiles[index] = selectedFile;
            return {selectedSecImages: updatedFiles} as PendingSymbolFormState;
        });
    };


    handleSecImageRemove = (index: number) => {
        this.setState((prevState: PendingSymbolFormState) => {
            const updatedFiles = (prevState.selectedSecImages || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedSecImages: updatedFiles};
        });
    };

    handleSecFileChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState: PendingSymbolFormState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedSecFiles || [])];
            updatedFiles[index] = selectedFile;
            return {selectedSecFiles: updatedFiles} as PendingSymbolFormState;
        });
    };


    handleSecFileRemove = (index: number) => {
        this.setState((prevState: PendingSymbolFormState) => {
            const updatedFiles = (prevState.selectedSecFiles || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedSecFiles: updatedFiles};
        });
    };

    renderOption = (item: ISymbol) => (
        {
            value: item.symbol,
            id: item.id,
            label: (
                <div
                    className={'flex-panel-box'}>
                    <div
                        className={'panel'}>
                        <div
                            className={'content__bottom d-flex justify-content-between font-size-18'}>
                            <div
                                className={'view_block_main_title'}>
                                <AssetImage
                                    alt=''
                                    src={item.company_profile?.logo ? `${this.host}${item.company_profile?.logo}` : ''}
                                    width={28}
                                    height={28}/>
                                {item.company_profile?.company_name || item.security_name} ({item.symbol})
                            </div>
                        </div>
                    </div>
                </div>
            ),
        }
    );

    changeSymbolCode = (value: boolean) => {
        this.setState({isSymbolCodeChange: value});
    }

    submitSymbolCode = (symbolCode: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        this.setState({symbolCode: symbolCode})
        this.changeSymbolCode(false);
        this.handleSymbol(symbolCode, setFieldValue, setFieldTouched);
    }

    cancelSymbolCode = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        const symbol = this.state.symbolCode;
        this.changeSymbolCode(false);
        this.handleSymbol(symbol, setFieldValue, setFieldTouched);
    }

    submitNewSymbolCode = (symbolCode: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        this.setState({symbolCode: symbolCode})
        this.changeSymbolCode(false);
        this.handleNewSymbol(symbolCode, setFieldValue, setFieldTouched);
    }

    cancelNewSymbolNewCode = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        const symbol = this.state.symbolCode;
        this.changeSymbolCode(false);
        this.handleNewSymbol(symbol, setFieldValue, setFieldTouched);
    }

    handleSymbol = async (value: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        const alphanumericValue = value.slice(0, 6).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        await setFieldValue('symbol', alphanumericValue);
        await setFieldTouched('symbol', true);

        const dsin = dsinService.generate(alphanumericValue)
        setFieldValue('dsin', dsin);
    }

    handleNewSymbol = async (value: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void) => {
        const alphanumericValue = value.slice(0, 6).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        await setFieldValue('new_symbol', alphanumericValue);
        await setFieldTouched('new_symbol', true);
        const dsin = dsinService.generate(alphanumericValue)
        await setFieldValue('new_dsin', dsin);
    }

    renderAIGeneratedBlock = (field: string) =>
        this.state.aiGeneratedFields.includes(field) ? (
            <div className="d-flex gap-10 align-items-center justify-content-end">
                <FontAwesomeIcon icon={faMagicWandSparkles} title="AI Generated"/>
                Generated by AI Assistant
            </div>
        ) : null;


    render() {
        let action = this.props.action;
        action = action === 'delete' && this.props.isAdmin ? 'deleteAdmin' : action;

        switch (action) {
            case 'add':
            case 'edit':
            case 'view':
            case 'delete':
                return (
                    <>
                        {this.state.loading && this.isShow() ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <Formik<ISymbol>
                                    initialValues={this.state.formInitialValues as ISymbol}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                    enableReinitialize={true}
                                >
                                    {({
                                          isSubmitting,
                                          setFieldValue,
                                          isValid,
                                          dirty,
                                          values,
                                          errors,
                                          setFieldTouched
                                      }) => {
                                        formValidator.requiredFields(formSchema, values, errors);

                                        return (
                                            <Form id="bank-form" className={'position-relative'}>

                                                {this.state.successMessage && (
                                                    <AlertBlock type={"success"}
                                                                messages={this.state.successMessage}/>
                                                )}

                                                {values.version && (
                                                    <div className={'symbol-version'}>
                                                        <div className={'bg-light-blue p-2 bold'}>
                                                            Version: {values.version}
                                                        </div>
                                                    </div>
                                                )}

                                                {this.props.isAdmin && (
                                                    <>

                                                        {(['submitted', 'approved'].includes(this.props.data?.status.toLowerCase() || '')) && (
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


                                                                <>
                                                                    <div
                                                                        className={`approve-form-text pb-0 w-100 ${this.props.data?.created_by ? 'pt-1' : ''}`}>
                                                                        <>
                                                                            Status: {this.props.data?.status}
                                                                            {(
                                                                                this.props.data?.deleted_by ||
                                                                                this.props.data?.changed_by ||
                                                                                this.props.data?.approved_by ||
                                                                                this.props.data?.created_by
                                                                            ) && (
                                                                                <> by {this.props.data.deleted_by || this.props.data.changed_by || this.props.data.approved_by || this.props.data.created_by}</>
                                                                            )}
                                                                            {(
                                                                                this.props.data?.deleted_date_time ||
                                                                                this.props.data?.changed_date_time ||
                                                                                this.props.data?.approved_date_time
                                                                            ) && (
                                                                                <> at {formatterService.dateTimeFormat(
                                                                                    this.props.data.deleted_date_time ||
                                                                                    this.props.data.changed_date_time ||
                                                                                    this.props.data.approved_date_time
                                                                                )}</>
                                                                            )}
                                                                        </>

                                                                    </div>
                                                                    <div
                                                                        className={`approve-form-text w-100 pt-2 `}>Source: {this.props.data?.source_name}</div>

                                                                    {['submitted'].includes(this.props.data?.status.toLowerCase() || '') && (
                                                                        <>
                                                                            <div className='approve-form-confirm'>
                                                                                {this.state.isConfirmedApproving ? (
                                                                                    <>
                                                                                        <div
                                                                                            className='approve-form-confirm-title mb-2'>Are
                                                                                            you sure you want
                                                                                            to {this.state.isApproving ? 'approve' : 'reject'}?
                                                                                        </div>
                                                                                        <button
                                                                                            className={`b-btn ripple`}
                                                                                            type="button"
                                                                                            disabled={this.state.loading || this.state.isAILoader}
                                                                                            onClick={() => this.handleApprove(this.props.data)}>Confirm
                                                                                        </button>
                                                                                        <button
                                                                                            className={`border-btn ripple`}
                                                                                            type="button"
                                                                                            disabled={this.state.loading || this.state.isAILoader}
                                                                                            onClick={() => this.setState({
                                                                                                isConfirmedApproving: false,
                                                                                                isApproving: null
                                                                                            })}>Cancel
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <button
                                                                                            className={`b-btn ripple`}
                                                                                            type="button"
                                                                                            disabled={this.state.loading || this.state.isAILoader}
                                                                                            onClick={() => this.setState({
                                                                                                isConfirmedApproving: true,
                                                                                                isApproving: true
                                                                                            })}>Approve
                                                                                        </button>
                                                                                        <button
                                                                                            className={`border-btn ripple`}
                                                                                            type="button"
                                                                                            disabled={this.state.loading || this.state.isAILoader}
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

                                                                </>

                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {!this.isShow() && (
                                                    <div
                                                        className={'content__bottom d-flex justify-content-end'}>

                                                        <div
                                                            className={'justify-content-end d-flex align-items-center gap-10'}>
                                                            {(this.state.loading || this.state.isAILoader) && (
                                                                <LoaderBlock height={50}
                                                                             className={'p-0 m-0 d-flex-1 pre-loader-btn'}/>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className={`d-none d-md-block b-btn ripple`}
                                                                disabled={this.state.loading || this.state.isAILoader}
                                                                onClick={() => this.getAiGenerateSymbol()}
                                                            >AI Assistant <FontAwesomeIcon
                                                                icon={faMagicWandSparkles}/>
                                                            </button>
                                                            <Button
                                                                type="button"
                                                                variant="link"
                                                                className="d-md-none admin-table-btn ripple"
                                                                disabled={this.state.loading || this.state.isAILoader}
                                                                onClick={() => this.getAiGenerateSymbol()}
                                                            >
                                                                <FontAwesomeIcon icon={faMagicWandSparkles}/>
                                                            </Button>

                                                        </div>

                                                    </div>
                                                )}
                                                {(values.is_delete) && (
                                                    <>
                                                        <div className="input">
                                                            <div className="input__group">
                                                                <div className="input">
                                                                    <div className="input__title">Date <i>*</i></div>
                                                                    <div
                                                                        className={`input__wrap`}>
                                                                        <SingleDatePicker
                                                                            numberOfMonths={1}
                                                                            renderMonthElement={formatterService.renderMonthElement}
                                                                            date={values.date_entered_change ? moment(values.date_entered_delete) : null}
                                                                            onDateChange={date => setFieldValue('date_entered_delete', date?.format('YYYY-MM-DD').toString())}
                                                                            focused={this.state.focusedInputDateEntered}
                                                                            onFocusChange={({focused}) => this.setState({focusedInputDateEntered: focused})}
                                                                            id="date_entered_delete"
                                                                            displayFormat={dateFormat}
                                                                            isOutsideRange={() => false}
                                                                            readOnly={true}
                                                                            disabled={true}
                                                                            placeholder={'Select Date'}
                                                                        />
                                                                        <ErrorMessage name="date_entered_delete"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>


                                                                <div className="input">
                                                                    <div className="input__title">Time <i>*</i></div>
                                                                    <div
                                                                        className={`input__wrap`}>
                                                                        <Field
                                                                            name="time_entered_delete"
                                                                            id="time_entered_delete"
                                                                            type="time"
                                                                            placeholder="Type Time"
                                                                            className="input__text"
                                                                            readOnly={true}
                                                                            disabled={true}
                                                                        />
                                                                        <ErrorMessage name="time_entered_delete"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="input__group">
                                                                <div className="input">
                                                                    <div className="input__title">Effective
                                                                        Date <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap`}>
                                                                        <SingleDatePicker
                                                                            numberOfMonths={1}
                                                                            renderMonthElement={formatterService.renderMonthElement}
                                                                            date={values.date_effective_delete ? moment(values.date_effective_delete) : null}
                                                                            onDateChange={date => setFieldValue('date_effective_delete', date?.format('YYYY-MM-DD').toString())}
                                                                            focused={this.state.focusedInputDateEffectiveDelete}
                                                                            onFocusChange={({focused}) => this.setState({focusedInputDateEffectiveDelete: focused})}
                                                                            id="date_effective_delete"
                                                                            displayFormat={dateFormat}
                                                                            isOutsideRange={() => false}
                                                                            readOnly={true}
                                                                            placeholder={'Select Date'}
                                                                        />
                                                                        <ErrorMessage name="date_effective_delete"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>


                                                                <div className="input">
                                                                    <div className="input__title">Effective
                                                                        Time <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap`}>
                                                                        <Field
                                                                            name="time_effective_delete"
                                                                            id="time_effective_delete"
                                                                            type="time"
                                                                            placeholder="Type Time"
                                                                            className="input__text"
                                                                        />
                                                                        <ErrorMessage name="time_effective_delete"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Delete Reason</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="reason_delete"
                                                                        id="reason_delete"
                                                                        as="textarea"
                                                                        rows="3"
                                                                        className="input__textarea"
                                                                        placeholder="Type delete reason"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="reason_delete" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {this.props.action !== 'delete' && (
                                                    <>
                                                        {(!values.is_change) && (
                                                            <>
                                                                <div className="input">
                                                                    <div className="input__title">Reason for
                                                                        Entry <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="reason_for_entry"
                                                                            id="reason_for_entry"
                                                                            as="select"
                                                                            className="b-select"
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        >
                                                                            <option value="">Select a Reason</option>
                                                                            <option value="New Ticker Symbol">New Ticker
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
                                                                        <ErrorMessage name="reason_for_entry"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>

                                                                <div className="input d-none">
                                                                    <div className="input__title">Link Symbol to
                                                                        Underlying Symbol
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="underlying_symbol"
                                                                            id="underlying_symbol"
                                                                            as={Select}
                                                                            className="b-select-search"
                                                                            placeholder="Select Underlying Symbol"
                                                                            classNamePrefix="select__react"
                                                                            isDisabled={(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading)}
                                                                            isClearable={true}
                                                                            isSearchable={true}
                                                                            options={Object.values(this.masterSymbols).map((item) => (this.renderOption(item)))}
                                                                            onChange={(selectedOption: any) => {
                                                                                setFieldValue('symbol_id', selectedOption?.id || null);
                                                                            }}
                                                                            value={
                                                                                Object.values(this.masterSymbols).filter(i => i.id === values.symbol_id).map((item) => (this.renderOption(item)))?.[0] || null
                                                                            }
                                                                            filterOption={(option: any, rawInput: any) => {
                                                                                const input = rawInput.toLowerCase();
                                                                                const currentItem = this.masterSymbols.find(i => i.symbol === option.value);
                                                                                const securityName = currentItem?.security_name.toLowerCase() || '';
                                                                                const companyName = currentItem?.company_profile?.company_name.toLowerCase() || '';
                                                                                const symbol = option.value.toLowerCase();

                                                                                return (
                                                                                    symbol.includes(input) ||
                                                                                    securityName.includes(input) ||
                                                                                    companyName.includes(input)
                                                                                );
                                                                            }}
                                                                        />
                                                                        <ErrorMessage
                                                                            name="symbol_id"
                                                                            component="div"
                                                                            className="error-message"/>
                                                                    </div>
                                                                </div>


                                                                <div className={'d-none'}>

                                                                    <div className={'input'}>
                                                                        <h4 className={'input__group__title'}>Details:</h4>

                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">SPV
                                                                                Name
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="spv_name"
                                                                                    id="spv_name"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type SPV Name"
                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="spv_name"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">Fund
                                                                                Manager
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="fund_manager"
                                                                                    id="fund_manager"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type Fund Manager"
                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="fund_manager"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">Investment
                                                                                Objective
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="investment_objective"
                                                                                    id="investment_objective"
                                                                                    type="text"
                                                                                    className="input__text no-bg"
                                                                                    placeholder="Type Investment Objective"
                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="investment_objective"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">SEC
                                                                                Filing
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="sec_filing"
                                                                                    id="sec_filing"
                                                                                    render={({field}: FieldProps<any>) => (
                                                                                        <InputMask
                                                                                            {...field}
                                                                                            mask="9999-9999-99"
                                                                                            placeholder="Type SEC Filing"
                                                                                            className="input__text"
                                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                        />
                                                                                    )}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="sec_filing"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    <div className="input__title input__btns">
                                                                        <h4 className="input__group__title">SEC
                                                                            Documents:</h4>
                                                                        <button
                                                                            type="button"
                                                                            className='border-grey-btn ripple'
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            onClick={() => {
                                                                                const updatedDescriptions = [...values.sec_description, ''];
                                                                                const index = updatedDescriptions.length - 1 || 0
                                                                                setFieldValue('sec_description', updatedDescriptions);
                                                                                this.handleSecImageChange(null, index);
                                                                                this.handleSecFileChange(null, index);
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon className="nav-icon"
                                                                                             icon={faPlus}/>
                                                                        </button>
                                                                    </div>

                                                                    <div className="input">
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <div className="officer-input">
                                                                                {values.sec_description && values.sec_description.map((description, index) => (
                                                                                    <>
                                                                                        <div
                                                                                            className={'input__btns gap-20'}
                                                                                            key={index}>
                                                                                            <div
                                                                                                className={'input__wrap'}>
                                                                                                {!this.isShow() && values.sec_images[index] && (
                                                                                                    <div key={index}
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
                                                                                                    id={`sec_tmp.${index}`}
                                                                                                    name={`sec_tmp.${index}`}
                                                                                                    type="file"
                                                                                                    accept={'.' + allowedImageExt.join(',.')}
                                                                                                    className="input__file"
                                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                                    onChange={(event) => {
                                                                                                        setFieldValue(`issuer_profile_image_tmp.${index}`, event.target?.files?.[0] || '');
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
                                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                            />
                                                                                            <div
                                                                                                className={'input__wrap'}>
                                                                                                {!this.isShow() && values.sec_files[index] && (
                                                                                                    <div key={index}
                                                                                                         className="mb-2 d-flex">
                                                                                                        <Link
                                                                                                            className={'link info-panel-title-link'}
                                                                                                            href={`${this.host}${values.sec_files[index]}`}
                                                                                                            target={'_blank'}>
                                                                                                            File
                                                                                                            #{index + 1} {' '}
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
                                                                                                    className="input__file"
                                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                                    onChange={(event) => {
                                                                                                        setFieldValue(`issuer_profile_file_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                                        this.handleSecFileChange(event, index);
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                            <button
                                                                                                disabled={isSubmitting || values.sec_description.length < 2}
                                                                                                type="button"
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
                                                                                        {errors.sec_file_tmp && errors.sec_file_tmp[index] && (
                                                                                            <div
                                                                                                className="error-message input__btns">{errors.sec_file_tmp[index].toString()}</div>
                                                                                        )}
                                                                                    </>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Symbol
                                                                Information:</h4>
                                                            {(!values.is_change) && (
                                                                <>
                                                                    <div className="ai-info-block input">
                                                                        <div className="input__title">Security
                                                                            Name <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading || this.state.getSymbolProcessing) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="security_name"
                                                                                id="security_name"
                                                                                type="text"
                                                                                className={`input__text ${this.state.aiGeneratedFields.includes('security_name') ? 'filled' : ''}`}
                                                                                placeholder="Type Security Name"
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading || this.state.getSymbolProcessing}
                                                                                onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                            />
                                                                            <ErrorMessage name="security_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('security_name')}
                                                                            {this.getRenderedForgeGlobalField('security_name')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="input ai-info-block">
                                                                        <div className="input__title">Symbol</div>
                                                                        {!this.state.isSymbolCodeChange ? (
                                                                            <div
                                                                                className={`input__wrap no-border input__btns justify-content-center  ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                <div
                                                                                    className={`input__wrap no-border`}>
                                                                                    <Field
                                                                                        name="symbol"
                                                                                        id="symbol"
                                                                                        type="text"
                                                                                        className={`input__text dsin ${!this.state.isSymbolCodeChange ? !this.isShow() ? 'ml-55px' : '' : ''}`}
                                                                                        disabled={true}
                                                                                    />
                                                                                </div>
                                                                                {getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) && (
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                        className='border-grey-btn ripple'
                                                                                        onClick={() => {
                                                                                            setFieldValue('is_change', true);
                                                                                            setFieldValue('new_symbol', values.symbol);
                                                                                            setFieldValue('new_security_name', values.security_name);
                                                                                            this.handleNewSymbol(values.symbol, setFieldValue, setFieldTouched)
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faEdit}/>
                                                                                    </button>
                                                                                )}

                                                                                {!getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) && values.symbol && !this.state.isSymbolCodeChange && (
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                        className='border-grey-btn ripple'
                                                                                        onClick={() => this.changeSymbolCode(true)}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faEdit}/>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                className={`input__wrap input__btns justify-content-center  ${(isSubmitting) ? 'disable' : 'no-border'}`}>
                                                                                <Field
                                                                                    name="symbol"
                                                                                    id="symbol"
                                                                                    type="text"
                                                                                    className="input__text edit"
                                                                                    placeholder="Type Symbol"
                                                                                    disabled={isSubmitting}
                                                                                    onChange={(e: any) => this.handleSymbol(e.target.value, setFieldValue, setFieldTouched)}
                                                                                />

                                                                                <button
                                                                                    type="button"
                                                                                    className={`border-grey-btn ripple ${isSubmitting || !!errors?.symbol?.length ? 'disable' : ''}`}
                                                                                    disabled={isSubmitting || !!errors?.symbol?.length}
                                                                                    onClick={() => this.submitSymbolCode(values.symbol, setFieldValue, setFieldTouched)}>
                                                                                    <FontAwesomeIcon
                                                                                        className="nav-icon"
                                                                                        icon={faCheck}/>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                    className='border-grey-btn ripple'
                                                                                    onClick={() => this.cancelSymbolCode(setFieldValue, setFieldTouched)}>
                                                                                    <FontAwesomeIcon
                                                                                        className="nav-icon"
                                                                                        icon={faClose}/>
                                                                                </button>

                                                                                <ErrorMessage name="symbol"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}

                                                            {(values.is_change) && (
                                                                <>
                                                                    <div className="input">
                                                                        <div className="input__group">
                                                                            <div className="input">
                                                                                <div
                                                                                    className="input__title">Date <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap`}>
                                                                                    <SingleDatePicker
                                                                                        numberOfMonths={1}
                                                                                        renderMonthElement={formatterService.renderMonthElement}
                                                                                        date={values.date_entered_change ? moment(values.date_entered_change) : null}
                                                                                        onDateChange={date => setFieldValue('date_entered_change', date?.format('YYYY-MM-DD').toString())}
                                                                                        focused={this.state.focusedInputDateEntered}
                                                                                        onFocusChange={({focused}) => this.setState({focusedInputDateEntered: focused})}
                                                                                        id="date_entered_change"
                                                                                        displayFormat={dateFormat}
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
                                                                                    className={`input__wrap`}>
                                                                                    <Field
                                                                                        name="time_entered_change"
                                                                                        id="time_entered_change"
                                                                                        type="time"
                                                                                        placeholder="Type Time"
                                                                                        className="input__text"
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
                                                                                    className={`input__wrap`}>
                                                                                    <SingleDatePicker
                                                                                        numberOfMonths={1}
                                                                                        renderMonthElement={formatterService.renderMonthElement}
                                                                                        date={values.date_effective_change ? moment(values.date_effective_change) : null}
                                                                                        onDateChange={date => setFieldValue('date_effective_change', date?.format('YYYY-MM-DD').toString())}
                                                                                        focused={this.state.focusedInputDateEffective}
                                                                                        onFocusChange={({focused}) => this.setState({focusedInputDateEffective: focused})}
                                                                                        id="date_effective_change"
                                                                                        displayFormat={dateFormat}
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
                                                                                    className={`input__wrap`}>
                                                                                    <Field
                                                                                        name="time_effective_change"
                                                                                        id="time_effective_change"
                                                                                        type="time"
                                                                                        placeholder="Type Time"
                                                                                        className="input__text"
                                                                                    />
                                                                                    <ErrorMessage
                                                                                        name="time_effective_change"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div className="input__title">Security
                                                                                Name <i>*</i>
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.state.getSymbolProcessing) ? 'disable' : ''}`}>
                                                                                <Field
                                                                                    name="new_security_name"
                                                                                    id="new_security_name"
                                                                                    type="text"
                                                                                    className="input__text"
                                                                                    placeholder="Type Security Name"
                                                                                    disabled={isSubmitting || this.state.getSymbolProcessing}
                                                                                    onChange={(e: any) => this.handleNewSecurityNameChange(e, setFieldValue)}
                                                                                />
                                                                                <ErrorMessage
                                                                                    name="new_security_name"
                                                                                    component="div"
                                                                                    className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">Symbol
                                                                            </div>
                                                                            {!this.state.isSymbolCodeChange ? (
                                                                                <div
                                                                                    className={`input input__btns justify-content-center no-border`}>
                                                                                    <Field
                                                                                        name="new_symbol"
                                                                                        id="new_symbol"
                                                                                        type="text"
                                                                                        className="input__text dsin ml-45px"
                                                                                        disabled={true}
                                                                                    />

                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                        className='border-grey-btn ripple'
                                                                                        onClick={() => this.changeSymbolCode(true)}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faEdit}/>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <div
                                                                                    className={`input no-border input__btns justify-content-center  ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                                    <Field
                                                                                        name="new_symbol"
                                                                                        id="new_symbol"
                                                                                        type="text"
                                                                                        className="input__text edit"
                                                                                        placeholder="Type Symbol"
                                                                                        onChange={(e: any) => this.handleNewSymbol(e.target.value, setFieldValue, setFieldTouched)}
                                                                                        disabled={isSubmitting}
                                                                                    />

                                                                                    <button
                                                                                        type="button"
                                                                                        className={`border-grey-btn ripple ${isSubmitting || !!errors?.new_symbol?.length ? 'disable' : ''}`}
                                                                                        disabled={isSubmitting || !!errors?.new_symbol?.length}
                                                                                        onClick={() => this.submitNewSymbolCode(values.new_symbol ?? '', setFieldValue, setFieldTouched)}>
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faCheck}/>
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                        className='border-grey-btn ripple'
                                                                                        onClick={() => this.cancelNewSymbolNewCode(setFieldValue, setFieldTouched)}>
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faClose}/>
                                                                                    </button>

                                                                                    <ErrorMessage
                                                                                        name="new_symbol"
                                                                                        component="div"
                                                                                        className="error-message"/>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="input">
                                                                            <div className="input__title">Change
                                                                                Reason
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                                <Field
                                                                                    name="reason_change"
                                                                                    id="reason_change"
                                                                                    as="textarea"
                                                                                    rows="3"
                                                                                    className="input__textarea"
                                                                                    placeholder="Type change reason"
                                                                                    disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                />
                                                                                <ErrorMessage name="reason_change"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div className="input__title">Digital
                                                                                Security
                                                                                Identifier
                                                                                Number -
                                                                                DSIN
                                                                            </div>
                                                                            <div className="input__group mb-0">
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Current
                                                                                    </div>
                                                                                    <div
                                                                                        className={`input__wrap`}>
                                                                                        <Field
                                                                                            name="dsin"
                                                                                            id="dsin"
                                                                                            type="text"
                                                                                            className="input__text dsin"
                                                                                            disabled={true}
                                                                                        />
                                                                                        <ErrorMessage name="dsin"
                                                                                                      component="div"
                                                                                                      className="error-message"/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="input">
                                                                                    <div
                                                                                        className="input__title">Destination
                                                                                    </div>
                                                                                    <div
                                                                                        className={`input__wrap`}>
                                                                                        <Field
                                                                                            name="new_dsin"
                                                                                            id="new_dsin"
                                                                                            type="text"
                                                                                            className="input__text dsin blue"
                                                                                            disabled={true}
                                                                                        />
                                                                                        <ErrorMessage
                                                                                            name="new_dsin"
                                                                                            component="div"
                                                                                            className="error-message"/>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className={'input__title mt-2'}>
                                                                            <span
                                                                                className={'fw-bold '}>Notice: </span> if
                                                                                you change the Symbol the DSIN is
                                                                                changed

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <hr className={'mb-24'}/>

                                                                    <div className="input">
                                                                        <div className="input__title">Security
                                                                            Name <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading || this.state.getSymbolProcessing) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="security_name"
                                                                                id="security_name"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Security Name"
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading || this.state.getSymbolProcessing}
                                                                                onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                            />
                                                                            <ErrorMessage name="security_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                    <div className="input">
                                                                        <div className="input__title">Symbol
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap text-center`}>
                                                                            <Field
                                                                                name="symbol"
                                                                                id="symbol"
                                                                                type="text"
                                                                                className="input__text dsin"
                                                                                disabled={true}
                                                                            />
                                                                            <ErrorMessage name="symbol"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Asset Status <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="asset_status"
                                                                        id="asset_status"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('asset_status') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Asset Status
                                                                        </option>
                                                                        {Object.values(AssetStatus).map((status) => (
                                                                            <option key={status}
                                                                                    value={status}>
                                                                                {status}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="asset_status"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('asset_status')}
                                                                    {this.getRenderedForgeGlobalField('asset_status')}
                                                                </div>
                                                            </div>

                                                            <div className={'input'}>
                                                                <div className="input ai-info-block">
                                                                    <div
                                                                        className={`b-checkbox b-checkbox${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? ' disable' : ''}`}>
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="is_cusip"
                                                                            id="is_cusip"
                                                                            className={`${this.state.aiGeneratedFields.includes('is_cusip') ? 'filled' : ''}`}
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            onClick={(e: any) => this.handleCusipChange(e, setFieldValue)}
                                                                        />
                                                                        <label htmlFor="is_cusip">
                                                                            <span></span><i> Does it have cusip
                                                                            number?
                                                                        </i>
                                                                        </label>
                                                                        <ErrorMessage name="is_cusip"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('is_cusip')}
                                                                        {this.getRenderedForgeGlobalField('is_cusip')}
                                                                    </div>
                                                                </div>

                                                                {values.is_cusip && (
                                                                    <div className="input ai-info-block">
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="cusip"
                                                                                id="cusip"
                                                                                type="text"
                                                                                className={`input__text ${this.state.aiGeneratedFields.includes('cusip') ? 'filled' : ''}`}
                                                                                placeholder="Type CUSIP"
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            />
                                                                            <ErrorMessage name="cusip"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('cusip')}
                                                                            {this.getRenderedForgeGlobalField('cusip')}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Digital Security
                                                                    Identifier
                                                                    Number -
                                                                    DSIN
                                                                </div>
                                                                <div
                                                                    className={`input__wrap text-center`}>
                                                                    <Field
                                                                        name="dsin"
                                                                        id="dsin"
                                                                        type="text"
                                                                        className="input__text dsin"
                                                                        disabled={true}
                                                                    />
                                                                    <ErrorMessage name="dsin" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Fifth Character
                                                                    Identifiers
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fifth_character_identifier"
                                                                        id="fifth_character_identifier"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('fifth_character_identifier') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Fifth Character
                                                                            Identifiers
                                                                        </option>
                                                                        {Object.values(FifthCharacterIdentifier).map((identifier) => (
                                                                            <option key={identifier}
                                                                                    value={identifier}>
                                                                                {identifier}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="fifth_character_identifier"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('fifth_character_identifier')}
                                                                    {this.getRenderedForgeGlobalField('fifth_character_identifier')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Alternative Asset
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="alternative_asset_category"
                                                                        id="alternative_asset_category"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('alternative_asset_category') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Alternative Asset
                                                                        </option>
                                                                        {Object.values(AlternativeAssetCategory).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="alternative_asset_category"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('alternative_asset_category')}
                                                                    {this.getRenderedForgeGlobalField('alternative_asset_category')}
                                                                </div>
                                                            </div>

                                                            {values.alternative_asset_category !== '' && getAlternativeAssetSubCategory(values.alternative_asset_category) && (
                                                                <div className="input ai-info-block">
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="alternative_asset_subcategory"
                                                                            id="alternative_asset_subcategory"
                                                                            as="select"
                                                                            className={`b-select ${this.state.aiGeneratedFields.includes('alternative_asset_subcategory') ? 'filled' : ''}`}
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        >
                                                                            <option value="">Select category
                                                                            </option>
                                                                            {Object.values(getAlternativeAssetSubCategory(values.alternative_asset_category)).map((type: any) => (
                                                                                <option key={type} value={type}>
                                                                                    {type}
                                                                                </option>
                                                                            ))}

                                                                        </Field>

                                                                        <ErrorMessage
                                                                            name="alternative_asset_subcategory"
                                                                            component="div"
                                                                            className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('alternative_asset_subcategory')}
                                                                        {this.getRenderedForgeGlobalField('alternative_asset_subcategory')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Debt Instrument
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="debt_instrument"
                                                                        id="debt_instrument"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('debt_instrument') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Debt Instrument
                                                                        </option>
                                                                        {Object.values(DebtInstrument).map((instrument) => (
                                                                            <option key={instrument} value={instrument}>
                                                                                {instrument}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="debt_instrument"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('debt_instrument')}
                                                                    {this.getRenderedForgeGlobalField('debt_instrument')}
                                                                </div>
                                                            </div>

                                                            {values.debt_instrument !== '' && (
                                                                <>
                                                                    <div className="input ai-info-block">
                                                                        <div className="input__title">Face Value/Par
                                                                            Value <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="face_value_par_value"
                                                                                id="face_value_par_value"
                                                                                type="text"
                                                                                className={`input__text ${this.state.aiGeneratedFields.includes('face_value_par_value') ? 'filled' : ''}`}
                                                                                placeholder="Type Face Value/Par Value"
                                                                                component={NumericInputField}
                                                                                decimalScale={2}
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            />
                                                                            <ErrorMessage name="face_value_par_value"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('face_value_par_value')}
                                                                            {this.getRenderedForgeGlobalField('face_value_par_value')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="input ai-info-block">
                                                                        <div className="input__title">Coupon/Interest
                                                                            Rate <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="coupon_interest_rate"
                                                                                id="coupon_interest_rate"
                                                                                type="text"
                                                                                className={`input__text ${this.state.aiGeneratedFields.includes('coupon_interest_rate') ? 'filled' : ''}`}
                                                                                placeholder="Type Coupon/Interest Rate"
                                                                                component={NumericInputField}
                                                                                decimalScale={3}
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            />
                                                                            <ErrorMessage name="coupon_interest_rate"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('coupon_interest_rate')}
                                                                            {this.getRenderedForgeGlobalField('coupon_interest_rate')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="input ai-info-block">
                                                                        <div className="input__title">Maturity
                                                                            Date <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <SingleDatePicker
                                                                                numberOfMonths={1}
                                                                                renderMonthElement={formatterService.renderMonthElement}
                                                                                date={values.maturity_date ? moment(values.maturity_date) : null}
                                                                                onDateChange={date => setFieldValue('maturity_date', date?.format('YYYY-MM-DD').toString())}
                                                                                focused={this.state.focusedMaturityDate}
                                                                                onFocusChange={({focused}) => this.setState({focusedMaturityDate: focused})}
                                                                                id="maturity_date"
                                                                                displayFormat={dateFormat}
                                                                                isOutsideRange={() => false}
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                                readOnly={true}
                                                                                placeholder={'Select Maturity Date'}
                                                                            />
                                                                            <ErrorMessage name="maturity_date"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('maturity_date')}
                                                                            {this.getRenderedForgeGlobalField('maturity_date')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="input ai-info-block">
                                                                        <div className="input__title">Payment
                                                                            Frequency <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="payment_frequency"
                                                                                id="payment_frequency"
                                                                                as="select"
                                                                                className={`b-select ${this.state.aiGeneratedFields.includes('payment_frequency') ? 'filled' : ''}`}
                                                                                disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                            >
                                                                                <option value="">Select Payment
                                                                                    Frequency
                                                                                </option>
                                                                                {Object.values(PaymentFrequency).map((frequency) => (
                                                                                    <option key={frequency}
                                                                                            value={frequency}>
                                                                                        {frequency}
                                                                                    </option>
                                                                                ))}
                                                                            </Field>
                                                                            <ErrorMessage name="payment_frequency"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                        <div className={'d-flex'}>
                                                                            {this.getRenderedAIField('payment_frequency')}
                                                                            {this.getRenderedForgeGlobalField('payment_frequency')}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Exempted Offerings
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="exempted_offerings"
                                                                        id="exempted_offerings"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('exempted_offerings') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Exempted Offering
                                                                        </option>
                                                                        {Object.values(ExemptedOfferingType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="exempted_offerings"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>

                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('exempted_offerings')}
                                                                    {this.getRenderedForgeGlobalField('exempted_offerings')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Market Sector <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="market_sector"
                                                                        id="market_sector"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('market_sector') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Market Sector
                                                                        </option>
                                                                        {Object.values(MarketSector).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="market_sector"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('market_sector')}
                                                                    {this.getRenderedForgeGlobalField('market_sector')}
                                                                </div>
                                                            </div>

                                                            {values.market_sector !== '' && getMarketSectorCategory(values.market_sector) && (
                                                                <div className="input ai-info-block">
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                        <Field
                                                                            name="market_sector_category"
                                                                            id="market_sector_category"
                                                                            as="select"
                                                                            className={`b-select ${this.state.aiGeneratedFields.includes('market_sector_category') ? 'filled' : ''}`}
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        >
                                                                            <option value="">Select Market
                                                                                Sector Category
                                                                            </option>
                                                                            {Object.values(getMarketSectorCategory(values.market_sector)).map((type: any) => (
                                                                                <option key={type}
                                                                                        value={type}>
                                                                                    {type}
                                                                                </option>
                                                                            ))}

                                                                        </Field>

                                                                        <ErrorMessage
                                                                            name="market_sector_category"
                                                                            component="div"
                                                                            className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('market_sector_category')}
                                                                        {this.getRenderedForgeGlobalField('market_sector_category')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Lot Size
                                                                    ({getLotSize().join(', ')}) <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="lot_size"
                                                                        id="lot_size"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('lot_size') ? 'filled' : ''}`}
                                                                        placeholder="Type Lot Size"
                                                                        component={NumericInputField}
                                                                        decimalScale={0}
                                                                        isThousandSeparator={false}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="lot_size" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('lot_size')}
                                                                    {this.getRenderedForgeGlobalField('lot_size')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Fractional Lot Size
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fractional_lot_size"
                                                                        id="fractional_lot_size"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('fractional_lot_size') ? 'filled' : ''}`}
                                                                        placeholder="Type Fractional Lot Size"
                                                                        component={NumericInputField}
                                                                        decimalScale={6}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="fractional_lot_size"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('fractional_lot_size')}
                                                                    {this.getRenderedForgeGlobalField('fractional_lot_size')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Minimum Price
                                                                    Variation
                                                                    (MPV)
                                                                    (.01,
                                                                    .05, .10)
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="mvp"
                                                                        id="mvp"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('mvp') ? 'filled' : ''}`}
                                                                        placeholder="Type MPV"
                                                                        component={NumericInputField}
                                                                        decimalScale={4}
                                                                        isThousandSeparator={false}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="mvp" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('mvp')}
                                                                    {this.getRenderedForgeGlobalField('mvp')}
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Symbol Trading
                                                                Information:</h4>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Primary
                                                                    ATS <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                    <Field
                                                                        name="primary_ats"
                                                                        id="primary_ats"
                                                                        as="select"
                                                                        className={`b-select no-bg ${this.state.aiGeneratedFields.includes('primary_ats') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Primary ATS</option>

                                                                        <optgroup label="None or add a new">
                                                                            {this.primaryATS.slice(0, 2).map((primaryATS: {
                                                                                value: string,
                                                                                label: string
                                                                            }) => (
                                                                                <option key={primaryATS.value}
                                                                                        value={primaryATS.value}>
                                                                                    {primaryATS.label}
                                                                                </option>
                                                                            ))}
                                                                        </optgroup>
                                                                        {}
                                                                        {(() => {
                                                                            const existingATS = this.primaryATS.slice(2);
                                                                            return existingATS.length > 0 && (
                                                                                <optgroup label="Or select existing">
                                                                                    {existingATS.map((primaryATS: {
                                                                                        value: string,
                                                                                        label: string
                                                                                    }) => (
                                                                                        <option key={primaryATS.value}
                                                                                                value={primaryATS.value}>
                                                                                            {primaryATS.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </optgroup>
                                                                            );
                                                                        })()}
                                                                    </Field>

                                                                    <ErrorMessage
                                                                        name="primary_ats"
                                                                        component="div"
                                                                        className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('primary_ats')}
                                                                    {this.getRenderedForgeGlobalField('primary_ats')}
                                                                </div>
                                                            </div>

                                                            {values.primary_ats === PrimaryATS.ADD_NEW.value && (

                                                                <div className="input ai-info-block">
                                                                    <div
                                                                        className="input__title">Add Primary
                                                                        ATS <i>*</i>
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : 'no-border'}`}>
                                                                        <Field
                                                                            name="new_primary_ats"
                                                                            id="new_primary_ats"
                                                                            type="text"
                                                                            className="input__text no-bg"
                                                                            placeholder="Enter the primary ATS"
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        />
                                                                        <ErrorMessage
                                                                            name="new_primary_ats"
                                                                            component="div"
                                                                            className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Transfer Agent</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="transfer_agent"
                                                                        id="transfer_agent"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('transfer_agent') ? 'filled' : ''}`}
                                                                        placeholder="Type Transfer Agent"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="transfer_agent" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('transfer_agent')}
                                                                    {this.getRenderedForgeGlobalField('transfer_agent')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Custodian</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="custodian"
                                                                        id="custodian"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('custodian') ? 'filled' : ''}`}
                                                                        placeholder="Type Custodian"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="custodian" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('custodian')}
                                                                    {this.getRenderedForgeGlobalField('custodian')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Edgar CIK
                                                                    <Link className={'link info-panel-title-link'}
                                                                          href={'https://www.sec.gov/edgar/searchedgar/companysearch'}
                                                                          target={'_blank'}>
                                                                        Company Filings <FontAwesomeIcon
                                                                        className="nav-icon"
                                                                        icon={faArrowUpRightFromSquare}/>
                                                                    </Link>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="edgar_cik"
                                                                        id="edgar_cik"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('edgar_cik') ? 'filled' : ''}`}
                                                                        placeholder="Type Edgar CIK"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="edgar_cik" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('edgar_cik')}
                                                                    {this.getRenderedForgeGlobalField('edgar_cik')}
                                                                </div>
                                                            </div>

                                                        </div>


                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Digital Asset:</h4>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Date of Issue / Creation
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <SingleDatePicker
                                                                        numberOfMonths={1}
                                                                        renderMonthElement={formatterService.renderMonthElement}
                                                                        date={values.issue_date ? moment(values.issue_date) : null}
                                                                        onDateChange={date => setFieldValue('issue_date', date?.format('YYYY-MM-DD').toString())}
                                                                        focused={this.state.focusedIssueDate}
                                                                        onFocusChange={({focused}) => this.setState({focusedIssueDate: focused})}
                                                                        id="issue_date"
                                                                        displayFormat={dateFormat}
                                                                        isOutsideRange={() => false}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        readOnly={true}
                                                                        placeholder={'Select Date of Issue / Creation'}
                                                                    />
                                                                    <ErrorMessage name="issue_date"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('issue_date')}
                                                                    {this.getRenderedForgeGlobalField('issue_date')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Issuance / Governance
                                                                    Notes
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="governance_notes"
                                                                        id="governance_notes"
                                                                        as="textarea"
                                                                        rows="3"
                                                                        className={`input__textarea ${this.state.aiGeneratedFields.includes('governance_notes') ? 'filled' : ''}`}
                                                                        placeholder="DAO, corporate board, free-form text"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="governance_notes"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('governance_notes')}
                                                                    {this.getRenderedForgeGlobalField('governance_notes')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Digital Asset Category
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="digital_asset_category"
                                                                        id="digital_asset_category"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('digital_asset_category') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Digital Asset Category
                                                                        </option>
                                                                        {Object.values(DigitalAssetCategory).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="digital_asset_category"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('digital_asset_category')}
                                                                    {this.getRenderedForgeGlobalField('digital_asset_category')}
                                                                </div>
                                                            </div>

                                                            {values.digital_asset_category !== '' && getDigitalAssetCategoryInstrument(values.digital_asset_category) && (
                                                                <div className="input ai-info-block">
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="instrument_type"
                                                                            id="instrument_type"
                                                                            as="select"
                                                                            className={`b-select ${this.state.aiGeneratedFields.includes('instrument_type') ? 'filled' : ''}`}
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        >
                                                                            <option value="">Select Instrument Type
                                                                            </option>
                                                                            {Object.values(getDigitalAssetCategoryInstrument(values.digital_asset_category)).map((type: any) => (
                                                                                <option key={type} value={type}>
                                                                                    {type}
                                                                                </option>
                                                                            ))}

                                                                        </Field>

                                                                        <ErrorMessage name="instrument_type"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>

                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('instrument_type')}
                                                                        {this.getRenderedForgeGlobalField('instrument_type')}
                                                                    </div>
                                                                </div>
                                                            )}


                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Issuer Name</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="issuer_name"
                                                                        id="issuer_name"
                                                                        type="text"
                                                                        className={`input__text ${this.state.aiGeneratedFields.includes('issuer_name') ? 'filled' : ''}`}
                                                                        placeholder="Type Issuer Name"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="issuer_name" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('issuer_name')}
                                                                    {this.getRenderedForgeGlobalField('issuer_name')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Issuer Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="issuer_type"
                                                                        id="issuer_type"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('instrument_type') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Issuer Type
                                                                        </option>
                                                                        {Object.values(IssuerType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="issuer_type" component="div"
                                                                                  className="error-message"/>
                                                                </div>

                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('issuer_type')}
                                                                    {this.getRenderedForgeGlobalField('issuer_type')}
                                                                </div>
                                                            </div>

                                                            <hr/>

                                                            <div className={'input ai-info-block'}>
                                                                <div className="input__title">Underpinning Asset Value
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="underpinning_asset_value"
                                                                        id="underpinning_asset_value"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('underpinning_asset_value') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        onChange={(e: any) => this.handlePeggedChange(e, setFieldValue)}
                                                                    >
                                                                        <option value="">Select Underpinning Asset Value
                                                                        </option>
                                                                        {Object.values(UnderpinningAssetValue).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="underpinning_asset_value"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('underpinning_asset_value')}
                                                                    {this.getRenderedForgeGlobalField('underpinning_asset_value')}
                                                                </div>
                                                            </div>

                                                            {values.underpinning_asset_value === UnderpinningAssetValue.PEGGED && (

                                                                <div className="input ai-info-block">
                                                                    <div className="input__title">Reference Asset
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="reference_asset"
                                                                            id="reference_asset"
                                                                            type="text"
                                                                            className={`input__text ${this.state.aiGeneratedFields.includes('reference_asset') ? 'filled' : ''}`}
                                                                            placeholder="Enter the asset Type"
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        />
                                                                        <ErrorMessage name="reference_asset"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('reference_asset')}
                                                                        {this.getRenderedForgeGlobalField('reference_asset')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <hr/>
                                                            <div className={'input ai-info-block'}>
                                                                <div className="input__title">Backing / Collateral
                                                                    Details (If Any)
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="backing_collateral_details"
                                                                        id="backing_collateral_details"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('backing_collateral_details') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        onChange={(e: any) => this.handleBackingCollateralDetailsChange(e, setFieldValue)}
                                                                    >
                                                                        <option value="">Select Backing / Collateral
                                                                            Details
                                                                        </option>
                                                                        {Object.values(BackingCollateralDetails).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="backing_collateral_details"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('backing_collateral_details')}
                                                                    {this.getRenderedForgeGlobalField('backing_collateral_details')}
                                                                </div>
                                                            </div>

                                                            {values.backing_collateral_details === BackingCollateralDetails.ENTER_TEXT && (

                                                                <div className="input ai-info-block">
                                                                    <div className="input__title">Backing / Collateral
                                                                        Details (Notes)
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="backing_collateral_details_text"
                                                                            id="backing_collateral_details_text"
                                                                            as="textarea"
                                                                            rows="3"
                                                                            className={`input__textarea ${this.state.aiGeneratedFields.includes('backing_collateral_details_text') ? 'filled' : ''}`}
                                                                            placeholder="Enter Text"
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        />
                                                                        <ErrorMessage
                                                                            name="backing_collateral_details_text"
                                                                            component="div"
                                                                            className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('backing_collateral_details_text')}
                                                                        {this.getRenderedForgeGlobalField('backing_collateral_details_text')}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <hr/>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Rights Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="rights_type"
                                                                        id="rights_type"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('rights_type') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Rights Type
                                                                        </option>
                                                                        {Object.values(RightsType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="rights_type" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('rights_type')}
                                                                    {this.getRenderedForgeGlobalField('rights_type')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Enforceability</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="enforceability_type"
                                                                        id="enforceability_type"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('enforceability_type') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Enforceability
                                                                        </option>
                                                                        {Object.values(EnforceabilityType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="enforceability_type"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('enforceability_type')}
                                                                    {this.getRenderedForgeGlobalField('enforceability_type')}
                                                                </div>
                                                            </div>

                                                            <hr/>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Fungibility Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fungibility_type"
                                                                        id="fungibility_type"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('fungibility_type') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Fungibility Type
                                                                        </option>
                                                                        {Object.values(FungibilityType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="fungibility_type"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('fungibility_type')}
                                                                    {this.getRenderedForgeGlobalField('fungibility_type')}
                                                                </div>
                                                            </div>

                                                            <div className={'input ai-info-block'}>
                                                                <div className="input__title">Redeemability Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="redeemability_type"
                                                                        id="redeemability_type"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('redeemability_type') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        onChange={(e: any) => this.handleRedeemabilityChange(e, setFieldValue)}
                                                                    >
                                                                        <option value="">Select Redeemability Type
                                                                        </option>
                                                                        {Object.values(RedeemabilityType).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="redeemability_type"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('redeemability_type')}
                                                                    {this.getRenderedForgeGlobalField('redeemability_type')}
                                                                </div>
                                                            </div>

                                                            {values.redeemability_type === RedeemabilityType.REDEEMABLE && (

                                                                <div className="input ai-info-block">
                                                                    <div className="input__title">Redemption Asset Type
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="redemption_asset_type"
                                                                            id="redemption_asset_type"
                                                                            type="text"
                                                                            className={`input__text ${this.state.aiGeneratedFields.includes('redemption_asset_type') ? 'filled' : ''}`}
                                                                            placeholder="Enter the Redemption asset Type"
                                                                            disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                        />
                                                                        <ErrorMessage name="redemption_asset_type"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                    <div className={'d-flex'}>
                                                                        {this.getRenderedAIField('redemption_asset_type')}
                                                                        {this.getRenderedForgeGlobalField('redemption_asset_type')}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Nature of record</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="nature_of_record"
                                                                        id="nature_of_record"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('nature_of_record') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Nature of record
                                                                        </option>
                                                                        {Object.values(NatureOfRecord).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="nature_of_record"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('nature_of_record')}
                                                                    {this.getRenderedForgeGlobalField('nature_of_record')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Settlement Method</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="settlement_method"
                                                                        id="settlement_method"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('settlement_method') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Settlement Method
                                                                        </option>
                                                                        {Object.values(SettlementMethod).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="settlement_method"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('settlement_method')}
                                                                    {this.getRenderedForgeGlobalField('settlement_method')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Custody Arrangements</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="custody_arrangement"
                                                                        id="custody_arrangement"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('custody_arrangement') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Custody Arrangements
                                                                        </option>
                                                                        {Object.values(CustodyArrangement).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="custody_arrangement"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('custody_arrangement')}
                                                                    {this.getRenderedForgeGlobalField('custody_arrangement')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Associated Network /
                                                                    Ledger
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="associated_network"
                                                                        id="associated_network"
                                                                        as="select"
                                                                        className={`b-select ${this.state.aiGeneratedFields.includes('associated_network') ? 'filled' : ''}`}
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    >
                                                                        <option value="">Select Associated Network /
                                                                            Ledger
                                                                        </option>
                                                                        {Object.values(AssociatedNetwork).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="associated_network"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('associated_network')}
                                                                    {this.getRenderedForgeGlobalField('associated_network')}
                                                                </div>
                                                            </div>

                                                            <div className="input ai-info-block">
                                                                <div className="input__title">Free-Form Notes
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="notes"
                                                                        id="notes"
                                                                        as="textarea"
                                                                        rows="3"
                                                                        className={`input__textarea ${this.state.aiGeneratedFields.includes('notes') ? 'filled' : ''}`}
                                                                        placeholder="Comments"
                                                                        disabled={isSubmitting || this.isShow() || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}
                                                                    />
                                                                    <ErrorMessage name="notes"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                                <div className={'d-flex'}>
                                                                    {this.getRenderedAIField('notes')}
                                                                    {this.getRenderedForgeGlobalField('notes')}
                                                                </div>
                                                            </div>

                                                        </div>

                                                    </>
                                                )}

                                                {((this.props.action !== 'view') || (this.props.action === 'view' && values.is_change)) && (
                                                    <button id="add-bank-acc"
                                                            className={`b-btn ripple ${(isSubmitting || !isValid || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading) ? 'disable' : ''}`}
                                                            type="submit"
                                                            disabled={isSubmitting || !isValid || this.state.isAILoader || this.state.isGlobalForgeLoader || this.state.loading}>
                                                        {this.buttonText()}
                                                    </button>
                                                )}

                                                {this.state.errorMessages && (
                                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                )}
                                            </Form>
                                        );
                                    }}
                                </Formik>

                                {this.props.data?.linked_symbol_count !== undefined &&
                                    this.props.data?.linked_symbol_count !== null &&
                                    this.props.data?.linked_symbol_count > 0 &&
                                    this.props.action === 'view' && (
                                        <div className={'input'}>
                                            <h4 className="input__group__title">Symbols</h4>
                                            <SubSymbolBlock symbol={this.props.data?.symbol || ''}/>
                                        </div>
                                    )}
                            </>
                        )}
                    </>
                )
            case
            'deleteAdmin'
            :
                return (
                    <>
                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <div className="confirm-btns-panel mt-4">
                                    {this.props?.onCancel && (
                                        <button className="border-btn ripple"
                                                onClick={() => this.props.onCancel?.()}>Cancel</button>
                                    )}
                                    <button
                                        className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                        type="button" disabled={this.state.isDeleting}
                                        onClick={() => this.handleDelete(this.props.data)}>Confirm
                                    </button>
                                </div>
                            </>

                        )}

                    </>
                );
        }


    }
}

export default PendingSymbolForm;
