import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import formatterService from "@/services/formatter/formatter-service";
import Link from "next/link";
import {ICustody} from "@/interfaces/i-custody";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface AssetTransactionsBlockState {
    loading: boolean;
    data: ICustody[];
    errors: string[];

}

interface AssetTransactionsBlockProps {
    label: string
}

class AssetTransactionsBlock extends React.Component<AssetTransactionsBlockProps> {
    state: AssetTransactionsBlockState;

    constructor(props: AssetTransactionsBlockProps) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            errors: [],
        }

        columns = [

            columnHelper.accessor((row) => row.user_id, {
                id: "user_id",
                cell: (item) => item.getValue(),
                header: () => <span>User</span>,
            }),
            columnHelper.accessor((row) => row.type, {
                id: "type",
                cell: (item) => item.getValue(),
                header: () => <span>Type</span>,
            }),
            columnHelper.accessor((row) => ({
                type: row.type,
                base_price: row.base_price,
                base_currency: row.base_currency,
                quote_price: row.quote_price,
                quote_currency: row.quote_currency
            }), {
                id: "base_price",
                cell: (item) =>
                    item.getValue().type.toLowerCase() == 'exchange' ? (
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency} -&gt; {formatterService.numberFormat(item.getValue().quote_price)} {item.getValue().quote_currency}</span>
                    ) : (
                        <span>{formatterService.numberFormat(item.getValue().base_price)} {item.getValue().base_currency}</span>
                    ),
                header: () => <span>Amount</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>,
                header: () => <span>Status</span>,
            }),
            // columnHelper.accessor((row) => row.from_address, {
            //     id: "from_address",
            //     cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
            //     header: () => <span>From Address</span>,
            // }),
            // columnHelper.accessor((row) => row.to_address, {
            //     id: "to_address",
            //     cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
            //     header: () => <span>To Address</span>,
            // }),
            // columnHelper.accessor((row) => row.transaction_hash, {
            //     id: "transaction_hash",
            //     cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
            //     header: () => <span>Transaction Hash</span>,
            // }),
            // columnHelper.accessor((row) => row.approved_by, {
            //     id: "approved_by",
            //     cell: (item) => item.getValue(),
            //     header: () => <span>Approved By</span>,
            // }),
            // columnHelper.accessor((row) => row.approved_date_time, {
            //     id: "approved_date_time",
            //     cell: (item) => formatterService.dateTimeFormat(item.getValue()),
            //     header: () => <span>Approved Date</span>,
            // }),
            columnHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getCustodians();
    }

    getCustodians = () => {
        adminService.getCustodians()
            .then((res: ICustody[]) => {
                const data = res.filter(item => item.quote_currency === this.props.label || item.base_currency === this.props.label).sort((a, b) => b.id - a.id);
                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    render() {
        return (

            <>
                <div className="info-panel-section transactions">
                    <div className="info-panel-section-title mb-2">
                        <div className='info-panel-title-text'>Transactions <span className='info-panel-section-sub-title'>(last 10 record)</span></div>

                        <Link className='link info-panel-title-link' href="/backend/custody-management">
                            All transactions
                        </Link>
                    </div>


                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.data.length ? (
                                <Table
                                    columns={columns}
                                    data={this.state.data.slice(0,10)}
                                    filter={false}
                                />
                            ) : (
                                <>
                                    {this.state.errors.length ? (
                                        <AlertBlock type="error" messages={this.state.errors}/>
                                    ) : (
                                        <NoDataBlock primaryText="No Transactions available yet"/>
                                    )}
                                </>
                            )}
                        </>
                    )}

                </div>
            </>
        )
    }
}

export default AssetTransactionsBlock;
