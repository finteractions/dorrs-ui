import React, {RefObject} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {FormStatus, getApprovedFormStatus, getBuildableFormStatuses} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {ISymbol} from "@/interfaces/i-symbol";
import symbolService from "@/services/symbol/symbol-service";
import dsinService from "@/services/dsin/dsin-service";
import {MarketSector} from "@/enums/market-sector";
import {FifthCharacterIdentifier} from "@/enums/fifth-character-identifier";
import moment from 'moment-timezone';
import 'moment-timezone/builds/moment-timezone-with-data';
import 'react-dates/initialize';
import {SingleDatePicker} from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {createColumnHelper} from "@tanstack/react-table";
import {IActivityStorage} from "@/interfaces/i-activity-storage";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faEdit} from "@fortawesome/free-solid-svg-icons";
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

interface SymbolFormState extends IState {
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
}

interface SymbolFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISymbol | null;
    onCancel?: () => void;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class MembershipForm extends React.Component<SymbolFormProps, SymbolFormState> {

    state: SymbolFormState;

    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    targetTimeZone = 'UTC';

    formRef: RefObject<any>;

    constructor(props: SymbolFormProps) {
        super(props);

        const initialTime = moment().format('HH:mm');

        const initialData = this.props.data || {} as ISymbol;

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

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            isDeleting: false,
            focusedInputDateEntered: null,
            focusedInputDateEffective: null,
            focusedInputDateEnteredDelete: null,
            focusedInputDateEffectiveDelete: null,
            history: initialData?.history || []
        };

        columns = [
            columnHelper.accessor((row) => row.details, {
                id: "details",
                cell: (item) => item.getValue(),
                header: () => <span>Details</span>,
            }),
        ]

        this.formRef = React.createRef();

    }

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

        const request: Promise<any> = ['edit', 'delete'].includes(this.props.action) ?
            !this.props?.isAdmin ? symbolService.updateSymbol(data, this.props.data?.id || 0) : this.props.action === 'delete' ? adminService.updateAsset(data, this.props.data?.id || 0) : adminService.approveAsset(this.props.data?.id || 0, this.state.isApproving || false) :
            !this.props?.isAdmin ? symbolService.createSymbol(data) : adminService.createAsset(data);

        await request
            .then(((res: any) => {
                this.props.onCallback(data);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    isShow(): boolean {
        return this.props.action === 'view' || getBuildableFormStatuses().includes((this.state.formInitialValues as ISymbol)?.status.toLowerCase() as FormStatus);
    }

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        const request: Promise<any> = this.props.action == 'view' ?
            adminService.approveAsset(values.id, this.state.isApproving || false) :
            adminService.createAsset(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(true);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => this.setState({loading: false}))
    };

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

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deleteAsset(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
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

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<ISymbol>
                                    initialValues={this.state.formInitialValues as ISymbol}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="bank-form">
                                                {this.props.isAdmin && (
                                                    <>
                                                        {!['add', 'delete'].includes(this.props.action) && (
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

                                                                {getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) ? (
                                                                    <>
                                                                        <div
                                                                            className={`approve-form-text w-100 ${this.props.data?.created_by ? 'pt-1' : ''}`}>
                                                                            <>
                                                                                Status: {this.props.data?.status} by {this.props.data?.deleted_by || this.props.data?.changed_by || this.props.data?.approved_by || ''} at {formatterService.dateTimeFormat(this.props.data?.deleted_date_time || this.props.data?.changed_date_time || this.props.data?.approved_date_time || '')}
                                                                            </>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div
                                                                            className={`approve-form-text w-100 ${this.props.data?.created_by ? 'pt-1' : ''}`}>Status: {this.props.data?.status}</div>
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
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
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
                                                                <div className="input__wrap">
                                                                    <Field
                                                                        name="reason_delete"
                                                                        id="reason_delete"
                                                                        as="textarea"
                                                                        rows="3"
                                                                        className="input__textarea"
                                                                        placeholder="Type delete reason"
                                                                        disabled={isSubmitting}
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
                                                            <div className="input">
                                                                <div className="input__title">Reason for
                                                                    Entry <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="reason_for_entry"
                                                                        id="reason_for_entry"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                        )}
                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Symbol
                                                                Information:</h4>
                                                            {(!values.is_change) && (
                                                                <>
                                                                    <div className="input">
                                                                        <div className="input__title">Security
                                                                            Name <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="security_name"
                                                                                id="security_name"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Security Name"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                            />
                                                                            <ErrorMessage name="security_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                    <div className="input">
                                                                        <div className="input__title">Symbol <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`${getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) ? 'input__btns' : 'input__wrap'}  ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="symbol"
                                                                                id="symbol"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Symbol"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleSymbol(e.target.value, setFieldValue)}
                                                                            />
                                                                            {getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) && (
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

                                                                            <ErrorMessage name="symbol" component="div"
                                                                                          className="error-message"/>
                                                                        </div>
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
                                                                                <div className="input__title">Effective
                                                                                    Date <i>*</i>
                                                                                </div>
                                                                                <div
                                                                                    className={`input__wrap`}>
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
                                                                                <div className="input__title">Effective
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
                                                                                className={`input__wrap`}>
                                                                                <Field
                                                                                    name="new_security_name"
                                                                                    id="new_security_name"
                                                                                    type="text"
                                                                                    className="input__text"
                                                                                    placeholder="Type Security Name"
                                                                                />
                                                                                <ErrorMessage name="new_security_name"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">Symbol <i>*</i>
                                                                            </div>
                                                                            <div
                                                                                className={`input__wrap`}>
                                                                                <Field
                                                                                    name="new_symbol"
                                                                                    id="new_symbol"
                                                                                    type="text"
                                                                                    className="input__text"
                                                                                    placeholder="Type Symbol"
                                                                                    onChange={(e: any) => this.handleNewSymbol(e.target.value, setFieldValue)}
                                                                                />
                                                                                <ErrorMessage name="new_symbol"
                                                                                              component="div"
                                                                                              className="error-message"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="input">
                                                                            <div className="input__title">Change Reason
                                                                            </div>
                                                                            <div className="input__wrap">
                                                                                <Field
                                                                                    name="reason_change"
                                                                                    id="reason_change"
                                                                                    as="textarea"
                                                                                    rows="3"
                                                                                    className="input__textarea"
                                                                                    placeholder="Type change reason"
                                                                                    disabled={isSubmitting}
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
                                                                                        <ErrorMessage name="new_dsin"
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
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="security_name"
                                                                                id="security_name"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Security Name"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleSecurityNameChange(e, setFieldValue)}
                                                                            />
                                                                            <ErrorMessage name="security_name"
                                                                                          component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                    <div className="input">
                                                                        <div className="input__title">Symbol <i>*</i>
                                                                        </div>
                                                                        <div
                                                                            className={`${getApprovedFormStatus().includes(this.props.data?.status.toLowerCase() as FormStatus) ? 'input__btns' : 'input__wrap'}  ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="symbol"
                                                                                id="symbol"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type Symbol"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                                onChange={(e: any) => this.handleSymbol(e.target.value, setFieldValue)}
                                                                            />
                                                                            <ErrorMessage name="symbol" component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            <div className={'input'}>
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
                                                                            <span></span><i> Does it have cusip number?
                                                                        </i>
                                                                        </label>
                                                                        <ErrorMessage name="is_cusip" component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>

                                                                {values.is_cusip && (
                                                                    <div className="input">
                                                                        <div
                                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                            <Field
                                                                                name="cusip"
                                                                                id="cusip"
                                                                                type="text"
                                                                                className="input__text"
                                                                                placeholder="Type CUSIP"
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />
                                                                            <ErrorMessage name="cusip" component="div"
                                                                                          className="error-message"/>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </div>

                                                            <div className="input">
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

                                                            <div className="input">
                                                                <div className="input__title">Fifth Character
                                                                    Identifiers
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fifth_character_identifier"
                                                                        id="fifth_character_identifier"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    >
                                                                        <option value="">Select Fifth Character
                                                                            Identifiers
                                                                        </option>
                                                                        {Object.values(FifthCharacterIdentifier).map((identifier) => (
                                                                            <option key={identifier} value={identifier}>
                                                                                {identifier}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="fifth_character_identifier"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Alternative Asset
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="alternative_asset_category"
                                                                        id="alternative_asset_category"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            {values.alternative_asset_category !== '' && getAlternativeAssetSubCategory(values.alternative_asset_category) && (
                                                                <div className="input">
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="alternative_asset_subcategory"
                                                                            id="alternative_asset_subcategory"
                                                                            as="select"
                                                                            className="b-select"
                                                                            disabled={isSubmitting || this.isShow()}
                                                                        >
                                                                            <option value="">Select category</option>
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
                                                                </div>
                                                            )}

                                                            <div className="input">
                                                                <div className="input__title">Exempted Offerings</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="exempted_offerings"
                                                                        id="exempted_offerings"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Market Sector <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="market_sector"
                                                                        id="market_sector"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    >
                                                                        <option value="">Select Market Sector</option>
                                                                        {Object.values(MarketSector).map((type) => (
                                                                            <option key={type} value={type}>
                                                                                {type}
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <ErrorMessage name="market_sector" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Lot Size
                                                                    ({getLotSize().join(', ')}) <i>*</i>
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="lot_size"
                                                                        id="lot_size"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Lot Size"
                                                                        component={NumericInputField}
                                                                        decimalScale={0}
                                                                        isThousandSeparator={false}
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="lot_size" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Fractional Lot Size</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fractional_lot_size"
                                                                        id="fractional_lot_size"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Fractional Lot Size"
                                                                        component={NumericInputField}
                                                                        decimalScale={6}
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="fractional_lot_size"
                                                                                  component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Minimum Price Variation
                                                                    (MPV)
                                                                    (.01,
                                                                    .05, .10)
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="mvp"
                                                                        id="mvp"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type MPV"
                                                                        component={NumericInputField}
                                                                        decimalScale={4}
                                                                        isThousandSeparator={false}
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="mvp" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Symbol Trading
                                                                Information:</h4>

                                                            <div className="input">
                                                                <div className="input__title">Primary ATS <i>*</i></div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="primary_ats"
                                                                        id="primary_ats"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Primary ATS"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="primary_ats" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

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
                                                                <div className="input__title">Custodian</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="custodian"
                                                                        id="custodian"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Custodian"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="custodian" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                        </div>


                                                        <div className={'input'}>
                                                            <h4 className={'input__group__title'}>Digital Asset:</h4>

                                                            <div className="input">
                                                                <div className="input__title">Digital Asset Category
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="digital_asset_category"
                                                                        id="digital_asset_category"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            {values.digital_asset_category !== '' && getDigitalAssetCategoryInstrument(values.digital_asset_category) && (
                                                                <div className="input">
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="instrument_type"
                                                                            id="instrument_type"
                                                                            as="select"
                                                                            className="b-select"
                                                                            disabled={isSubmitting || this.isShow()}
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
                                                                </div>
                                                            )}


                                                            <div className="input">
                                                                <div className="input__title">Issuer Name</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="issuer_name"
                                                                        id="issuer_name"
                                                                        type="text"
                                                                        className="input__text"
                                                                        placeholder="Type Issuer Name"
                                                                        disabled={isSubmitting || this.isShow()}
                                                                    />
                                                                    <ErrorMessage name="issuer_name" component="div"
                                                                                  className="error-message"/>
                                                                </div>
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Issuer Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="issuer_type"
                                                                        id="issuer_type"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <hr/>

                                                            <div className={'input'}>
                                                                <div className="input__title">Underpinning Asset Value
                                                                </div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="underpinning_asset_value"
                                                                        id="underpinning_asset_value"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            {values.underpinning_asset_value === UnderpinningAssetValue.PEGGED && (

                                                                <div className="input">
                                                                    <div className="input__title">Reference Asset
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="reference_asset"
                                                                            id="reference_asset"
                                                                            type="text"
                                                                            className="input__text"
                                                                            placeholder="Enter the asset Type"
                                                                            disabled={isSubmitting || this.isShow()}
                                                                        />
                                                                        <ErrorMessage name="reference_asset"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <hr/>

                                                            <div className="input">
                                                                <div className="input__title">Rights Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="rights_type"
                                                                        id="rights_type"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <div className="input">
                                                                <div className="input__title">Enforceability</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="enforceability_type"
                                                                        id="enforceability_type"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <hr/>

                                                            <div className="input">
                                                                <div className="input__title">Fungibility Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="fungibility_type"
                                                                        id="fungibility_type"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <div className={'input'}>
                                                                <div className="input__title">Redeemability Type</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="redeemability_type"
                                                                        id="redeemability_type"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            {values.redeemability_type === RedeemabilityType.REDEEMABLE && (

                                                                <div className="input">
                                                                    <div className="input__title">Redemption Asset Type
                                                                    </div>
                                                                    <div
                                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                        <Field
                                                                            name="redemption_asset_type"
                                                                            id="redemption_asset_type"
                                                                            type="text"
                                                                            className="input__text"
                                                                            placeholder="Enter the Redemption asset Type"
                                                                            disabled={isSubmitting || this.isShow()}
                                                                        />
                                                                        <ErrorMessage name="redemption_asset_type"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="input">
                                                                <div className="input__title">Nature of record</div>
                                                                <div
                                                                    className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                                    <Field
                                                                        name="nature_of_record"
                                                                        id="nature_of_record"
                                                                        as="select"
                                                                        className="b-select"
                                                                        disabled={isSubmitting || this.isShow()}
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
                                                            </div>

                                                            <hr/>

                                                            <div className="input">
                                                                <div className="input__title">Edgar CIK
                                                                    <Link className={'link info-panel-title-link'}
                                                                          href={'https://www.sec.gov/edgar/searchedgar/companysearch'}
                                                                          target={'_blank'}>
                                                                        Company Filings <FontAwesomeIcon className="nav-icon"
                                                                                                         icon={faArrowUpRightFromSquare}/>
                                                                    </Link>
                                                                </div>
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

                                                    </>
                                                )}

                                                {this.props.action === 'view' && (
                                                    <>
                                                        <div className={'order-block__item'}>
                                                            <div className={'panel'}>
                                                                <div className={'content__top'}>
                                                                    <div className={'content__title'}>History Log</div>
                                                                </div>
                                                                <div className={'content__bottom'}>
                                                                    {this.state.history.length > 0 ? (
                                                                        <Table columns={columns}
                                                                               data={this.state.history}
                                                                               searchPanel={false}
                                                                               block={this}
                                                                               viewBtn={false}
                                                                               editBtn={false}
                                                                               deleteBtn={false}
                                                                               pageLength={5}
                                                                        />
                                                                    ) : (
                                                                        <>

                                                                            <NoDataBlock
                                                                                primaryText="No history available yet"/>

                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {this.props.action !== 'view' && (
                                                    <button id="add-bank-acc"
                                                            className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
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
                            </>
                        )}


                    </>
                )
            case 'deleteAdmin':
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.data)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }


    }
}

export default MembershipForm;
