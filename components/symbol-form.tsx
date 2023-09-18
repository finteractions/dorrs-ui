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
import {SecurityType} from "@/enums/security-type";
import {SecurityType2} from "@/enums/security-type-2";

const formSchema = Yup.object().shape({
    reason_for_entry: Yup.string().required('Required').label('Reason for Entry'),
    symbol: Yup.string().min(3).max(50).required('Required').label('Symbol'),
    cusip: Yup.string().min(9).max(9).required('Required').label('CUSIP'),
    dsin: Yup.string().min(12).max(12).required('Required').label('DSIN'),
    primary_ats: Yup.string().min(3).max(50).required('Required').label('Primary ATS'),
    transfer_agent: Yup.string().min(3).max(50).label('Transfer Agent'),
    custodian: Yup.string().min(3).max(50).label('Custodian'),
    market_sector: Yup.string().min(3).max(50).required('Required').label('Market Sector'),
    fractional_lot_size: Yup.number()
        .typeError('Invalid Fractional Lot Size')
        .test('is-fractional', 'Must be a fractional number like 0.1, 0.001, 0.0001, etc.', function (value) {
            if (value === null || value === undefined) {
                return true;
            }
            const valueAsString = value.toString();
            return /^0\.0*1$/.test(valueAsString);
        })
        .label('Fractional Lot Size'),
    mvp: Yup.number()
        .typeError('Invalid MVP')
        .test('is-fractional', 'Must be a fractional number', function (value) {
            if (value === null || value === undefined) {
                return true;
            }
            return Number.isFinite(value) && value % 1 !== 0;
        })
        .label('MVP'),
    security_name: Yup.string().min(3).max(50).required('Required').label('Security Name'),
    security_type: Yup.string().required('Required').label('Security Type'),
    security_type_2: Yup.string().label('Security Type 2'),
    blockchain: Yup.string().min(3).max(50).label('Blockchain'),
    smart_contract_type: Yup.string().min(3).max(50).label('Smart Contract type'),

});

interface SymbolFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
}

interface SymbolFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISymbol | null;
    onCancel?: () => void;
}

class MembershipForm extends React.Component<SymbolFormProps, SymbolFormState> {

    state: SymbolFormState;

    constructor(props: SymbolFormProps) {
        super(props);
        console.log(props)
        const initialData = this.props.data || {} as ISymbol;

        const initialValues: {
            reason_for_entry: string;
            symbol: string;
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
            security_type: string;
            security_type_2: string;
            blockchain: string;
            smart_contract_type: string;
        } = {
            reason_for_entry: initialData?.reason_for_entry || 'New Ticker Symbol',
            symbol: initialData?.symbol || '',
            cusip: initialData?.cusip || '',
            dsin: initialData?.dsin || '',
            primary_ats: initialData?.primary_ats || '',
            transfer_agent: initialData?.transfer_agent || '',
            custodian: initialData?.custodian || '',
            market_sector: initialData?.market_sector || '',
            lot_size: (initialData?.lot_size || '').toString(),
            fractional_lot_size: (initialData?.fractional_lot_size || '').toString(),
            mvp: (initialData?.mvp || '').toString(),
            security_name: initialData?.security_name || '',
            security_type: initialData?.security_type || '',
            security_type_2: initialData?.security_type_2 || '',
            blockchain: initialData?.blockchain || '',
            smart_contract_type: initialData?.smart_contract_type || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isApproving: null,
            isConfirmedApproving: false,
            isDeleting: false,
        };

    }

    handleSubmit = async (values: ISymbol, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const request: Promise<any> = this.props.action == 'edit' ?
            !this.props?.isAdmin ? symbolService.updateSymbol(values, this.props.data?.id || 0) : adminService.approveAsset(values.id, this.state.isApproving || false) :
            !this.props?.isAdmin ? symbolService.createSymbol(values) : adminService.createAsset(values);

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

    handleApprove = async (values: any) => {
        this.setState({loading: true});
        console.log(this.props.action)
        const request: Promise<any> = this.props.action == 'view' ?
            adminService.updateAsset(values.id, this.state.isApproving || false) :
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
                                <Formik<ISymbol>
                                    initialValues={this.state.formInitialValues as ISymbol}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="bank-form">
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
                                                    <div className="input__title">Reason for Entry <i>*</i></div>
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
                                                            <option value="New Ticker Symbol">New Ticker Symbol</option>
                                                            <option disabled={true} value="New Ticker Symbol">New Security Name</option>
                                                            <option disabled={true} value="New Ticker Symbol">Deleted Date</option>
                                                            <option disabled={true} value="New Ticker Symbol">Effective Date of Change</option>
                                                            <option disabled={true} value="New Ticker Symbol">Reason for the Change</option>
                                                        </Field>
                                                        <ErrorMessage name="reason_for_entry" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Symbol <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="symbol"
                                                            id="symbol"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Symbol"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="symbol" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">External Security Identifier Number –
                                                        CUSIP <i>*</i>
                                                    </div>
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

                                                <div className="input">
                                                    <div className="input__title">Digital Security Identifier Number -
                                                        DSIN <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="dsin"
                                                            id="dsin"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type CUSIP"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="dsin" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

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
                                                        <ErrorMessage name="primary_ats" component="div"
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

                                                <div className="input">
                                                    <div className="input__title">Market Sector (stock, corporate bond,
                                                        GOVT,
                                                        etc.) <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="market_sector"
                                                            id="market_sector"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Market Sector"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="market_sector" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Lot Size <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="lot_size"
                                                            id="lot_size"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Lot Size"
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
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="fractional_lot_size" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Minimum Price Variation (MPV)</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="mvp"
                                                            id="mvp"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type MVP"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="mvp" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Security Name <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="security_name"
                                                            id="security_name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Security Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="security_name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Security Type <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="security_type"
                                                            id="security_type"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select Security Type</option>
                                                            {Object.values(SecurityType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="security_type" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Security Type 2</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="security_type_2"
                                                            id="security_type_2"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select Security Type</option>
                                                            {Object.values(SecurityType2).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="security_type_2" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Blockchain</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="blockchain"
                                                            id="blockchain"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Security Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="blockchain" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Smart Contract type</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="smart_contract_type"
                                                            id="smart_contract_type"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Smart Contract type"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="smart_contract_type" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                {this.props.action !== 'view' && (
                                                    <button id="add-bank-acc"
                                                            className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save Symbol
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
            case 'delete':
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
