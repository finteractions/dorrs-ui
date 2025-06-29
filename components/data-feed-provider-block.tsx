import React from 'react';
import {ISymbol} from "@/interfaces/i-symbol";
import LoaderBlock from "@/components/loader-block";
import {useRouter} from "next/router";
import NoDataBlock from "@/components/no-data-block";
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";
import DataFeedProviderHistoryBlock from "@/components/data-feed-provider-history-block";
import formatterService from "@/services/formatter/formatter-service";


interface DataFeedProviderProps extends ICallback {
    name: string;
}

interface DataFeedProviderState extends IState {
    isLoading: boolean;
    errors: string[];
}

const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class DataFeedProviderBlock extends React.Component<DataFeedProviderProps> {

    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: DataFeedProviderState;
    host = `${window.location.protocol}//${window.location.host}`;
    dataFeedProvider: IDataFeedProvider | null;
    dataFeedProviderStatistics: IDataFeedProviderStatistics | null;

    constructor(props: DataFeedProviderProps) {
        super(props);

        this.dataFeedProvider = null;
        this.dataFeedProviderStatistics = null;

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
        }
    }

    async componentDidMount() {

        await this.getDataFeedProviderInfo()
            .then(() => this.getStatistics())
            .finally(() => {
                this.setState({isLoading: false});
            })
    }

    getDataFeedProviderInfo = () => {
        return new Promise(resolve => {
            dataFeedProvidersService.getInfo(this.props.name)
                .then((res: Array<IDataFeedProvider>) => {
                    const data = res || [];
                    const dataFeedProvider = (data[0] ?? null) as IDataFeedProvider

                    try {
                        const descriptions = JSON.parse(dataFeedProvider.description.toString());
                        dataFeedProvider.description = descriptions;

                    } catch (error) {
                        dataFeedProvider.description = [""];
                    }

                    try {
                        const images = JSON.parse(dataFeedProvider.images.toString().replace(/'/g, '"'));
                        dataFeedProvider.images = images;

                    } catch (error) {
                        dataFeedProvider.images = [];
                    }

                    this.dataFeedProvider = dataFeedProvider;

                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.props.onCallback(this.dataFeedProvider)
                    resolve(true);
                });
        })
    }

    getStatistics = () => {
        return new Promise((resolve) => {
            dataFeedProvidersService.getStatistics(this.props.name)
                .then((res: Array<IDataFeedProviderStatistics>) => {
                    const data = res || [];
                    this.dataFeedProviderStatistics = data[0] ?? null
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        });
    }

    handleBack = () => {
        const router = useRouter();
        router.push('/data-feed-providers');
    }


    onCallback = async (values: any, step: boolean) => {
        await this.getDataFeedProviderInfo();
    };

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className="flex-panel-box">
                            {this.dataFeedProvider ? (
                                <>
                                    <div className="panel">
                                        <div className="content__bottom d-flex justify-content-between">
                                            <h2 className="view_block_main_title">
                                                {this.dataFeedProvider.name}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="indicators content__bottom">

                                        <div className={'indicator__item statistics data-feed-provider'}>
                                            <div className="content__top mb-0 justify-content-center px-0 pb-0">
                                                <div className="content__title">Total # of Symbols</div>
                                            </div>

                                            <div className={'indicator__item__data justify-content-center'}>
                                                {formatterService.numberFormat(Number(this.dataFeedProviderStatistics?.total_symbol), 0)}
                                            </div>
                                        </div>
                                        <div className={'indicator__item statistics data-feed-provider'}>
                                            <div className="content__top mb-0 justify-content-center px-0 pb-0">
                                                <div className="content__title">Total # of Trades</div>
                                            </div>

                                            <div className={'indicator__item__data justify-content-center'}>
                                                {formatterService.numberFormat(Number(this.dataFeedProviderStatistics?.total_trade), 0)}
                                            </div>
                                        </div>
                                        <div className={'indicator__item statistics data-feed-provider'}>
                                            <div className="content__top mb-0 justify-content-center px-0 pb-0">
                                                <div className="content__title">Total # of Quantity</div>
                                            </div>

                                            <div className={'indicator__item__data justify-content-center'}> {}
                                                {formatterService.numberFormat(Number(this.dataFeedProviderStatistics?.total_quantity), 0)}
                                            </div>
                                        </div>
                                        <div className={'indicator__item statistics data-feed-provider'}>
                                            <div className="content__top mb-0 justify-content-center px-0 pb-0">
                                                <div className="content__title">Total # by Dollar Value</div>
                                            </div>

                                            <div className={'indicator__item__data justify-content-center'}>
                                                {formatterService.numberFormat(Number(this.dataFeedProviderStatistics?.total_value), 6)}
                                            </div>
                                        </div>

                                    </div>
                                    <div className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Description</div>
                                        </div>
                                        <div className={'content__bottom'}>
                                            {this.dataFeedProvider?.description.map((description, index) => (
                                                <div className={'d-flex gap-20 flex-wrap'} key={index}>
                                                    {this.dataFeedProvider?.images[index] && (
                                                        <div
                                                            className={'profile__left bg-transparent flex-panel-box pt-0 content-box'}>
                                                            <div className={'logo p-0 align-items-baseline '}>
                                                                <img src={this.dataFeedProvider?.images[index]}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={'d-flex mb-3'}
                                                        style={{whiteSpace: 'pre-wrap'}}
                                                    >
                                                        {description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={'panel'}>
                                        <div className={'content__top'}>
                                            <div className={'content__title'}>Symbols</div>
                                        </div>
                                        <div className={`content__bottom`}>
                                            <DataFeedProviderHistoryBlock name={this.props.name}/>
                                        </div>
                                    </div>
                                </>

                            ) : (
                                <div className={'panel'}>
                                    <div className={'flex-panel-box'}>
                                        <div className={'panel'}>
                                            <div className={'content__bottom'}>
                                                <NoDataBlock/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default DataFeedProviderBlock;
