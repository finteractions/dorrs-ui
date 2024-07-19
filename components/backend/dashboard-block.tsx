import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IUserDetail} from "@/interfaces/i-user-detail";
import {ISymbol} from "@/interfaces/i-symbol";
import {IOrder} from "@/interfaces/i-order";
import {OrderStatus} from "@/enums/order-status";
import {IChartStatistics} from "@/interfaces/i-chart-statistics";
import DoughnutChartV2 from "@/components/chart/doughnut-chart-v2";


interface DashboardBlockState {
    loadingUsers: boolean;
    loadingSymbols: boolean;
    loadingOrders: boolean;
    loadingMemberDistribution: boolean;
    userStatusCount: any[];
    emailVerifiedCount: any[];
    symbolCount: any[];
    orderCount: any[];
    membershipDistributionCount: any[];
    errors: string[];
}


class DashboardBlock extends React.Component<{}> {
    state: DashboardBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            loadingUsers: true,
            loadingSymbols: true,
            loadingOrders: true,
            loadingMemberDistribution: true,
            userStatusCount: [],
            emailVerifiedCount: [],
            symbolCount: [],
            orderCount: [],
            membershipDistributionCount: [],
            errors: [],
        }
    }

    async componentDidMount() {
        await this.getUsers()
        await this.getSymbols()
        await this.getOrders()
        await this.getMemberDistribution()
    }

    getUsers = () => {
        return new Promise<boolean>(resolve => {
            adminService.getUsers()
                .then((res: IUserDetail[]) => {
                    const data = res?.sort((a, b) => a.id - b.id) || [];
                    const userStatusCount: any = {}
                    const emailVerifiedCount = {'Confirm': 0, 'Not Confirm': 0}

                    data.forEach(s => {
                        s.name = `${s.user_id.first_name} ${s.user_id.last_name}`
                        s.status = s.approved_by ? s.is_approved ? 'Approved' : 'Rejected' : 'Pending'
                        userStatusCount[s.status] = (userStatusCount[s.status] || 0) + 1;
                        s.user_id.email_verified ? emailVerifiedCount['Not Confirm']++ : emailVerifiedCount['Confirm']++
                    })

                    this.setState({userStatusCount: userStatusCount, emailVerifiedCount: emailVerifiedCount});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    this.setState({loadingUsers: false}, () => resolve(true))
                });
        })
    }

    getSymbols = () => {
        return new Promise<boolean>(resolve => {
            adminService.getAssets()
                .then((res: ISymbol[]) => {
                    const data = res || [];

                    const symbols = data.filter(s => s.is_approved)
                    const companyProfile = symbols.filter(s => s.company_profile?.is_approved)

                    const statistics = {
                        'Symbols': symbols.length,
                        'Asset Profiles': companyProfile.length
                    }
                    this.setState({symbolCount: statistics});

                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    this.setState({loadingSymbols: false}, () => resolve(true))
                });
        })
    }


    getOrders = () => {
        return new Promise<boolean>(resolve => {
            adminService.getOrders()
                .then((res: IOrder[]) => {
                    const data = res || [];

                    const openOrders = data.filter(s => s.status.toLowerCase() === OrderStatus.OPEN)
                    const closedOrders = data.filter(s => s.status.toLowerCase() === OrderStatus.CLOSED)

                    const statistics = {
                        'Open': openOrders.length,
                        'Closed': closedOrders.length
                    }
                    this.setState({orderCount: statistics});

                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    this.setState({loadingOrders: false}, () => resolve(true))
                });
        })
    }

    getMemberDistribution = () => {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributionStatistics(null)
                .then((res: IChartStatistics[]) => {
                    const data = res || [];

                    const totalForecast = data.find(s => s.key === 'total_forecast')?.value || 0
                    const totalApproved = data.find(s => s.key === 'total_approved')?.value || 0
                    const total_payment_due = data.find(s => s.key === 'total_payment_due')?.value || 0


                    const statistics = {
                        'Forecast': totalForecast,
                        'Approved': totalApproved,
                        'Payment Due': total_payment_due
                    }
                    this.setState({membershipDistributionCount: statistics});

                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    this.setState({loadingMemberDistribution: false}, () => resolve(true))
                });
        })
    }

    getBackgroundColour(name: string) {
        const colours: any = {
            'approved': '#34cb68',
            'completed': '#34cb68',
            'debit': '#34cb68',
            'credit': '#34cb68',
            'rejected': '#cb3d34',
            'deleted': '#cb3d34',
            'pending': '#3d7da2',
            'archived': '#b8bec5',
            'symbol': '#34cb68',
            'company_profile': '#3d7da2',
            'open': '#3d7da2',
            'closed': '#cb3d34',
            'total_forecast': '#3d7da2',
            'total_approved': '#34cb68',
            'total_payment_due': '#FFA800',
        }

        return colours[name.toLowerCase()] || '#000'
    }

    render() {
        return (

            <>
                <div className="dashboard section">
                    <div className="content__top">
                        <div className="content__title">Dashboard</div>
                    </div>


                    <div className="dashboard__chart__panel">
                        <div className="dashboard__chart">
                            {this.state.loadingUsers ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChartV2
                                    labels={Object.keys(this.state.userStatusCount)}
                                    data={Object.values(this.state.userStatusCount)}
                                    title="User Status"
                                    backgroundColors={Object.keys(this.state.userStatusCount).map(item => this.getBackgroundColour(item))}
                                />
                            )}

                        </div>
                        <div className="dashboard__chart">
                            {this.state.loadingUsers ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChartV2
                                    labels={Object.keys(this.state.emailVerifiedCount)}
                                    data={Object.values(this.state.emailVerifiedCount)}
                                    title="User Email Confirmation"
                                    backgroundColors={[this.getBackgroundColour('approved'), this.getBackgroundColour('rejected')]}
                                />
                            )}
                        </div>

                        <div className="dashboard__chart">
                            {this.state.loadingSymbols ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChartV2
                                    labels={Object.keys(this.state.symbolCount)}
                                    data={Object.values(this.state.symbolCount)}
                                    title="Symbols"
                                    backgroundColors={[this.getBackgroundColour('symbol'), this.getBackgroundColour('company_profile')]}
                                />
                            )}
                        </div>

                        <div className="dashboard__chart">
                            {this.state.loadingOrders ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChartV2
                                    labels={Object.keys(this.state.orderCount)}
                                    data={Object.values(this.state.orderCount)}
                                    title="Depth of Book"
                                    backgroundColors={[this.getBackgroundColour('open'), this.getBackgroundColour('closed')]}
                                />
                            )}
                        </div>

                        <div className="dashboard__chart">
                            {this.state.loadingMemberDistribution ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChartV2
                                    labels={Object.keys(this.state.membershipDistributionCount)}
                                    data={Object.values(this.state.membershipDistributionCount)}
                                    title="Membership Distribution"
                                    labelName={'Sum'}
                                    backgroundColors={[this.getBackgroundColour('total_forecast'), this.getBackgroundColour('total_approved'), this.getBackgroundColour('total_payment_due')]}
                                />
                            )}
                        </div>

                    </div>

                    {this.state.errors.length > 0 && (
                        <AlertBlock type="error" messages={this.state.errors}/>
                    )}


                </div>

            </>
        )
    }
}

export default DashboardBlock;
