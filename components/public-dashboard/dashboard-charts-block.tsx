import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import {createColumnHelper} from "@tanstack/react-table";
import AssetImage from "@/components/asset-image";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import DoughnutChart from "@/components/chart/doughnut-chart";

interface DashboardChartBlockState extends IState {
    isLoadingHeatMap: boolean;
    errors: string[];
    dataHeatMap: Array<IDashboardHeatMapAndPerformance>;
}

class DashboardChartsBlock extends React.Component<{}, DashboardChartBlockState> {

    state: DashboardChartBlockState;
    private subscriptionOnHeatMap: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoadingHeatMap: true,
            errors: [],
            dataHeatMap: [],
        }
    }

    componentDidMount() {
        this.setState({isLoadingHeatMap: true}, async () => {
            await this.getHeatMap()
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscriptionOnHeatMap?.unsubscribe();
    }

    subscriptions(): void {
        this.subscriptionOnHeatMap = websocketService.on<Array<IDashboardHeatMapAndPerformance>>(WebsocketEvent.DASHBOARD_HEAT_MAP).subscribe((data: Array<IDashboardHeatMapAndPerformance>) => {
            this.handleHeatMapData(data);
        });
    }

    getHeatMap = () => {
        return new Promise(resolve => {
            publicDashboardService.getHeatMap()
                .then((res: Array<IDashboardHeatMapAndPerformance>) => {
                    const data = res || [];
                    this.handleHeatMapData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingHeatMap: false}, () => resolve(true))
                });
        })
    }

    handleHeatMapData = (data: Array<IDashboardHeatMapAndPerformance>) => {
        this.setState({
            dataHeatMap: data ?? [],
        })
    }

    getBackgroundColour(index: number) {
        const colours: any = {
            0: '#34cb68',
            1: '#cb3d34',
            2: '#3d7da2',
            3: '#b8bec5',
            4: '#FFA800',
            5: '#7da1ff',
            6: '#ff6384',
        }

        return colours[index] || '#000'
    }

    render() {
        return (
            <>

                <div className={'indicator__item statistics'}>
                    <div className={'content__bottom justify-content-center'}>IN DEVELOPMENT</div>
                </div>
                <div className={'indicator__item statistics flex-column max-width-700'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Total Market Cap</div>
                    </div>

                    <div className={'content__bottom justify-content-center'}>
                        <>
                            {this.state.isLoadingHeatMap ? (
                                <LoaderBlock/>
                            ) : (
                                <DoughnutChart
                                    title={''}
                                    width={320}
                                    isLegend={true}
                                    labelName={'Total Market Cap'}
                                    labels={this.state.dataHeatMap.map(s => s.market_sector)}
                                    data={this.state.dataHeatMap.map(s => Number(s.total_market_cap))}
                                    backgroundColors={this.state.dataHeatMap.map((s, index) => this.getBackgroundColour(index))}
                                />
                            )}
                        </>
                    </div>
                </div>

            </>
        );
    }

}

export default DashboardChartsBlock;
