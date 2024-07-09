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

interface HeatMapAndPerformanceBlockState extends IState {
    isLoadingHeatMap: boolean;
    errors: string[];
    dataHeatMap: Array<IDashboardHeatMapAndPerformance>;
    activeTab: string | null;
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS_PUBLIC_DASHBOARD || '2')

class HeatMapAndPerformanceBlock extends React.Component<{}, HeatMapAndPerformanceBlockState> {

    state: HeatMapAndPerformanceBlockState;
    private subscriptionOnHeatMap: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoadingHeatMap: true,
            errors: [],
            dataHeatMap: [],
            activeTab: 'heat-map'
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

    setActiveTab = (tab: string) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }

    subscriptions(): void {
        this.subscriptionOnHeatMap = websocketService.on<Array<IDashboardHeatMapAndPerformance>>(WebsocketEvent.DASHBOARD_HEAT_MAP_AND_PERFORMANCE).subscribe((data: Array<IDashboardHeatMapAndPerformance>) => {
            this.handleHeatMapData(data);
        });
    }

    getHeatMap = () => {
        return new Promise(resolve => {
            publicDashboardService.getHeatMap()
                .then((res: Array<IDashboardHeatMapAndPerformance>) => {
                    const data = res || [];
                    console.log(data)
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

    render() {
        return (

            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Heat Map and Performance</div>
                    </div>

                    <div>
                        <div>

                        </div>
                    </div>
                    <div className={'indicator__item__data'}>
                        <div className={'w-100'}>
                            <ul className="nav nav-tabs w-100" id="tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'heat-map' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       href="#heat-map"
                                       aria-disabled={this.state.isLoadingHeatMap}
                                       onClick={() => this.setActiveTab('heat-map')}>Heat Map</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.activeTab === 'performance' ? 'active' : ''}`}
                                       data-bs-toggle="tab"
                                       aria-disabled={this.state.isLoadingHeatMap}
                                       href="#performance"
                                       onClick={() => this.setActiveTab('performance')}>Performance</a>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-content w-100">
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'heat-map' ? 'show active' : ''}`}
                                id="heat-map">

                                {this.state.isLoadingHeatMap ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataHeatMap.length ? (
                                        <div className={'flex-panel-box mt-2'}>
                                            <div className={'tile indicators content__bottom'}>
                                                {this.state.dataHeatMap
                                                    .slice()
                                                    .sort((a, b) => Number(b.percentage_changed) - Number(a.percentage_changed))
                                                    .map(item => (
                                                        <div key={item.sector_name}
                                                             className={`indicator__item compact ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>
                                                            <div className={'gap-10 justify-content-between'}>
                                                                <div
                                                                    className={`table-image bold`}>{item.sector_name}
                                                                </div>
                                                            </div>
                                                            <div className={'indicator__item__data'}>
                                                                <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}

                            </div>
                            <div
                                className={`indicator__item__data tab-pane fade ${this.state.activeTab === 'performance' ? 'show active' : ''}`}
                                id="performcance">
                                {this.state.isLoadingHeatMap ? (
                                    <LoaderBlock/>
                                ) : (
                                    this.state.dataHeatMap.length ? (
                                        <div className={'flex-panel-box mt-2'}>
                                            <div className={'tile indicators content__bottom'}>
                                                {this.state.dataHeatMap
                                                    .sort((a, b) => Number(b.total_market_cap) - Number(a.total_market_cap))
                                                    .map(item => (
                                                    <div key={item.sector_name}
                                                         className={`indicator__item ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>

                                                        <div className={''}>
                                                            <div
                                                                className={`table-image  bold`}>{item.sector_name}
                                                            </div>
                                                        </div>

                                                        <div className={'gap-10'}>
                                                            <div title={'Add to Watch List'}
                                                                 className={'admin-table-actions'}>
                                                            </div>
                                                        </div>
                                                        <div className={'indicator__item__data dashboard'}>
                                                            <div>
                                                                <div>Average Change:</div>
                                                                <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                                            </div>
                                                            <div>
                                                                <div>Total Market Cap:</div>
                                                                <div><span
                                                                    className={'stay'}>{formatterService.numberFormat(Number(item.total_market_cap), decimalPlaces)}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div>Number of Companies:</div>
                                                                <div><span
                                                                    className={'stay padding-left-25'}>{formatterService.numberFormat(Number(item.number_of_companies), 0)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={'flex-column'}>
                                            <NoDataBlock/>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default HeatMapAndPerformanceBlock;
