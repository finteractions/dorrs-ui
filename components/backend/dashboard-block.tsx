import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IUserDetail} from "@/interfaces/i-user-detail";
import DoughnutChart from "@/components/chart/doughnut-chart";
import {ICustody} from "@/interfaces/i-custody";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];


interface DashboardBlockState {
    loadingUsers: boolean;
    loadingTransactions: boolean;
    loadingBankAccounts: boolean;
    userStatusCounts: any[];
    transactionStatusCounts: any[];
    bankAccountStatusCounts: any[];
    emailVerifiedCount: any[];
    errors: string[];
    transactionsData: ICustody[];

}


class DashboardBlock extends React.Component<{}> {
    state: DashboardBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            loadingUsers: true,
            loadingTransactions: true,
            loadingBankAccounts: true,
            userStatusCounts: [],
            transactionStatusCounts: [],
            bankAccountStatusCounts: [],
            emailVerifiedCount: [],
            errors: [],
            transactionsData: [],
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
            columnHelper.accessor((row) => row.from_address, {
                id: "from_address",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>From Address</span>,
            }),
            columnHelper.accessor((row) => row.to_address, {
                id: "to_address",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>To Address</span>,
            }),
            columnHelper.accessor((row) => row.transaction_hash, {
                id: "transaction_hash",
                cell: (item) => <div title={item.getValue()} className='simple-hash'>{item.getValue()}</div>,
                header: () => <span>Transaction Hash</span>,
            }),
            columnHelper.accessor((row) => row.approved_by, {
                id: "approved_by",
                cell: (item) => item.getValue(),
                header: () => <span>Approved By</span>,
            }),
            columnHelper.accessor((row) => row.approved_date_time, {
                id: "approved_date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Approved Date</span>,
            }),
            columnHelper.accessor((row) => row.date_time, {
                id: "date_time",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];
    }

    componentDidMount() {
        this.getUsers();
        this.getCustodians();
        this.getBankAccounts();
    }

    getUsers = () => {
        adminService.getUsers()
            .then((res: IUserDetail[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];
                const userStatusCounts: any = {}
                const emailVerifiedCount = {'Confirm': 0, 'Not Confirm': 0}

                data.forEach(s => {
                    s.name = `${s.user_id.first_name} ${s.user_id.last_name}`
                    s.status = s.approved_by ? s.is_approved ? 'Approved' : 'Rejected' : 'Pending'
                    userStatusCounts[s.status] = (userStatusCounts[s.status] || 0) + 1;
                    s.user_id.email_verified ? emailVerifiedCount['Not Confirm']++ : emailVerifiedCount['Confirm']++
                })

                this.setState({userStatusCounts: userStatusCounts, emailVerifiedCount: emailVerifiedCount});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loadingUsers: false})
            });
    }

    getCustodians = () => {
        adminService.getCustodians()
            .then((res: ICustody[]) => {
                const data = res?.sort((a, b) => b.id - a.id) || [];
                const transactionStatusCounts: any = {}

                data.forEach(s => {
                    transactionStatusCounts[s.status] = (transactionStatusCounts[s.status] || 0) + 1;
                })

                this.setState({transactionsData: data, transactionStatusCounts: transactionStatusCounts});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loadingTransactions: false})
            });
    }

    getBankAccounts = () => {
        adminService.getBankAccounts()
            .then((res: IAdminBankAccount[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];
                const bankAccountStatusCounts: any = {}

                data.forEach(s => {
                    s.status = s.deleted ? 'Deleted' : s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase();
                    bankAccountStatusCounts[s.status] = (bankAccountStatusCounts[s.status] || 0) + 1;
                })

                this.setState({bankAccountStatusCounts: bankAccountStatusCounts});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loadingBankAccounts: false})
            });
    }

    getStatusColor(name: string) {
        const statuses: any = {
            'approved': '#34cb68',
            'completed': '#34cb68',
            'debit': '#34cb68',
            'credit': '#34cb68',
            'rejected': '#cb3d34',
            'deleted': '#cb3d34',
            'pending': '#3d7da2',
            'archived': '#b8bec5',
        }

        return statuses[name.toLowerCase()] || '#000'
    }

    render() {
        return (

            <>
                <div className="dashboard section">
                    <div className="content__top">
                        <div className="content__title">Dashboard</div>
                    </div>

                    {this.state.loadingUsers || this.state.loadingTransactions || this.state.loadingBankAccounts ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="dashboard__chart__panel">
                                <div className="dashboard__chart">
                                    <DoughnutChart
                                        labels={Object.keys(this.state.userStatusCounts)}
                                        data={Object.values(this.state.userStatusCounts)}
                                        title="User Statuses"
                                        backgroundColors={Object.keys(this.state.userStatusCounts).map(item => this.getStatusColor(item))}
                                    />
                                </div>
                                <div className="dashboard__chart">
                                    <DoughnutChart
                                        labels={Object.keys(this.state.emailVerifiedCount)}
                                        data={Object.values(this.state.emailVerifiedCount)}
                                        title="User Email Confirmation"
                                        backgroundColors={[this.getStatusColor('approved'), this.getStatusColor('rejected')]}
                                    />
                                </div>
                                <div className="dashboard__chart">
                                    <DoughnutChart
                                        labels={Object.keys(this.state.transactionStatusCounts)}
                                        data={Object.values(this.state.transactionStatusCounts)}
                                        title="Transaction Statuses"
                                        backgroundColors={Object.keys(this.state.transactionStatusCounts).map(item => this.getStatusColor(item))}
                                    />
                                </div>
                                <div className="dashboard__chart">
                                    <DoughnutChart
                                        labels={Object.keys(this.state.bankAccountStatusCounts)}
                                        data={Object.values(this.state.bankAccountStatusCounts)}
                                        title="Bank Account Statuses"
                                        backgroundColors={Object.keys(this.state.bankAccountStatusCounts).map(item => this.getStatusColor(item))}
                                    />
                                </div>
                            </div>


                            <div className="dashboard__transaction__panel">
                                <div className="content__top mt-5 mb-3">
                                    <h4 className="m-0">Transactions (last 10 actions)</h4>
                                    <Link className="link" href="/backend/custody-management">
                                        All transactions
                                    </Link>
                                </div>
                                {this.state.transactionsData.length ? (

                                    <Table
                                        columns={columns}
                                        data={this.state.transactionsData.slice(0, 10)}
                                        searchPanel={false}
                                        filter={false}
                                    />
                                ) : (
                                    <>
                                        <NoDataBlock primaryText="No Transaction available yet"/>
                                    </>
                                )}
                            </div>

                            {this.state.errors.length > 0 && (
                                <AlertBlock type="error" messages={this.state.errors}/>
                            )}
                        </>
                    )}


                </div>

            </>
        )
    }
}

export default DashboardBlock;
