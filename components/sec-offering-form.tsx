import React from 'react';
import {ErrorMessage, Field, FieldProps, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import {FormStatus} from "@/enums/form-status";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {ISymbol} from "@/interfaces/i-symbol";
import formService from "@/services/form/form-service";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import NumericInputField from "@/components/numeric-input-field";
import InputMask from "react-input-mask";
import {getYesNoTypeName, YesNoType} from "@/enums/yes-no-type";
import {UsaStates} from "usa-states";
import {RegType} from "@/enums/reg-type";
import Select from "react-select";
import {FederalExemptionType} from "@/enums/federal-exemption-type";
import {SingleDatePicker} from "react-dates";
import moment from "moment/moment";
import formValidator from "@/services/form-validator/form-validator";

const formSchema = Yup.object().shape({
    type: Yup.string().required('Required').label('Type'),
    investment_fund_type: Yup.string().required('Required').label('Investment Fund Type'),
    edgar_link_to_filling: Yup.string().url('Invalid URL').label('Edgars Link to filing'),
});

interface SECOfferingFormState extends IState {
    formInitialValues: {},
    isConfirmedApproving: boolean;
    isApproving: boolean | null;
    loading: boolean;
    isDeleting: boolean;
    focusedDate: any;

    usaStates: {
        abbreviation: string;
        name: string;
    }[],
}

interface SECOfferingFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: ISECOffering | null;
    symbolData: ISymbol | null;
    onCancel?: () => void;
}

class SECOfferingForm extends React.Component<SECOfferingFormProps, SECOfferingFormState> {

    state: SECOfferingFormState;
    host = `${window.location.protocol}//${window.location.host}`;

    constructor(props: SECOfferingFormProps) {
        super(props);

        const initialData = this.props.data || {} as ISECOffering;

        if (typeof initialData?.federal_exemptions === 'string') {
            try {
                const company_officers_and_contacts = JSON.parse(initialData.federal_exemptions);
                initialData.federal_exemptions = company_officers_and_contacts;
            } catch (error) {
                initialData.federal_exemptions = [""];
            }
        }

        const initialValues: {
            symbol: string
            type: string;
            accession_number: string;
            investment_fund_type: string;
            is_1940_act: string;
            federal_exemptions: string[] | string;
            sale_date: string;
            is_pool_investment: string;
            minimum_investment_accepted: string;
            total_offering_amount: string;
            total_amount_sold: string;
            total_remaining: string;
            is_accredited: string;
            total_number_already_invested: string;
            edgar_link_to_filling: string;
        } = {
            symbol: this.props.symbolData?.symbol || '',
            type: initialData?.type || '',
            accession_number: initialData?.accession_number || '',
            investment_fund_type: initialData?.investment_fund_type || '',
            is_1940_act: initialData?.is_1940_act || '',
            federal_exemptions: initialData?.federal_exemptions || [],
            sale_date: initialData?.sale_date || '',
            is_pool_investment: initialData?.is_pool_investment || '',
            minimum_investment_accepted: initialData?.minimum_investment_accepted || '',
            total_offering_amount: initialData?.total_offering_amount || '',
            total_amount_sold: initialData?.total_amount_sold || '',
            total_remaining: initialData?.total_remaining || '',
            is_accredited: initialData?.is_accredited || '',
            total_number_already_invested: initialData?.total_number_already_invested || '',
            edgar_link_to_filling: initialData?.edgar_link_to_filling || '',
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
            focusedDate: null,
            usaStates: usaStatesList,
        };

    }

    handleSubmit = async (values: ISECOffering, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null})
        const data = {...values};

        data.federal_exemptions = JSON.stringify(values.federal_exemptions);
        data.minimum_investment_accepted = data.minimum_investment_accepted.replace(/,/g, '');
        data.total_offering_amount = data.total_offering_amount.replace(/,/g, '');
        data.total_amount_sold = data.total_amount_sold.replace(/,/g, '');
        data.total_remaining = data.total_remaining.replace(/,/g, '');
        data.total_number_already_invested = data.total_number_already_invested.replace(/,/g, '');

        const request: Promise<any> = this.props.action == 'edit' ?
            formService.updateSECOffering(data, this.props.data?.id || 0) :
            formService.createSECOffering(data)

        await request
            .then(((res: any) => {
                this.props.onCallback('secOffering');
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

    handleDelete = async (values: IFINRACatRegA, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});
        await formService.deleteSECOffering(this.props.data?.id || 0)
            .then(((res: any) => {
                this.props.onCallback('secOffering');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    cancel = () => {
        this.props.onCallback('secOffering');
    }

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
                                <Formik<ISECOffering>
                                    initialValues={this.state.formInitialValues as ISECOffering}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        formValidator.requiredFields(formSchema, values, errors);
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

                                                <div className="input">
                                                    <div className="input__title">REG D or REG A<i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="type"
                                                            id="type"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select</option>
                                                            {Object.values(RegType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="type"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Accession Number <i>*</i>
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="accession_number"
                                                            id="accession_number"
                                                            render={({field}: FieldProps<any>) => (
                                                                <InputMask
                                                                    {...field}
                                                                    mask="9999999999-99-999999"
                                                                    placeholder="Type Accession Number"
                                                                    className="input__text"
                                                                    disabled={isSubmitting || this.isShow()}
                                                                />
                                                            )}
                                                        />
                                                        <ErrorMessage name="accession_number" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">Investment Fund Type <i>*</i></div>
                                                    <div className="input__wrap">
                                                        <Field
                                                            name="investment_fund_type"
                                                            id="investment_fund_type"
                                                            type="text"
                                                            placeholder={'Type Investment Fund Type'}
                                                            className="input__text"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="investment_fund_type" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Investment 1940</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="is_1940_act"
                                                            id="is_1940_act"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select</option>
                                                            {Object.values(YesNoType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {getYesNoTypeName(type)}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="is_1940_act"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Federal Exemptions</div>
                                                    <div className={`input__wrap ${isSubmitting || this.isShow() ? 'disable' : ''}`}>
                                                        <Field
                                                            name="federal_exemptions"
                                                            id="federal_exemptions"
                                                            as={Select}
                                                            className={`b-select-search`}
                                                            placeholder="Select Federal Exemption"
                                                            classNamePrefix="select__react"
                                                            isMulti={true}
                                                            isDisabled={isSubmitting || this.isShow()}
                                                            options={Object.values(FederalExemptionType).map((type) => ({
                                                                value: type,
                                                                label: type
                                                            }))}
                                                            onChange={(selectedOptions: any) => {
                                                                const selectedValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                                                                setFieldValue('federal_exemptions', selectedValues);
                                                            }}
                                                            value={(values.federal_exemptions as Array<string>).map((value) => ({
                                                                value,
                                                                label: value
                                                            })) || []}
                                                        />

                                                        <ErrorMessage name="federal_exemptions" component="div" className="error-message" />
                                                    </div>

                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Sale Date</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>

                                                        <SingleDatePicker
                                                            numberOfMonths={1}
                                                            renderMonthElement={formatterService.renderMonthElement}
                                                            date={values.sale_date ? moment(values.sale_date) : null}
                                                            onDateChange={date => setFieldValue('sale_date', date?.format('YYYY-MM-DD').toString())}
                                                            focused={this.state.focusedDate}
                                                            onFocusChange={({focused}) => this.setState({focusedDate: focused})}
                                                            id="sale_date"
                                                            displayFormat="YYYY-MM-DD"
                                                            isOutsideRange={() => false}
                                                            disabled={isSubmitting || this.isShow()}
                                                            readOnly={true}
                                                            placeholder={'Select Bid Date'}
                                                        />
                                                        <ErrorMessage name="sale_date" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Investment Pool</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="is_pool_investment"
                                                            id="is_pool_investment"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select</option>
                                                            {Object.values(YesNoType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {getYesNoTypeName(type)}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="is_pool_investment"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Minimum Investment Accepted</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="minimum_investment_accepted"
                                                            id="minimum_investment_accepted"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Minimum Investment Accepted"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                        />
                                                        <ErrorMessage name="minimum_investment_accepted" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Total Offering Amount</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="total_offering_amount"
                                                            id="total_offering_amount"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Total Offering Amount"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                        />
                                                        <ErrorMessage name="total_offering_amount" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Total Amount Sold</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="total_amount_sold"
                                                            id="total_amount_sold"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Total Amount Sold"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                        />
                                                        <ErrorMessage name="total_amount_sold" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Total Remaining</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="total_remaining"
                                                            id="total_remaining"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Total Remaining"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                        />
                                                        <ErrorMessage name="total_remaining" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Accredited</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="is_accredited"
                                                            id="is_accredited"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option value="">Select</option>
                                                            {Object.values(YesNoType).map((type) => (
                                                                <option key={type} value={type}>
                                                                    {getYesNoTypeName(type)}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="is_accredited"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Total Number Already Invested</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="total_number_already_invested"
                                                            id="total_number_already_invested"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Total Number Already Invested"
                                                            disabled={isSubmitting || this.isShow()}
                                                            component={NumericInputField}
                                                            decimalScale={0}
                                                        />
                                                        <ErrorMessage name="total_number_already_invested"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Edgars Link to filing</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="edgar_link_to_filling"
                                                            id="edgar_link_to_filling"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Edgars Link to filing"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="edgar_link_to_filling" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                {this.props.action !== 'view' && (
                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save
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
            case 'delete':
                return (
                    <>
                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (

                            <>
                                <Formik<IFINRACatRegA>
                                    initialValues={this.state.formInitialValues as IFINRACatRegA}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleDelete}
                                >
                                    {({
                                          isSubmitting
                                      }) => {
                                        return (
                                            <Form className={``}>
                                                <div className={'profile__right-wrap-full'}>
                                                    <div className={'mt-2'}>
                                                        <div className={'profile__panel'}>
                                                            <div className={'profile__info__panel'}>
                                                                <div className={'input__box buttons'}>
                                                                    <div className="input__box buttons">
                                                                        <button
                                                                            className={`b-btn ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                            type="submit"
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            Submit
                                                                        </button>
                                                                        <button type={"button"}
                                                                                className={`b-btn-border ripple ${(isSubmitting) ? 'disable' : ''}`}
                                                                                disabled={isSubmitting}
                                                                                onClick={this.cancel}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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
}

export default SECOfferingForm;
