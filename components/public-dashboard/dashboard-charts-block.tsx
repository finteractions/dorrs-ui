import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import DoughnutChart from "@/components/chart/doughnut-chart";
import LinearChartMultiple from "@/components/chart/linear-chart-multiple";

interface DashboardChartBlockState extends IState {
    isLoadingHeatMap: boolean;
    errors: string[];
    dataHeatMap: Array<IDashboardHeatMapAndPerformance>;
    dataHeatMapChart: { labels: Array<string>, dataset: Array<any> };
}

class DashboardChartsBlock extends React.Component<{}, DashboardChartBlockState> {

    state: DashboardChartBlockState;
    private subscriptionOnHeatMap: Subscription | null = null;
    private subscriptionOnHeatMapChart: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoadingHeatMap: true,
            errors: [],
            dataHeatMap: [],
            dataHeatMapChart: {labels: [], dataset: []}
        }
    }

    componentDidMount() {
        this.setState({isLoadingHeatMap: true}, async () => {
            await this.getHeatMap()
                .then(() => this.getHeatMapChart())
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscriptionOnHeatMap?.unsubscribe();
        this.subscriptionOnHeatMapChart?.unsubscribe();
    }

    subscriptions(): void {
        this.subscriptionOnHeatMap = websocketService.on<Array<IDashboardHeatMapAndPerformance>>(WebsocketEvent.DASHBOARD_HEAT_MAP).subscribe((data: Array<IDashboardHeatMapAndPerformance>) => {
            this.handleHeatMapData(data);
        });

        this.subscriptionOnHeatMap = websocketService.on<Array<IDashboardHeatMapAndPerformanceChart>>(WebsocketEvent.DASHBOARD_HEAT_MAP_CHART).subscribe((data: Array<IDashboardHeatMapAndPerformanceChart>) => {
            this.handleHeatMapChartData(data)
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
                    resolve(true)
                });
        })
    }

    getHeatMapChart = () => {
        return new Promise(resolve => {
            publicDashboardService.getHeatMapChart()
                .then((res: Array<IDashboardHeatMapAndPerformanceChart>) => {
                    const data = res || [];
                    this.handleHeatMapChartData(data);
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

    handleHeatMapChartData = (data: Array<IDashboardHeatMapAndPerformanceChart>) => {
        const labels = new Set<string>();
        const datasets: any = [];

        data.forEach((s, idx) => {
            s.data.forEach(k => labels.add(k.date));
            datasets.push(
                {
                    label: s.market_sector,
                    data: s.data.map(k => k.market_cap),
                    backgroundColor: this.getBackgroundColour(idx),
                    borderColor: this.getBackgroundColour(idx),
                }
            )
        })

        this.setState({dataHeatMapChart: {labels: Array.from(labels), dataset: datasets}})
    }

    getBackgroundColour(index: number) {
        const colours: any = {
            0: '#1f8ceb',
            1: '#34cb68',
            2: '#cb3d34',
            3: '#FFA800',
            4: '#7da1ff',
            5: '#ff6384',
            6: '#b8bec5',
            7: '#6a0dad',
            8: '#20c997',
            9: '#ff5722',
            10: '#9b59b6',
            11: '#16a085',
            12: '#e74c3c',
            13: '#3498db',
            14: '#f39c12',
        }

        return colours[index] || '#000'
    }

    render() {
        return (
            <>

                <div className={'indicator__item statistics flex-column d-block'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Total Market Cap</div>
                    </div>
                    <div className={'content__bottom justify-content-center'}>
                        {this.state.isLoadingHeatMap ? (
                            <LoaderBlock/>
                        ) : (
                            <LinearChartMultiple
                                labels={this.state.dataHeatMapChart.labels}
                                datasets={this.state.dataHeatMapChart.dataset}
                            />
                        )}
                    </div>
                </div>
                <div className={'indicator__item statistics flex-column d-block max-width-700'}>
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
                                    isDataLabel={true}
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
