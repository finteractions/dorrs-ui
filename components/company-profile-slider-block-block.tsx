import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AssetImage from "@/components/asset-image";
import Marquee from "react-fast-marquee";
import {Subscription} from "rxjs";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import symbolService from "@/services/symbol/symbol-service";
import Image from "next/image";
import DoughnutChartPercentage from "@/components/chart/doughnut-chart-percentage";

interface CompanyProfileSliderBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: ICompanyProfile[];
    tickerAutoplay: boolean;
    currentIndex: number;
    itemsPerPage: number;
}

interface CompanyProfileSliderProps extends ICallback {
    symbol: string;
}

class CompanyProfileSliderBlock extends React.Component<CompanyProfileSliderProps, CompanyProfileSliderBlockState> {
    host = '';
    state: CompanyProfileSliderBlockState;
    private subscription: Subscription | null = null;

    constructor(props: CompanyProfileSliderProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: [],
            tickerAutoplay: false,
            currentIndex: 0,
            itemsPerPage: 3
        };
    }

    componentDidMount() {
        this.host = `${window.location.protocol}//${window.location.host}`;
        this.setState({isLoading: true}, async () => {
            await this.getCompanyProfiles();
        });
    }

    componentDidUpdate(prevProps: CompanyProfileSliderProps) {
        if (prevProps.symbol !== this.props.symbol) {
            this.centerSymbol();
        }
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    getCompanyProfiles = async () => {
        await symbolService.getCompanyProfile()
            .then((res: Array<ICompanyProfile>) => {
                const data = res?.sort((a, b) => a.company_name.localeCompare(b.company_name)) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    s.company_profile_status = s.status ? s.status : '-';
                });

                this.setState({data: data}, this.centerSymbol);
            })
            .catch((errors: IError) => {
                console.error(errors);
            })
            .finally(() => {
                this.setState({isLoading: false});
            });
    };

    centerSymbol = () => {
        const {symbol} = this.props;
        const {data, itemsPerPage} = this.state;

        if (!symbol) return;

        const symbolIndex = data.findIndex(item => item.symbol_data?.symbol === symbol);
        if (symbolIndex === -1) return;

        const centerIndex = Math.max(0, symbolIndex - Math.floor(itemsPerPage / 2));
        this.setState({currentIndex: centerIndex});
    };

    handlePrevious = () => {
        this.setState((prevState) => ({
            currentIndex: Math.max(prevState.currentIndex - prevState.itemsPerPage, 0),
        }));
    };

    handleNext = () => {
        this.setState((prevState) => ({
            currentIndex: Math.min(prevState.currentIndex + prevState.itemsPerPage, prevState.data.length - prevState.itemsPerPage),
        }));
    };

    navigate = (symbol: string) => {
        this.props.onCallback(symbol, 'view');
    };

    render() {
        const {data, currentIndex, itemsPerPage} = this.state;
        const {symbol} = this.props;
        const visibleData = data.slice(currentIndex, currentIndex + itemsPerPage);

        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock height={70}/>
                ) : (
                    <>
                        {data.length > 0 && (
                            <div className={'indicators-dashboard asset-profiles align-items-center'}>
                                <button
                                    className={`pagination__arrow icon-chevron-left cursor-pointer ${currentIndex === 0 ? 'disable' : ''}`}
                                    onClick={this.handlePrevious}
                                    disabled={currentIndex === 0}
                                ></button>
                                <Marquee play={false} style={{width: '620px'}}>
                                    {visibleData.map(item => {
                                        const fill_out_percentage = parseInt(item.fill_out_percentage || '0', 10);
                                        const isCurrent = item.symbol_data?.symbol === symbol;

                                        return (
                                            <div
                                                key={item.symbol}
                                                className={`indicator__item-dashboard justify-content-between ${
                                                    isCurrent ? 'current' : ''
                                                }`}
                                            >
                                                <div
                                                    className={'indicator__item-asset-profile table-image image-28 mix-blend-mode-multiple-img'}
                                                >
                                                    <div
                                                        onClick={() => !isCurrent ? this.navigate(item.symbol_data?.symbol ?? '') : null}
                                                        className={`table-image text-overflow ${!isCurrent ? 'cursor-pointer link' : ''}`}
                                                    >
                                                        <div className="table-image-container">
                                                            <AssetImage
                                                                alt=""
                                                                src={item.logo ? `${this.host}${item.logo}` : ''}
                                                                width={27}
                                                                height={27}
                                                            />
                                                        </div>
                                                        <span>
                                                            {item.company_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={'d-flex justify-content-center'}>
                                                    {fill_out_percentage === 100 ? (
                                                        <Image
                                                            src="/img/check-ok.svg"
                                                            width={40}
                                                            height={40}
                                                            alt="Check"
                                                        />
                                                    ) : (
                                                        <DoughnutChartPercentage
                                                            percentage={fill_out_percentage}
                                                            width={40}
                                                            height={40}
                                                            fontSize={12}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Marquee>
                                <button
                                    className={`pagination__arrow icon-chevron-right cursor-pointer ${currentIndex + itemsPerPage >= data.length ? 'disable' : ''}`}
                                    onClick={this.handleNext}
                                    disabled={currentIndex + itemsPerPage >= data.length}
                                ></button>
                            </div>
                        )}
                    </>
                )}
            </>
        );
    }
}

export default CompanyProfileSliderBlock;
