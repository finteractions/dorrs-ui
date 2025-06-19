import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import bestBidAndBestOfferService from "@/services/bbo/best-bid-and-best-offer-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import symbolService from "@/services/symbol/symbol-service";
import downloadFile from "@/services/download-file/download-file";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {QuoteCondition} from "@/enums/quote-condition";
import NoDataBlock from "@/components/no-data-block";
import {AreaAndBarChart} from "@/components/chart/area-and-bar-chart";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faFilter, faSortAmountAsc} from "@fortawesome/free-solid-svg-icons";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";
import converterService from "@/services/converter/converter-service";
import AssetImage from "@/components/asset-image";


interface BestBidAndBestOfferPerSymbolBlockProps {
    symbol: string;
    isDashboard?: boolean;
}

interface BestBidAndBestOfferPerSymbolBlockState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    data: IBestBidAndBestOffer[];
    chart: string;
    mpid: string | null;
    isToggleBidOffer: boolean;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class BestBidAndBestOfferPerSymbolBlock extends React.Component<BestBidAndBestOfferPerSymbolBlockProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: BestBidAndBestOfferPerSymbolBlockState;
    isDashboard: boolean;

    tableRef: React.RefObject<any> = React.createRef();

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
            chart: 'b',
            mpid: null,
            isToggleBidOffer: false,
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }

        const host = `${window.location.protocol}//${window.location.host}`;

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
            columnHelper.accessor((row) => ({
                mpid: row.bid_mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "bid_mpid",
                cell: (item) =>
                    <>
                        {item.getValue().mpid && (
                            <div className={'cursor-pointer link table-image'}
                                 onClick={() => {
                                     this.handleMPID(item.getValue().mpid);
                                 }}
                            >
                                <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                             height={28}/>
                                {item.getValue().mpid}
                                <div className={'d-flex gap-3 align-items-center'}>
                                    <div className={'img-logo'}><AssetImage alt=''
                                                                                     src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                                                                     height={28}/></div>
                                    <span>{item.getValue().mpid}</span>
                                </div>
                            </div>
                        )}
                    </>,
                header: () => <span>Bid MPID</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
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
            columnHelper.accessor((row) => ({
                mpid: row.offer_mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "offer_mpid",
                cell: (item) =>
                    <>
                        {item.getValue().mpid && (
                            <div className={'cursor-pointer link table-image'}
                                 onClick={() => {
                                     this.handleMPID(item.getValue().mpid);
                                 }}
                            >
                                <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                            height={28}/>
                                {item.getValue().mpid}
                            </div>
                        )}
                    </>,
                header: () => <span>Offer MPID</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
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

        tableFilters = [
            {key: 'origin', placeholder: 'Origin'},
            {key: 'quote_condition', placeholder: 'Quote Condition'},
            {key: 'bid_mpid', placeholder: 'Bid MPID'},
            {key: 'offer_mpid', placeholder: 'Offer MPID'},
            {key: 'uti', placeholder: 'UTI'},
        ]
    }

    componentDidMount() {
        window.addEventListener('click', this.handleClickOutside);
        this.setState({isLoading: true});
        this.getSymbols()
            .then(() => this.getBBOChart())
            .then(() => this.getBBO())
            .finally(() => this.setState({isLoading: false}))
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-best-bid-and-best-offer');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggleBidOffer: false});
        }
    };

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

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

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    let data = res || [];

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
                    const data = res || [];

                    data.forEach(s => {
                        s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
                    })

                    this.setState({data: data},);
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

    downloadBBOCSV = () => {
        if (this.tableRef.current) {
            bestBidAndBestOfferService.downloadBestBidAndBestOfferBySymbol(this.props.symbol, this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('bbo', res);
            })
        }
    }

    downloadBBOXLSX = () => {
        if (this.tableRef.current) {
            bestBidAndBestOfferService.downloadBestBidAndBestOfferBySymbol(this.props.symbol, this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('bbo', res);
            })
        }
    }

    getChart = (chart: string) => {
        this.setState({isLoadingChart: true, chart: chart, isToggleBidOffer: false}, () => {
            this.getBBOChart();
        });
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    toggleBidOfferMenu = () => {
        this.setState({isToggleBidOffer: !this.state.isToggleBidOffer})
    };

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
                                        <div className={"company-profile-logo"}>
                                            <AssetImage alt=''
                                                        src={this.companyProfile?.logo}
                                                        width={60}
                                                        height={60}/>
                                        </div>
                                        {this.companyProfile ? (
                                            <>
                                                {this.companyProfile.company_name} ({this.props.symbol})
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
                                            <div className="filter-menu filter-menu-best-bid-and-best-offer">
                                                <Button
                                                    variant="link"
                                                    className="d-md-none admin-table-btn ripple"
                                                    type="button"
                                                    onClick={this.toggleBidOfferMenu}
                                                >
                                                    {this.state.isToggleBidOffer ? (
                                                        <FontAwesomeIcon icon={faSortAmountAsc}/>
                                                    ) : (
                                                        <FontAwesomeIcon icon={faSortAmountDesc}/>
                                                    )}
                                                </Button>

                                                <ul className={`${this.state.isToggleBidOffer ? 'open' : ''}`}>
                                                    <li>
                                                        <button
                                                            className={`border-grey-btn ripple d-flex ${this.state.chart === 'b' ? 'active' : ''}`}
                                                            onClick={() => this.getChart('b')}>
                                                            <span>Bid</span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            className={`border-grey-btn ripple d-flex ${this.state.chart === 'a' ? 'active' : ''}`}
                                                            onClick={() => this.getChart('a')}>
                                                            <span>Offer</span>
                                                        </button>
                                                    </li>
                                                </ul>

                                            </div>
                                        </div>
                                        {this.charts.length ? (
                                            <div className={'mb-48'}>
                                                <AreaAndBarChart data={this.charts}/>
                                            </div>
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
                                        <div className="filter-menu filter-menu-best-bid-and-best-offer">
                                            <Button
                                                variant="link"
                                                className="d-md-none admin-table-btn ripple"
                                                type="button"
                                                onClick={this.toggleMenu}
                                            >
                                                <FontAwesomeIcon icon={faFileExport}/>
                                            </Button>
                                            <ul className={`${this.state.isToggle ? 'open' : ''}`}>
                                                <li>
                                                    <button className="border-grey-btn ripple d-flex"
                                                            onClick={this.downloadBBOCSV}>
                                                        <span className="file-item__download"></span>
                                                        <span>CSV</span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="border-grey-btn ripple d-flex"
                                                            onClick={this.downloadBBOXLSX}>
                                                        <span className="file-item__download"></span>
                                                        <span>XLSX</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <Button
                                            variant="link"
                                            className="d-md-none admin-table-btn ripple"
                                            type="button"
                                            onClick={() => this.handleShowFilters()}
                                        >
                                            <FontAwesomeIcon icon={faFilter}/>
                                        </Button>
                                    </div>
                                )}


                                <Table columns={columns}
                                       data={this.state.data}
                                       searchPanel={true}
                                       block={this}
                                       editBtn={false}
                                       viewBtn={false}
                                       filters={tableFilters}
                                       filtersClassName={this.state.filtersClassName}
                                       ref={this.tableRef}
                                />

                            </div>
                        </div>

                        <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value: any) => this.handleMPID(value)}/>
                    </>
                )}
            </>
        );
    }

}

export default BestBidAndBestOfferPerSymbolBlock;
