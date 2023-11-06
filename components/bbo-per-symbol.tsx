import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import bboService from "@/services/bbo/bbo-service";
import {IBBO} from "@/interfaces/i-bbo";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import {TradingViewWidget} from "@/components/trading-view-widget";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import symbolService from "@/services/symbol/symbol-service";
import downloadFile from "@/services/download-file/download-file";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";


interface BBOPerSymbolProps {
    symbol: string;
}

interface BBOPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
    data: IBBO[];
    dataFull: IBBO[];
    filterData: any;
    chart: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class BBOPerSymbolBlock extends React.Component<BBOPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: BBOPerSymbolState;

    constructor(props: BBOPerSymbolProps) {
        super(props);

        this.companyProfile = null;

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
            data: [],
            dataFull: [],
            filterData: [],
            chart: 'b'
        }


        columns = [
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
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.bid_time, {
                id: "bid_time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
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
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.offer_time, {
                id: "offer_time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
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
        this.getSymbols();
        this.getBBOChart();
        this.getBBO();

    }

    getBBOChart = () => {
        bboService.getBBOChartBySymbol(this.props.symbol, this.state.chart)
            .then((res: Array<ITradingView>) => {
                this.charts = res;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoadingChart: false});
            });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    getSymbols = () => {
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

            });
    }

    getBBO = () => {
        bboService.getBBOBySymbol(this.props.symbol)
            .then((res: Array<IBBO>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false});
            });
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
        bboService.downloadBBOBySymbol(this.props.symbol, this.state.filterData).then((res) => {
            downloadFile.CSV('bbo', res);
        })
    }

    downloadBBOXLSX = () => {
        bboService.downloadBBOBySymbol(this.props.symbol, this.state.filterData).then((res) => {
            downloadFile.XLSX('bbo', res);
        })
    }

    getChart = (chart: string) => {
        this.setState({isLoadingChart: true, chart: chart});
        this.getBBOChart();
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
                                    href="/best-bid-and-best-offer"

                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>
                        <div className={'panel'}>
                            <div className={`content__bottom ${this.state.data.length ? '' : 'd-none'}`}>

                                <>
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
                                                    className={`border-grey-btn ripple d-flex ${this.state.chart === 's' ? 'active' : ''}`}
                                                    onClick={() => this.getChart('s')}>
                                                    <span>Offer</span>
                                                </button>
                                            </div>
                                            <TradingViewWidget data={this.charts}/>
                                        </>
                                    )}


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


                                    <div className="content__filter mb-3">
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

                                </>
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default BBOPerSymbolBlock;
