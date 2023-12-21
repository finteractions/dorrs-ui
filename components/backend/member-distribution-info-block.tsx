import React, {RefObject} from 'react';
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import NoDataBlock from "@/components/no-data-block";
import filterService from "@/services/filter/filter";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";


interface MemberDistributionInfoBlockState extends IState {
    errors: string[];
    memberDistribution: IMemberDistribution | null;
    data: Array<any>;
    dataFull: Array<any>;
    filterData: any;
}

interface MemberDistributionInfoBlockProps extends ICallback {
    data: IMemberDistribution | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class MemberDistributionInfoBlock extends React.Component<MemberDistributionInfoBlockProps, MemberDistributionInfoBlockState> {

    state: MemberDistributionInfoBlockState;
    errors: Array<string> = new Array<string>();

    constructor(props: MemberDistributionInfoBlockProps) {
        super(props);

        this.state = {
            success: false,
            errors: [],
            data: [],
            dataFull: [],
            filterData: [],
            memberDistribution: this.props.data
        }

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
    }

    onCallback = async (values: any) => {

    };

    componentDidMount() {
        const data = this.props.data?.payments || [];
        data.forEach(s => {
            s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
            s.customer_type = getCustomerTypeName(s.customer_type as CustomerType)
        });
        this.setState({dataFull: data, data:data}, () => {
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
                        className="content__title">Member Distribution: {this.state.memberDistribution?.date}
                    </div>
                </div>

                <div className={`content__bottom mb-24`}>
                    <div className={'view_panel flex-1 mx-0 row-gap-25'}>
                        <div className={'view_block flex-25'}>
                            <div className={'view_block_title bold'}>Forecast Amount</div>
                            <div>{formatterService.numberFormat(this.state.memberDistribution?.forecast_amount || 0, 2)}</div>
                        </div>
                        <div className={'view_block flex-25'}>
                            <div className={'view_block_title bold'}>Total Amount</div>
                            <div>{formatterService.numberFormat(this.state.memberDistribution?.total_amount || 0, 2)}</div>
                        </div>
                        <div className={'view_block flex-25'}>
                            <div className={'view_block_title bold'}>Approved Amount</div>
                            <div>{formatterService.numberFormat(this.state.memberDistribution?.approved_amount || 0, 2)}</div>
                        </div>
                        <div className={'view_block flex-25'}>
                            <div className={'view_block_title bold'}>Due Amount</div>
                            <div>{formatterService.numberFormat(this.state.memberDistribution?.due_amount || 0, 2)}</div>
                        </div>
                        {/*<div className={'view_block flex-25'}>*/}
                        {/*    <div className={'view_block_title bold'}>Status</div>*/}
                        {/*    <div*/}
                        {/*        className={`table__status table__status-${this.state.memberDistribution?.status}`}>*/}
                        {/*        {`${getInvoiceStatusNames(this.state.memberDistribution?.status as InvoiceStatus)}`}*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>


                <div className={'content__top'}>
                    <div className={'content__title'}>
                        Payments
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

export default MemberDistributionInfoBlock
