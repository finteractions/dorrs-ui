import React, {RefObject} from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import NoDataBlock from "@/components/no-data-block";
import {IInvoice, IInvoiceService} from "@/interfaces/i-invoice";
import filterService from "@/services/filter/filter";
import {
    getApprovedInvoiceStatus,
    getInvoiceFormStatus,
    getInvoiceStatusNames,
    InvoiceStatus
} from "@/enums/invoice-status";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import NumericInputField from "@/components/numeric-input-field";
import adminService from "@/services/admin/admin-service";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";
import AlertBlock from "@/components/alert-block";
import bankService from "@/services/bank/bbo-service";
import {IBank} from "@/interfaces/i-bank";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";


const formSchemaPayment = Yup.object().shape({
    invoice_id: Yup.string(),
    amount: Yup.string().required('Required').label('Amount'),
    status: Yup.string().required('Required').label('Status'),
    private_comment: Yup.string(),
    public_comment: Yup.string()

});

const formSchemaConfirm = Yup.object().shape({
    isConfirmed: Yup.boolean().label('Confirm'),
});

interface InvoiceInfoBlockState extends IState {
    errors: string[];
    errorMessages: string[];
    invoice: IInvoice | null;
    data: Array<IInvoiceService>;
    dataFull: Array<IInvoiceService>;
    filterData: any;
    isPayment: boolean;
    isBank: boolean;
    bank: {
        columnDefinition: any,
        columnValues: any
    },
    formConfirmInitialValues: {
        isConfirmed: boolean
    },
}

interface InvoiceInfoBlockProps extends ICallback {
    isAdmin?: boolean;
    data: IInvoice | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

let isAdmin = false;

class InvoiceInfoBlock extends React.Component<InvoiceInfoBlockProps, InvoiceInfoBlockState> {

    state: InvoiceInfoBlockState;
    errors: Array<string> = new Array<string>();
    errorMessages: Array<string> = new Array<string>();
    formRef: RefObject<any>;
    initialValues: {
        invoice_id: string,
        status: string,
        amount: string,
        private_comment: string,
        public_comment: string
    }

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: InvoiceInfoBlockProps, context: IDataContext<null>) {
        super(props);

        this.context = context;

        isAdmin = props.isAdmin ?? false;

        this.state = {
            success: false,
            errors: [],
            errorMessages: [],
            invoice: this.props.data,
            data: [],
            dataFull: [],
            filterData: [],
            isPayment: false,
            isBank: false,
            bank: {
                columnDefinition: {},
                columnValues: {}
            },
            formConfirmInitialValues: {
                isConfirmed: false
            }
        }

        this.formRef = React.createRef();

        columns = [
            columnHelper.accessor((row) => ({
                name: row.name,
                customer_type: row.customer_type,
                customer_type_name: row.customer_type_name,
            }),{
                id: "name",
                cell: (item) => <>{item.getValue().name} | {item.getValue().customer_type_name}</>,
                header: () => <span>Source</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Action Date</span>,
            }),
            columnHelper.accessor((row) => row.accrual_value, {
                id: "accrual_value",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Accrual </span>,
            }),
            columnHelper.accessor((row) => row.number, {
                id: "number",
                cell: (item) => item.getValue(),
                header: () => <span>Number</span>,
            }),
            columnHelper.accessor((row) => row.value, {
                id: "value",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Amount </span>,
            }),
        ];

        this.initialValues = {
            amount: '',
            invoice_id: (this.state.invoice?.id || '').toString(),
            status: this.state.invoice?.status || InvoiceStatus.PAYMENT_DUE,
            private_comment: '',
            public_comment: ''
        }
    }

    onCallback = async (values: any) => {

    };

    componentDidMount() {
        this.setState({dataFull: this.props.data?.services || [], data: this.props.data?.services || []}, () => {
            this.filterData();
        });

        if (!isAdmin) this.getBank();
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    handleSubmit = async (values: Record<string, string | number>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true);
        const body = values

        body.amount = body.amount.toString().replace(/,/g, '')

        adminService.createPayment(body)
            .then(() => {
                adminService.getInvoices({invoice_id: this.state.invoice?.id})
                    .then((res: IInvoice[]) => {
                        const data = res || [];
                        data.forEach(s => {
                            s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                            s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
                        });
                        const invoice = data[0];
                        if (typeof invoice !== "undefined") this.setState({invoice: invoice})
                        this.paymentForm();
                    })
                    .catch((errors: IError) => {
                        this.setState({errorMessages: errors.messages});
                    })
                    .finally(() => {

                    });
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.props.onCallback(null);
            })
    };

    handleConfirm = async (values: Record<string, boolean>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {

    }

    getPaymentForm() {
        return (
            <Formik
                initialValues={this.initialValues}
                validationSchema={formSchemaPayment}
                innerRef={this.formRef}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, setFieldValue, isValid, dirty, values, errors, validateField}) => {
                    return (
                        <Form id="bank-form">
                            <Field
                                name="invoice_id"
                                id="invoice_id"
                                type="hidden"
                                disabled={isSubmitting}
                            />

                            <div className="input">
                                <div className="input__title">Amount <i>*</i></div>
                                <div
                                    className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                    <Field
                                        component={NumericInputField}
                                        decimalScale={2}
                                        name="amount"
                                        id="amount"
                                        className="input__text"
                                        placeholder="Type Amount"
                                        type="text"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="input">
                                <div className="input__title">Private Comment</div>
                                <div
                                    className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                    <Field
                                        as="textarea"
                                        id="private_comment"
                                        name="private_comment"
                                        placeholder="Type Private Comment"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="input">
                                <div className="input__title">Public Comment</div>
                                <div
                                    className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                    <Field
                                        as="textarea"
                                        id="public_comment"
                                        name="public_comment"
                                        placeholder="Type Public Comment"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="input">
                                <div className="input__title">Status <i>*</i></div>
                                <div
                                    className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                    <Field
                                        name="status"
                                        id="status"
                                        as="select"
                                        className="b-select"
                                        disabled={isSubmitting}
                                    >
                                        {getInvoiceFormStatus().map((item) => (
                                            <option key={item} value={item}>
                                                {getInvoiceStatusNames(item)}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="status" component="div"
                                                  className="error-message"/>
                                </div>
                            </div>

                            <button
                                className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                Save
                            </button>

                            {this.state.errorMessages && (
                                <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                            )}
                        </Form>)
                }}
            </Formik>
        )
    }

    paymentForm = () => {
        this.setState({isPayment: !this.state.isPayment});
    }

    paymentInfo = () => {
        this.setState({isBank: !this.state.isBank});
    }

    getBank = () => {
        bankService.getBank()
            .then((res: Array<IBank>) => {
                const bank = res[0];
                const columns = bank.columns;
                let values = bank.values;

                const columnsObject = JSON.parse(columns)
                values = values.replace(/'/g, '"');
                const valuesObject = JSON.parse(values)

                this.setState({
                    bank: {
                        columnDefinition: columnsObject,
                        columnValues: valuesObject
                    }
                })
            })
    }


    render() {

        const count = Object.keys(this.state.bank.columnDefinition).reduce((count, columnName) => {
            const values = this.state.bank.columnValues[columnName];
            if (typeof values === "object") {
                const nonEmptyValues = Object.values(values)
                    .filter(value => value !== null && value !== undefined && value !== '');
                return count + (nonEmptyValues.length);
            } else if (values !== null && values !== undefined && values !== '') {
                return count + 1;
            }

            return count;
        }, 0);

        return (

            <>
                {isAdmin && (getApprovedInvoiceStatus().includes(this.state.invoice?.status.toLowerCase() as InvoiceStatus)) && (
                    <div className={'approve-form'}>
                        <div className='approve-form-text'>
                            <>
                                Status: {getInvoiceStatusNames(this.state.invoice?.status as InvoiceStatus)} by {this.state.invoice?.approved_by} at {formatterService.dateTimeFormat(this.state.invoice?.approved_date_time || '')}
                            </>
                        </div>
                    </div>
                )}
                <div className="content__top">
                    <div
                        className="content__title">Invoice: {this.state.invoice?.date}
                    </div>
                    {!isAdmin && this.state.invoice?.status.toLowerCase() === InvoiceStatus.PAYMENT_DUE ? (
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            {!this.state.isBank && (
                                <button className="b-btn ripple"
                                        onClick={this.paymentInfo}
                                >
                                    Pay
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            {(this.state.invoice?.status === InvoiceStatus.PAYMENT_DUE) && (
                                <button className="b-btn ripple"
                                        onClick={this.paymentForm}
                                >
                                    {this.state.isPayment ? 'Cancel Payment' : 'Add Payment'}
                                </button>
                            )}
                        </div>
                    )}
                </div>


                <div className={`content__bottom mb-24 ${!isAdmin ? 'd-flex' : ''}`}>
                    <div className={'view_panel flex-1 mx-0'}>
                        <div className={'view_block'}>
                            <div className={'view_block_title bold'}>Total Amount</div>
                            <div>{formatterService.numberFormat(this.state.invoice?.total_value || 0)}</div>
                        </div>
                        <div className={'view_block'}>
                            <div className={'view_block_title bold'}>Status</div>
                            <div
                                className={`table__status table__status-${this.state.invoice?.status}`}>
                                {`${getInvoiceStatusNames(this.state.invoice?.status as InvoiceStatus)}`}
                            </div>
                        </div>
                    </div>
                    {this.state.isBank && (
                        <div className={'view_panel flex-1 mx-0'}>
                            <div className={'w-100 my-0 '}>Make a wire to the next Bank Information</div>
                            <>

                                {count >= 3 ? (
                                    <>
                                        {Object.keys(this.state.bank.columnDefinition).map((columnName) => {
                                            const values = this.state.bank.columnValues[columnName];

                                            if (typeof values === "object") {
                                                const nonEmptyValues = Object.values(values)
                                                    .filter(value => value !== null && value !== undefined && value !== '');


                                                return (
                                                    <div className={'view_block'} key={columnName}>
                                                        <div className={'view_block_title bold'}>
                                                            {this.state.bank.columnDefinition[columnName].title}
                                                        </div>
                                                        <div className={''}>
                                                            {nonEmptyValues.join(', ') || '-'}
                                                        </div>
                                                    </div>
                                                );

                                            } else if (values !== null && values !== undefined && values !== '') {
                                                return (
                                                    <div className={'view_block'} key={columnName}>
                                                        <div className={'view_block_title bold'}>
                                                            {this.state.bank.columnDefinition[columnName].title}
                                                        </div>
                                                        <div className={''}>
                                                            {values || '-'}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}</>
                                ) : (
                                    <NoDataBlock
                                        primaryText={' '}
                                        secondaryText={'The payment information is not available now. Please contact the administrator.'}
                                    />
                                )}
                            </>
                            <div className={'w-100 my-0 '}>Be sure you set
                                “Description {this.context.userProfile.reference_number}. We will be
                                able to figure out whose the payment if there is no the number”
                            </div>
                            <div className={'w-100 my-0 '}>
                                <Formik
                                    initialValues={this.state.formConfirmInitialValues}
                                    validationSchema={formSchemaConfirm}
                                    onSubmit={this.handleConfirm}
                                >
                                    {({
                                          isSubmitting,
                                          setFieldValue,

                                      }) => {
                                        return (
                                            <Form className={``}>
                                                <div className="input">
                                                    <div
                                                        className={`b-checkbox${isSubmitting ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="isConfirmed"
                                                            id="isConfirmed"
                                                            disabled={isSubmitting}
                                                            onClick={(e: any) => {
                                                                const confirm = e.target.value === 'false';
                                                                setFieldValue("isConfirmed", confirm);

                                                                if (confirm) this.paymentInfo();
                                                            }}
                                                        />
                                                        <label htmlFor="isConfirmed">
                                                            <span>

                                                            </span>
                                                            <i className={'label-normal'}> Confirm </i>
                                                        </label>
                                                        <ErrorMessage name="isConfirmed" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>
                        </div>
                    )}
                </div>

                {this.state.isPayment ? (
                    <>
                        {this.getPaymentForm()}
                    </>
                ) : (
                    <>
                        {!this.state.isBank && (
                            <>
                                <div className={'content__top'}>
                                    <div className={'content__title'}>
                                        Payment Contents
                                    </div>
                                </div>

                                <div className="content__bottom">
                                    <div className="input">
                                        <div
                                            className={`input__wrap`}>
                                            {this.state.data.length ? (
                                                <Table columns={columns}
                                                       data={this.state.data}
                                                       searchPanel={false}
                                                       block={this}
                                                       editBtn={false}
                                                       viewBtn={false}
                                                       deleteBtn={false}
                                                />
                                            ) : (
                                                <NoDataBlock/>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </>
                )}
            </>

        )
    }
}

export default InvoiceInfoBlock
