import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import statisticsService from "@/services/statistics/statistics-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import DepthOfBookPerSymbolBlock from "@/components/depth-of-book-per-symbol-block";
import LastSaleReportingPerSymbolBlock from "@/components/last-sale-reporting-per-symbol";
import BestBidAndBestOfferPerSymbolBlock from "@/components/best-bid-and-best-offer-per-symbol-block";


interface QuoteBoardPerSymbolProps {
    symbol: string;
}

interface QuoteBoardPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    lastSale: ILastSale | null;
    bestBidAndBestOffer: IBestBidAndBestOffer | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class QuoteBoardPerSymbolBlock extends React.Component<QuoteBoardPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: QuoteBoardPerSymbolState;

    constructor(props: QuoteBoardPerSymbolProps) {
        super(props);

        this.companyProfile = null;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            lastSale: null,
            bestBidAndBestOffer: null,
        }


        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.quote_condition, {
                id: "quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>QC </span>,
            }),
            columnHelper.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Bid MPID </span>,
            }),
            columnHelper.accessor((row) => row.bid_quantity, {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => row.bid_date, {
                id: "bid_date",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Date</span>,
            }),
            columnHelper.accessor((row) => row.bid_time, {
                id: "bid_time",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Time</span>,
            }),
            columnHelper.accessor((row) => row.offer_mpid, {
                id: "offer_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Offer MPID </span>,
            }),
            columnHelper.accessor((row) => row.offer_quantity, {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => row.offer_date, {
                id: "offer_date",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Date</span>,
            }),
            columnHelper.accessor((row) => row.offer_time, {
                id: "offer_time",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Time</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols()
            .then(() => this.getLastSale())
            .then(() => this.getBBO())
            .finally(() => this.setState({isLoading: false}))
    }

    getLastSale = () => {
        return new Promise((resolve) => {
            statisticsService.getLastSaleBySymbol(this.props.symbol)
                .then((res: Array<ILastSale>) => {
                    const lastSale = res[0] || null;
                    this.setState({lastSale: lastSale})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        })

    }

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const data = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

                    const symbol = data.find((s: ISymbol) => s.symbol === this.props.symbol);
                    this.companyProfile = symbol?.company_profile || null;
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true)
                });
        })

    }

    getBBO = () => {
        return new Promise((resolve) => {
            statisticsService.getBestBidAndBestOfferBySymbol(this.props.symbol)
                .then((res: Array<IBestBidAndBestOffer>) => {
                    const bestBidAndBestOffer = res[0] || null;
                    this.setState({bestBidAndBestOffer: bestBidAndBestOffer})
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        })

    }
    handleBack = () => {
        const router = useRouter();
        router.push('/best-bid-and-best-offer');
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className="d-flex align-items-center justify-content-between flex-1">
                            <div className="login__bottom">
                                <p>
                                    <i className="icon-chevron-left"/> <Link
                                    className="login__link"
                                    href="/quote-board"

                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>
                        <div className={'panel'}>
                            <div className={`content__bottom`}>


                                <h2 className={'view_block_main_title'}>
                                    {this.companyProfile ? (
                                        <>
                                            <div className={"company-profile-logo"}>
                                                <img src={this.companyProfile.logo} alt="Logo"/>
                                            </div>
                                            {this.companyProfile.company_name} ({this.companyProfile.security_name})
                                        </>
                                    ) : (
                                        <>{this.props.symbol}</>
                                    )}
                                </h2>
                            </div>

                        </div>
                        <div className="indicators content__bottom">

                            <div className={'indicator__item statistics'}>
                                <div className="content__top">
                                    <div className="content__title">Best Bid and Best Offer</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
                                    <div>
                                        <div>Bid Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.bid_quantity ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.bid_quantity), Number(this.state.bestBidAndBestOffer?.fractional_lot_size || 0)) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Bid Price:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.bid_price ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.bid_price), decimalPlaces) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Offer Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.offer_quantity ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.offer_quantity), Number(this.state.bestBidAndBestOffer?.fractional_lot_size || 0)) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div>Offer Price:</div>
                                        <div
                                            className={'padding-left-60'}>{this.state.bestBidAndBestOffer?.offer_price ? formatterService.numberFormat(Number(this.state.bestBidAndBestOffer.offer_price), decimalPlaces) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={'indicator__item statistics'}>
                                <div className="content__top">
                                    <div className="content__title">Last Sale</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
                                    <div>
                                        <div>Origin:</div>
                                        <div><span className={'sign'}></span><span
                                            className={'stay'}>{this.state.lastSale?.origin || '-'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div>Symbol and Suffix:</div>
                                        <div
                                            className={'padding-left-60'}>{this.props.symbol} {this.state.lastSale?.symbol_suffix}</div>
                                    </div>
                                    <div>
                                        <div>Quantity:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.lastSale?.quantity) || 0, Number(this.state.lastSale?.fractional_lot_size || 0))}</div>
                                    </div>
                                    <div>
                                        <div>Price:</div>
                                        <div>{formatterService.formatAndColorNumberBlockHTML(this.state.lastSale?.price_formatted || 0, false, decimalPlaces)}</div>
                                    </div>
                                    <div>
                                        <div>Total Volume on current date:</div>
                                        <div
                                            className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.lastSale?.total_volume) || 0, Number(this.state.lastSale?.fractional_lot_size || 0))}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={'indicator__item statistics'}>
                                <div className="content__top">
                                    <div className="content__title">Company Description</div>
                                </div>

                                <div>
                                    <div>

                                    </div>
                                </div>
                                <div className={'indicator__item__data'}>
                                    {this.companyProfile?.business_description || '-'}
                                </div>
                            </div>

                        </div>


                        <DepthOfBookPerSymbolBlock
                            symbol={this.props.symbol}
                            isDashboard={true}
                        />

                        <LastSaleReportingPerSymbolBlock
                            symbol={this.props.symbol}
                            isDashboard={true}
                        />

                        <BestBidAndBestOfferPerSymbolBlock
                            symbol={this.props.symbol}
                            isDashboard={true}
                        />

                    </>
                )}
            </>
        );
    }

}

export default QuoteBoardPerSymbolBlock;
