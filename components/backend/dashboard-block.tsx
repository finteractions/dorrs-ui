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


interface DashboardBlockState {
    loadingUsers: boolean;
    userStatusCounts: any[];
    emailVerifiedCount: any[];
    errors: string[];
}


class DashboardBlock extends React.Component<{}> {
    state: DashboardBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            loadingUsers: true,
            userStatusCounts: [],
            emailVerifiedCount: [],
            errors: [],
        }
    }

    componentDidMount() {
        this.getUsers();
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
                        <div className="content__title">Dashboard {JSON.stringify(this.state.loadingUsers)}</div>
                    </div>

                    {this.state.loadingUsers ? (
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
