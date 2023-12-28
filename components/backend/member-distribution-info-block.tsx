import React, {RefObject} from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import NoDataBlock from "@/components/no-data-block";
import filterService from "@/services/filter/filter";
import {getInvoiceFormStatus, getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import * as Yup from "yup";
import {ErrorMessage, Field, Form, Formik} from "formik";
import NumericInputField from "@/components/numeric-input-field";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IInvoice} from "@/interfaces/i-invoice";


const formSchemaPayment = Yup.object().shape({
    invoice_id: Yup.string(),
    amount: Yup.string().required('Required').label('Amount'),
    status: Yup.string().required('Required').label('Status'),
    private_comment: Yup.string(),
    public_comment: Yup.string()

});

interface MemberDistributionInfoBlockState extends IState {
    errors: string[];
    errorMessages: string[];
    memberDistribution: IMemberDistribution | null;
    data: Array<any>;
    dataFull: Array<any>;
    filterData: any;
    isPayment: boolean;
}

interface MemberDistributionInfoBlockProps extends ICallback {
    data: IMemberDistribution | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class MemberDistributionInfoBlock extends React.Component<MemberDistributionInfoBlockProps, MemberDistributionInfoBlockState> {

    state: MemberDistributionInfoBlockState;
    errors: Array<string> = new Array<string>();
    formRef: RefObject<any>;
    initialValues: {
        invoice_id: string,
        status: string,
        amount: string,
        private_comment: string,
        public_comment: string
    }

    constructor(props: MemberDistributionInfoBlockProps) {
        super(props);

        this.state = {
            success: false,
            errors: [],
            errorMessages: [],
            data: [],
            dataFull: [],
            filterData: [],
            memberDistribution: this.props.data,
            isPayment: false,
        }

        this.formRef = React.createRef();

        columns = [
            columnHelper.accessor((row) => ({
                name: row.user_name,
                email: row.user_id
            }), {
                id: "user",
                cell: (item) => <div>
                    <span>{item.getValue().name}</span><br/>
                    <span className="text-ellipsis">{item.getValue().email}</span>
                </div>,
                header: () => <span>Name <br/>Email</span>,
            }),
            columnHelper.accessor((row) => row.reference_number, {
                id: "reference_number",
                cell: (item) => item.getValue(),
                header: () => <span>Reference Number</span>,
            }),
            columnHelper.accessor((row) => row.firm_name, {
                id: "firm_name",
                cell: (item) => item.getValue(),
                header: () => <span>Firm</span>,
            }),
            columnHelper.accessor((row) => row.amount, {
                id: "amount",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Amount</span>,
            }),
            columnHelper.accessor((row) => ({
                status: row.status,
                statusName: row.status_name
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().statusName}
                        </div>
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        this.initialValues = {
            amount: (this.state.memberDistribution?.due_amount || '').toString(),
            invoice_id: (this.state.memberDistribution?.invoice_id || '').toString(),
            status: InvoiceStatus.PAYMENT_APPROVED,
            private_comment: '',
            public_comment: ''
        }
    }

    onCallback = async (values: any) => {

    };

    componentDidMount() {
        const data = this.props.data?.payments || [];
        data.forEach(s => {
            s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
            s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
        });
        this.setState({dataFull: data, data: data}, () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    paymentForm = () => {
        this.setState({isPayment: !this.state.isPayment});
    }

    handleSubmit = async (values: Record<string, string | number>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true);
        const body = values

        body.amount = body.amount.toString().replace(/,/g, '')

        adminService.createPayment(body)
            .then(() => {
                adminService.getInvoices({invoice_id: this.state.memberDistribution?.invoice_id})
                    .then((res: IInvoice[]) => {
                        const data = res || [];
                        data.forEach(s => {
                            s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                            s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
                        });
                        const invoice = data[0];
                        const memberDistribution = this.state?.memberDistribution;
                        if (memberDistribution) memberDistribution.status = invoice.status
                        if (typeof invoice !== "undefined" && memberDistribution) this.setState({memberDistribution: this.state?.memberDistribution})
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
                                    className={`input__wrap disable`}>
                                    <Field
                                        component={NumericInputField}
                                        decimalScale={2}
                                        name="amount"
                                        id="amount"
                                        className="input__text"
                                        placeholder="Type Amount"
                                        type="text"
                                        disabled={true}
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
                                    className={`input__wrap disable`}>
                                    <Field
                                        name="status"
                                        id="status"
                                        as="select"
                                        className="b-select"
                                        disabled={true}
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
                                className={`w-100 b-btn ripple ${(isSubmitting || !isValid) ? 'disable' : ''}`}
                                type="submit" disabled={isSubmitting || !isValid}>
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


    render() {
        return (

            <>
                <div className="content__top">
                    <div
                        className="content__title">{this.state.memberDistribution?.firm_name}: {this.state.memberDistribution?.date_formatted}
                    </div>
                    <div className="content__title_btns content__filter download-buttons justify-content-end">
                        {(this.state.memberDistribution?.status === InvoiceStatus.PAYMENT_DUE) && (
                            <button className="b-btn ripple"
                                    onClick={this.paymentForm}
                            >
                                {this.state.isPayment ? 'Cancel Payment' : 'Add Payment'}
                            </button>
                        )}
                    </div>
                </div>

                <div className={`content__bottom mb-24`}>
                    <div className={'view_panel flex-1 mx-0 row-gap-25'}>
                        <div className={'view_block'}>
                            <div className={'view_block_title bold'}>Due Amount</div>
                            <div>{formatterService.numberFormat(this.state.memberDistribution?.due_amount || 0, 2)}</div>
                        </div>
                        <div className={'view_block'}>
                            <div className={'view_block_title bold'}>Status</div>
                            <div
                                className={`table__status table__status-${this.state.memberDistribution?.status}`}>
                                {`${getInvoiceStatusNames(this.state.memberDistribution?.status as InvoiceStatus)}`}
                            </div>
                        </div>
                    </div>
                </div>

                {this.state.isPayment ? (
                    <>
                        {this.getPaymentForm()}
                    </>
                ) : (
                    <>
                        <div className={'content__top d-none'}>
                            <div className={'content__title'}>
                                Payment Contents
                            </div>
                        </div>

                        <div className="content__bottom d-none">
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
        )
    }
}

export default MemberDistributionInfoBlock
