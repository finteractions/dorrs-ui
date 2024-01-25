import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import bboService from "@/services/bbo/bbo-service";
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
import ordersService from "@/services/orders/orders-service";
import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IDepthByPrice} from "@/interfaces/i-depth-by-price";


interface DOBPerSymbolProps {
    symbol: string;
}

interface DOBPerSymbolState extends IState {
    isLoading: boolean;
    isDataLoading: boolean;
    errors: string[];
    dataDepthByOrder: IDepthByOrder[];
    dataDepthByOrderFull: IDepthByOrder[];
    filterDataDepthByOrder: any;
    dataDepthByPrice: IDepthByOrder[];
    dataDepthByPriceFull: IDepthByOrder[];
    filterDataDepthByPrice: any;
    type: string;
}

const columnHelperByOrder = createColumnHelper<any>();
let columnsByOrder: any[] = [];

const columnHelperByPrice = createColumnHelper<any>();
let columnsByPrice: any[] = [];

class DOBPerSymbolBlock extends React.Component<DOBPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    state: DOBPerSymbolState;

    constructor(props: DOBPerSymbolProps) {
        super(props);

        this.companyProfile = null;

        this.state = {
            success: false,
            isLoading: true,
            isDataLoading: true,
            errors: [],
            dataDepthByOrder: [],
            dataDepthByOrderFull: [],
            filterDataDepthByOrder: [],
            dataDepthByPrice: [],
            dataDepthByPriceFull: [],
            filterDataDepthByPrice: [],
            type: 'by_order'
        }


        columnsByOrder = [
            columnHelperByOrder.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Bid MPID </span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_quantity, {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Size </span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Price </span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_quote_condition, {
                id: "bid_quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>Bid QC</span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_updated_at, {
                id: "bid_updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Bid Updated Date</span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_mpid, {
                id: "offer_mpid",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Offer MPID </span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_quantity, {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Size </span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Price </span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_quote_condition, {
                id: "offer_quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>Offer QC</span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_updated_at, {
                id: "offer_updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Offer Updated Date</span>,
            }),
        ];

        columnsByPrice = [
            columnHelperByPrice.accessor((row) => row.bid_count, {
                id: "bid_count",
                cell: (item) => formatterService.numberFormat(item.getValue(), 0),
                header: () => <span>Bid Count </span>,
            }),
            columnHelperByPrice.accessor((row) => row.bid_quantity, {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Size </span>,
            }),
            columnHelperByPrice.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Price </span>,
            }),
            columnHelperByPrice.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Price </span>,
            }),
            columnHelperByPrice.accessor((row) => row.offer_quantity, {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Size </span>,
            }),
            columnHelperByPrice.accessor((row) => row.offer_count, {
                id: "offer_count",
                cell: (item) => formatterService.numberFormat(item.getValue(), 0),
                header: () => <span>Offer Count </span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true, isDataLoading: true});
        this.getSymbols()
            .then(() => this.getData())
    }

    filterDataDepthByOrder = () => {
        this.setState({dataDepthByOrder: filterService.filterData(this.state.filterDataDepthByOrder, this.state.dataDepthByOrderFull)});
    }

    filterDataDepthByPrice = () => {
        this.setState({dataDepthByPrice: filterService.filterData(this.state.filterDataDepthByPrice, this.state.dataDepthByPriceFull)});
    }

    getSymbols = () => {
        return new Promise((resolve) => {
            symbolService.getSymbols()
                .then((res: Array<ISymbol>) => {
                    const dataDepthByOrder = res?.sort((a, b) => {
                        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                    }) || [];

                    const symbol = dataDepthByOrder.find((s: ISymbol) => s.symbol === this.props.symbol);
                    this.companyProfile = symbol?.company_profile || null;
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoading: false})
                    resolve(true)
                });
        })

    }

    getDepthByOrder = () => {
        return new Promise((resolve) => {
            ordersService.getDepthByOrder(this.props.symbol)
                .then((res: Array<IDepthByOrder>) => {
                    const dataDepthByOrder = res || [];

                    dataDepthByOrder.forEach(s => {
                        s.bid_quote_condition = QuoteCondition[s.bid_quote_condition as keyof typeof QuoteCondition] || ''
                        s.offer_quote_condition = QuoteCondition[s.offer_quote_condition as keyof typeof QuoteCondition] || ''
                    })

                    this.setState({dataDepthByOrderFull: dataDepthByOrder, dataDepthByOrder: dataDepthByOrder}, () => {
                        this.filterDataDepthByOrder();
                    });
                })
                .catch((errors: IError) => {
                    this.setState({dataDepthByOrderFull: [], dataDepthByOrder: []}, () => {
                        this.filterDataDepthByOrder();
                    });
                })
                .finally(() => {
                    this.setState({isDataLoading: false})
                    resolve(true);
                });
        })

    }

    getDepthByPrice = () => {
        return new Promise((resolve) => {
            ordersService.getDepthByPrice(this.props.symbol)
                .then((res: Array<IDepthByPrice>) => {
                    const dataDepthByPrice = res || [];

                    this.setState({dataDepthByPriceFull: dataDepthByPrice, dataDepthByPrice: dataDepthByPrice}, () => {
                        this.filterDataDepthByPrice();
                    });
                })
                .catch((errors: IError) => {
                    this.setState({dataDepthByPriceFull: [], dataDepthByPrice: []}, () => {
                        this.filterDataDepthByPrice();
                    });
                })
                .finally(() => {
                    this.setState({isDataLoading: false})
                    resolve(true);
                });
        })

    }
    handleBack = () => {
        const router = useRouter();
        router.push('/best-bid-and-best-offer');
    }

    onCallback = async (values: any, step: boolean) => {
        await this.getDepthByOrder();
    };


    setType = (type: string) => {
        this.setState({isDataLoading: true, type: type}, async () => {
            await this.getData();
        });
    }

    getData = async () => {
        switch (this.state.type) {
            case 'by_order':
                await this.getDepthByOrder()
                break;
            case 'by_price':
                await this.getDepthByPrice()
                break;
        }
    }

    getTableRender = () => {
        switch (this.state.type) {
            case 'by_order':
                return (
                    <Table columns={columnsByOrder}
                           data={this.state.dataDepthByOrder}
                           block={this}
                    />
                )
            case 'by_price':
                return (
                    <Table columns={columnsByPrice}
                           data={this.state.dataDepthByPrice}
                           block={this}
                    />
                )
            default:
                return (
                    <></>
                )
        }
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
                                    href="/depth-of-book"

                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>
                        <div className={'panel'}>
                            <div className={`content__bottom`}>

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


                                    <div className={'content__top px-0 border-bottom-0'}>
                                        <div className="">
                                            Depth of Book Snapshot
                                        </div>
                                        <div
                                            className="content__title_btns content__filter download-buttons justify-content-end mb-24">
                                            <button
                                                className={`border-grey-btn ripple d-flex ${this.state.type === 'by_order' ? 'active' : ''} ${this.state.isDataLoading ? 'disable' : ''}`}
                                                disabled={this.state.isLoading || this.state.isDataLoading}
                                                onClick={() => this.setType('by_order')}>
                                                <span>By Order</span>
                                            </button>
                                            <button
                                                className={`border-grey-btn ripple d-flex ${this.state.type === 'by_price' ? 'active' : ''} ${this.state.isDataLoading ? 'disable' : ''}`}
                                                disabled={this.state.isLoading || this.state.isDataLoading}
                                                onClick={() => this.setType('by_price')}>
                                                <span>By Price</span>
                                            </button>
                                        </div>
                                    </div>


                                    <div className={'content__bottom px-0'}>
                                        {this.state.isDataLoading ? (
                                            <LoaderBlock/>
                                        ) : (
                                            <>
                                                {this.getTableRender()}
                                            </>
                                        )}
                                    </div>


                                </>
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

}

export default DOBPerSymbolBlock;
