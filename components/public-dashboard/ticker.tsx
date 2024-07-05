import React from 'react';
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import formatterService from "@/services/formatter/formatter-service";
import AssetImage from "@/components/asset-image";
import Marquee from "react-fast-marquee";

interface QuoteBoardBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IMarketLastSaleStatistics[];
}

class TickerBlock extends React.Component<{}, QuoteBoardBlockState> {

    host = '';
    state: QuoteBoardBlockState;

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
        this.setState({isLoading: true});
        this.getMarketStatistics();
    }

    componentWillUnmount() {

    }

    getMarketStatistics = () => {
        publicDashboardService.getTickerData()
            .then((res: Array<any>) => {
                const data = res || [];
                console.log(data)
                this.setState({data: data})
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }


    render() {
        return (
            <>

                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {this.state.data.length ? (
                            <div className={'indicators'}>
                                <Marquee pauseOnHover={true}>
                                    {this.state.data.map(item => (
                                        <div key={item.symbol_name}
                                             className={`indicator__item ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>

                                            <div className={'table-image image-28 mix-blend-mode-multiple-img'}>
                                                <AssetImage alt=''
                                                            src={item.company_profile?.logo}
                                                            width={28} height={28}/>
                                            </div>
                                            <div>
                                                <div className={'indicator__item__data'}>
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

            </>
        );
    }

}

export default TickerBlock;
