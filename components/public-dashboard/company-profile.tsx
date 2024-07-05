import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";

interface CompanyProfileBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IDashboardCompanyProfile | null;
}

class CompanyProfileBlock extends React.Component<{}, CompanyProfileBlockState> {

    state: CompanyProfileBlockState;
    private subscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: null
        }
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getCompanyProfile();
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    subscriptions(): void {
        this.subscription = websocketService.on<Array<IDashboardCompanyProfile>>(WebsocketEvent.DASHBOARD_COMPANY_PROFILE).subscribe((data: Array<IDashboardCompanyProfile>) => {
            this.handleData(data);
        });
    }

    getCompanyProfile = () => {
        publicDashboardService.getCompanyProfile()
            .then((res: Array<IDashboardCompanyProfile>) => {
                const data = res || [];
                this.handleData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<IDashboardCompanyProfile>) => {
        this.setState({data: data[0] ?? null})
    }


    render() {
        return (
            <>

                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className={'indicator__item statistics'}>
                            <div className="content__top pb-0">
                                <div className="content__title">Company Profile</div>
                            </div>

                            <div>
                                <div>

                                </div>
                            </div>
                            <div className={'indicator__item__data'}>
                                <div>
                                    <div>Average Market Cap:</div>
                                    <div
                                        className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.average_market_cap) || 0, 4)}</div>
                                </div>
                                <div>
                                    <div>Total Market Cap:</div>
                                    <div
                                        className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_market_cap) || 0, 4)}</div>
                                </div>
                                <div>
                                    <div>Number of Companies:</div>
                                    <div
                                        className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.number_of_companies) || 0, 0)}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default CompanyProfileBlock;
