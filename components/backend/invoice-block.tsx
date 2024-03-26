import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "@/components/modal";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {IInvoice} from "@/interfaces/i-invoice";
import formatterService from "@/services/formatter/formatter-service";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import InvoiceInfoBlock from "@/components/invoice-info-block";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface InvoiceBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IInvoice | null;
    formAction: string;
    data: IInvoice[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class InvoiceBlock extends React.Component<{}> {
    state: InvoiceBlockState;
    getAssetsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
        }

        columns = [
            columnHelper.accessor((row) => row.invoice_id, {
                id: "invoice_id",
                cell: (item) => item.getValue(),
                header: () => <span>Invoice ID</span>,
            }),
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

            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.total_value, {
                id: "total_value",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Total Amount</span>,
            }),
            columnHelper.accessor((row) => row.approved_date_time, {
                id: "approved_date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Payment Date</span>,
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

        tableFilters = [
            {key: 'invoice_id', placeholder: 'Invoice ID'},
            {key: 'user_name', placeholder: 'Name'},
            {key: 'user_id', placeholder: 'Email'},
            {key: 'reference_number', placeholder: 'Reference Number'},
            {key: 'firm_name', placeholder: 'Firm'},
            {key: 'customer_type', placeholder: 'Customer'},
            {key: 'date', placeholder: 'Date'},
            {key: 'status_name', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getInvoices();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getInvoices = () => {
        adminService.getInvoices()
            .then((res: IInvoice[]) => {
                const data = res || [];
                data.forEach(s => {
                    s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
                    s.invoice_id = s.invoice_id.toString()
                });
                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getInvoices, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
    }

    openModal = (mode: string, data?: IInvoice) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this View Invoice?';
        } else if (mode === 'view') {
            return 'View Invoice'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} View Invoice`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getInvoices();
    }

    onCallback = async (values: any, step: boolean) => {
        this.getInvoices();
    };

    render() {
        return (

            <>
                <div className="assets section page__section">
                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={false}
                                               deleteBtn={false}
                                               filters={tableFilters}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No invoices available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={this.modalTitle(this.state.formAction)}
                       className={'big_modal'}
                >

                    <InvoiceInfoBlock
                        data={this.state.formData}
                        onCallback={this.onCallback}
                        isAdmin={true}
                    />
                </Modal>

            </>
        )
    }
}

export default InvoiceBlock;
