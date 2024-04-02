import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
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
import feesService from "@/services/fee/reports-service";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

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
    dataFull: IInvoice[];
    filterData: any;
    showSymbolForm: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

class InvoiceBlock extends React.Component<{}> {
    state: InvoiceBlockState;

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
            dataFull: [],
            filterData: [],
            showSymbolForm: true,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }

        columns = [
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
            columnHelper.accessor((row) => row.payment_date, {
                id: "payment_date",
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
            {key: 'date', placeholder: 'Date'},
            {key: 'status_name', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getInvoices();
    }

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    getInvoices = () => {
        feesService.getInvoices()
            .then((res: IInvoice[]) => {
                const data = res || [];
                data.forEach(s => {
                    s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
                });
                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
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

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }


    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }


    onCallback = async (values: any, step: boolean) => {
        this.getInvoices();
        // this.closeModal();
    };

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Invoices</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <Button
                                variant="link"
                                className="d-md-none admin-table-btn ripple"
                                type="button"
                                onClick={() => this.handleShowFilters()}
                            >
                                <FontAwesomeIcon icon={faFilter}/>
                            </Button>
                        </div>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    <div className="content__bottom">
                                        {this.state.data.length ? (
                                            <Table columns={columns}
                                                   data={this.state.data}
                                                   searchPanel={true}
                                                   block={this}
                                                   viewBtn={true}
                                                   editBtn={false}
                                                   filters={tableFilters}
                                                   filtersClassName={this.state.filtersClassName}
                                                   deleteBtn={false}
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
                                    </div>
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
                    />
                </Modal>

            </>
        )
    }
}

export default InvoiceBlock;
