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
    tickerAutoplay: boolean;
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
            tickerAutoplay: false
        }
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`
        this.setState({isLoading: true}, () => {
            this.getMarketStatistics();
            this.subscriptions();
        });
        window.addEventListener('resize', this.ticker);
        window.addEventListener('isPortalShowSidebarMd', this.ticker);
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
        window.removeEventListener('resize', this.ticker);
        window.addEventListener('isPortalShowSidebarMd', this.ticker);
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

    handleData = (res: Array<IMarketLastSaleStatistics>) => {
        let data = res.filter(s => Number(s.percentage_changed) != 0)
        this.setState({data: data}, () => {
            this.ticker();
        })
    }

    ticker = () => {
       setTimeout(() => {
           const tickerContainer = document.querySelector('.indicators-dashboard') as HTMLElement;
           const tickerElement = document.querySelector('.indicator__item-dashboard') as HTMLElement;
           if(tickerContainer && tickerElement){
               const tickerElementStyle = getComputedStyle(tickerElement);
               const tickerElementMarginLeft = parseFloat(tickerElementStyle.marginLeft);
               const tickerElementMarginRight = parseFloat(tickerElementStyle.marginRight);
               const tickerContainerWidth = tickerContainer.offsetWidth;
               const tickerElementWidth = tickerElement.offsetWidth + tickerElementMarginLeft + tickerElementMarginRight;
               const count = this.state.data.length;
               this.setState({tickerAutoplay: (tickerElementWidth * count) > tickerContainerWidth});
           }
       })
    }


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {this.state.data.length > 0 && (
                            <div className={'indicators-dashboard'}>
                                <Marquee play={this.state.tickerAutoplay} key={this.state.tickerAutoplay ? 'playing' : 'stopped'}>
                                    {this.state.data.map(item => (
                                        <div key={item.symbol_name}
                                             className={`indicator__item-dashboard ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>

                                            <div className={'table-image image-28 mix-blend-mode-multiple-img'}>
                                                <AssetImage alt=''
                                                            src={item?.logo}
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
                        )}
                    </>
                )}
            </>
        );
    }

}

export default TickerBlock;
