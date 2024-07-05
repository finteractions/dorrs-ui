import React from 'react';
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "@/components/no-data-block";
import formatterService from "@/services/formatter/formatter-service";
import AssetImage from "@/components/asset-image";
import Marquee from "react-fast-marquee";

interface SymbolRegistryBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    symbolRegistry: IDashboardSymbolRegistry | null;
}

class SymbolRegistryBlock extends React.Component<{}, SymbolRegistryBlockState> {

    host = '';
    state: SymbolRegistryBlockState;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            symbolRegistry: null
        }
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => this.getSymbolRegistry());
    }

    componentWillUnmount() {

    }

    getSymbolRegistry = () => {
        publicDashboardService.getSymbolRegistry()
            .then((res: Array<IDashboardSymbolRegistry>) => {
                const data = res || [];

                this.setState({symbolRegistry: data[0] ?? null})
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
                        <div className={'indicators content__bottom mt-4'}>
                            <div className={'indicator__item statistics'}>
                                <div className="content__top pb-0">
                                    <div className="content__title">Symbol Registry</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
                                    <div>
                                        <div>Total Symbols:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.symbolRegistry?.total_symbols) || 0, 0)}</div>
                                    </div>
                                    <div>
                                        <div>Total Companies:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.symbolRegistry?.total_companies) || 0, 0)}</div>
                                    </div>
                                    <div>
                                        <div>Unique Industries:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.symbolRegistry?.unique_industries) || 0, 0)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={'indicator__item statistics'}>
                                <div className="content__top pb-0">
                                    <div className="content__title">Company Profile</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>

                                </div>
                            </div>

                            <div className={'indicator__item statistics'}>
                                <div className="content__top pb-0">
                                    <div className="content__title">Market Data Summary</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>

                                </div>
                            </div>

                        </div>

                    </>
                )}
            </>
        );
    }

}

export default SymbolRegistryBlock;
