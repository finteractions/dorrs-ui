import React from 'react';
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import formatterService from "@/services/formatter/formatter-service";
import AssetImage from "@/components/asset-image";
import Marquee from "react-fast-marquee";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";

interface TickerBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IMarketLastSaleStatistics[];
}

class TickerBlock extends React.Component<{}, TickerBlockState> {

    host = '';
    state: TickerBlockState;
    private subscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: [],
        }
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`
        this.setState({isLoading: true}, () => {
            this.getMarketStatistics();
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    subscriptions(): void {
        this.subscription = websocketService.on<Array<IMarketLastSaleStatistics>>(WebsocketEvent.DASHBOARD_TICKER).subscribe((data: Array<IMarketLastSaleStatistics>) => {
            this.handleData(data);
        });
    }

    getMarketStatistics = () => {
        publicDashboardService.getTickerData()
            .then((res: Array<IMarketLastSaleStatistics>) => {
                const data = res || [];
                this.handleData(data);
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<IMarketLastSaleStatistics>) => {
        this.setState({data: data})
    }


    render() {
        return (
            <div className={'mt-4'}>

                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {this.state.data.length ? (
                            <div className={'indicators-dashboard'}>
                                <Marquee pauseOnHover={true}>
                                    {this.state.data.map(item => (
                                        <div key={item.symbol_name}
                                             className={`indicator__item-dashboard ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>

                                            <div className={'table-image image-28 mix-blend-mode-multiple-img'}>
                                                <AssetImage alt=''
                                                            src={item.company_profile?.logo}
                                                            width={30} height={30}/>
                                            </div>
                                            <div>
                                                <div className={'indicator__item__data-dashboard'}>
                                                    <div className={'fw-bold'}>{item.symbol_name}</div>
                                                    <div> {formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                                </div>
                                                <div
                                                    className={'flex-1-1-100 text-overflow'}>{item.digital_asset_category || '-'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </Marquee>
                            </div>
                        ) : (
                            <NoDataBlock/>
                        )}
                    </>
                )}
            </div>
        );
    }

}

export default TickerBlock;
