import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import bestBidAndBestOfferService from "@/services/bbo/best-bid-and-best-offer-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import symbolService from "@/services/symbol/symbol-service";
import downloadFile from "@/services/download-file/download-file";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {QuoteCondition} from "@/enums/quote-condition";
import NoDataBlock from "@/components/no-data-block";
import {AreaAndBarChart} from "@/components/chart/area-and-bar-chart";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";


interface BestBidAndBestOfferPerSymbolBlockProps {
    symbol: string;
    isDashboard?: boolean;
}

interface BestBidAndBestOfferPerSymbolBlockState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    data: IBestBidAndBestOffer[];
    dataFull: IBestBidAndBestOffer[];
    filterData: any;
    chart: string;
    mpid: string | null;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class BestBidAndBestOfferPerSymbolBlock extends React.Component<BestBidAndBestOfferPerSymbolBlockProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: BestBidAndBestOfferPerSymbolBlockState;
    isDashboard: boolean;

    constructor(props: BestBidAndBestOfferPerSymbolBlockProps) {
        super(props);

        this.companyProfile = null;
        this.isDashboard = this.props.isDashboard ?? false;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            data: [],
            dataFull: [],
            filterData: [],
            chart: 'b',
            mpid: null
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
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
                    </div>,
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
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
                    </div>,
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
            .then(() => this.getBBOChart())
            .then(() => this.getBBO())
            .finally(() => this.setState({isLoading: false}))
    }

    getBBOChart = () => {
        return new Promise((resolve) => {
            bestBidAndBestOfferService.getBestBidAndBestOfferChartBySymbol(this.props.symbol, this.state.chart)
                .then((res: Array<ITradingView>) => {
                    this.charts = res;
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoadingChart: false})
                    resolve(true);
                });
        })

    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
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
            bestBidAndBestOfferService.getBestBidAndBestOfferBySymbol(this.props.symbol)
                .then((res: Array<IBestBidAndBestOffer>) => {
                    const data = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

                    data.forEach(s => {
                        s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
                    })

                    this.setState({dataFull: data, data: data}, () => {
                        this.filterData();
                    });
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

    onCallback = async (values: any, step: boolean) => {
        this.getBBO();
    };

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }

    downloadBBOCSV = () => {
        bestBidAndBestOfferService.downloadBestBidAndBestOfferBySymbol(this.props.symbol, this.state.filterData).then((res) => {
            downloadFile.CSV('bbo', res);
        })
    }

    downloadBBOXLSX = () => {
        bestBidAndBestOfferService.downloadBestBidAndBestOfferBySymbol(this.props.symbol, this.state.filterData).then((res) => {
            downloadFile.XLSX('bbo', res);
        })
    }

    getChart = (chart: string) => {
        this.setState({isLoadingChart: true, chart: chart}, () => {
            this.getBBOChart();
        });
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        {!this.isDashboard && (
                            <div className="d-flex align-items-center justify-content-between flex-1">
                                <div className="login__bottom">
                                    <p>
                                        <i className="icon-chevron-left"/> <Link
                                        className="login__link"
                                        href="/best-bid-and-best-offer"

                                    >Back
                                    </Link>
                                    </p>
                                </div>
                            </div>
                        )}


                        <div className={'panel'}>
                            <div className={`content__bottom`}>

                                {!this.isDashboard ? (
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
                                ) : (
                                    <div className={'content__top  px-0 border-bottom-0'}>
                                        <div className={'content__title'}>
                                            Best Bid and Best Offer
                                        </div>
                                    </div>
                                )}

                                {this.state.isLoadingChart ? (
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        <div
                                            className="content__title_btns content__filter download-buttons justify-content-end mb-24">
                                            <button
                                                className={`border-grey-btn ripple d-flex ${this.state.chart === 'b' ? 'active' : ''}`}
                                                onClick={() => this.getChart('b')}>
                                                <span>Bid</span>
                                            </button>
                                            <button
                                                className={`border-grey-btn ripple d-flex ${this.state.chart === 'a' ? 'active' : ''}`}
                                                onClick={() => this.getChart('a')}>
                                                <span>Offer</span>
                                            </button>
                                        </div>
                                        {this.charts.length ? (
                                            <AreaAndBarChart data={this.charts}/>
                                        ) : (
                                            <div className="no-chart mb-24">
                                                <NoDataBlock primaryText="No Chart available yet"/>
                                            </div>
                                        )}

                                    </>
                                )}

                                {!this.isDashboard && (
                                    <div
                                        className="content__title_btns content__filter download-buttons justify-content-end mb-24">
                                        <button className="border-grey-btn ripple d-flex"
                                                onClick={this.downloadBBOCSV}>
                                            <span className="file-item__download"></span>
                                            <span>CSV</span>
                                        </button>
                                        <button className="border-grey-btn ripple d-flex"
                                                onClick={this.downloadBBOXLSX}>
                                            <span className="file-item__download"></span>
                                            <span>XLSX</span>
                                        </button>
                                    </div>
                                )}

                                <div className="content__filter mb-3">
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('origin', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('origin', item)}
                                            options={filterService.buildOptions('origin', this.state.dataFull)}
                                            placeholder="Origin"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('quote_condition', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('quote_condition', item)}
                                            options={filterService.buildOptions('quote_condition', this.state.dataFull)}
                                            placeholder="Quote Condition"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('bid_mpid', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('bid_mpid', item)}
                                            options={filterService.buildOptions('bid_mpid', this.state.dataFull)}
                                            placeholder="Bid MPID"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('offer_mpid', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('offer_mpid', item)}
                                            options={filterService.buildOptions('offer_mpid', this.state.dataFull)}
                                            placeholder="Offer MPID"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('uti', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('uti', item)}
                                            options={filterService.buildOptions('uti', this.state.dataFull)}
                                            placeholder="UTI"
                                        />
                                    </div>
                                    <button
                                        className="content__filter-clear ripple"
                                        onClick={this.handleResetButtonClick}>
                                        <FontAwesomeIcon className="nav-icon"
                                                         icon={filterService.getFilterResetIcon()}/>
                                    </button>
                                </div>

                                <Table columns={columns}
                                       data={this.state.data}
                                       searchPanel={true}
                                       block={this}
                                       editBtn={false}
                                       viewBtn={false}
                                />

                            </div>
                        </div>

                        <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value:any) => this.handleMPID(value)}/>
                    </>
                )}
            </>
        );
    }

}

export default BestBidAndBestOfferPerSymbolBlock;
