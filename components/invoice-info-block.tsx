import React from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import NoDataBlock from "@/components/no-data-block";
import {IInvoice, IInvoiceService} from "@/interfaces/i-invoice";
import filterService from "@/services/filter/filter";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";


interface InvoiceInfoBlockState extends IState {
    errors: string[];
    invoice: IInvoice | null;
    data: Array<IInvoiceService>;
    dataFull: Array<IInvoiceService>;
    filterData: any;
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

    constructor(props: InvoiceInfoBlockProps) {
        super(props);

        isAdmin = props.isAdmin ?? false;

        this.state = {
            success: false,
            errors: [],
            invoice: this.props.data,
            data: [],
            dataFull: [],
            filterData: [],
        }

        columns = [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Service</span>,
            }),
            columnHelper.accessor((row) => row.count, {
                id: "count",
                cell: (item) => formatterService.numberFormat(item.getValue(), 0),
                header: () => <span>Number</span>,
            }),
            columnHelper.accessor((row) => row.value, {
                id: "value",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Amount </span>,
            }),
        ];
    }

    onCallback = async (values: any) => {

    };

    componentDidMount() {
        this.setState({dataFull: this.props.data?.services || [], data: this.props.data?.services || []}, () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    render() {
        return (

            <>
                <div className="content__top">
                    <div
                        className="content__title">Invoice {this.state.invoice?.date}
                    </div>
                    {!isAdmin && (
                        <div className="content__title_btns content__filter download-buttons justify-content-end">

                            <button className="b-btn ripple disable"
                                    disabled={true}
                            >
                                Pay
                            </button>

                        </div>
                    )}
                </div>


                <div className="content__bottom mb-24">
                    <div className={'view_panel mx-0'}>
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
                </div>

                <div className={'content__top'}>
                    <div className={'content__title'}>
                        Payment Info
                    </div>
                </div>

                <div className="content__bottom mb-24">
                    <div className={'view_panel mx-0'}>
                        <div className={'view_block'}>
                            <div className={'view_block_title bold'}>Name</div>
                            <div>-</div>
                        </div>
                    </div>
                </div>

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

        )
    }
}

export default InvoiceInfoBlock
