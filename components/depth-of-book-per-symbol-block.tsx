import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import filterService from "@/services/filter/filter";
import symbolService from "@/services/symbol/symbol-service";
import {ISymbol} from "@/interfaces/i-symbol";
import {ICompanyProfile} from "@/interfaces/i-company-profile";
import {QuoteCondition} from "@/enums/quote-condition";
import ordersService from "@/services/orders/orders-service";
import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IDepthByPrice} from "@/interfaces/i-depth-by-price";
import DepthOfBookHistoryBlock from "@/components/depth-of-book-history-block";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import userPermissionService from "@/services/user/user-permission-service";
import {IOrder} from "@/interfaces/i-order";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import tableColorizationService from "@/services/colorization/table-colorization-service";
import {RGB} from "@/interfaces/i-rgb"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faSortAmountAsc,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";
import converterService from "@/services/converter/converter-service";

interface DepthOfBookPerSymbolProps {
    symbol: string;
    isDashboard?: boolean;
}

interface DepthOfBookPerSymbolState extends IState {
    isLoading: boolean;
    isDataLoading: boolean;
    errors: string[];
    dataDepthByOrder: IDepthByOrder[];
    byOrderRowProps: ITableRowProps;
    dataDepthByOrderFull: IDepthByOrder[];
    filterDataDepthByOrder: any;
    dataDepthByPrice: IDepthByPrice[];
    dataDepthByPriceFull: IDepthByPrice[];
    filterDataDepthByPrice: any;
    type: string;
    mpid: string | null;
    pageLengthByOrder: number
    pageLengthByPrice: number;
    isToggle: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

const columnHelperByOrder = createColumnHelper<any>();
let columnsByOrder: any[] = [];

const columnHelperByPrice = createColumnHelper<any>();
let columnsByPrice: any[] = [];

const pageLength = Number(10)
const colorizeLimit = Number(10)

const defaultColors = {
    light: {
        bid: new RGB(200, 211, 187),
        ask: new RGB(213, 195, 195),
    },
    dark: {
        bid: new RGB(60, 84, 76),
        ask: new RGB(80, 59, 59),
    },
};

class DepthOfBookPerSymbolBlock extends React.Component<DepthOfBookPerSymbolProps> {

    companyProfile: ICompanyProfile | null;
    state: DepthOfBookPerSymbolState;
    isDashboard: boolean;
    getOrdersInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    orderAccess = {view: false, create: false, edit: false, delete: false}

    depthOfBookHistoryBlockRef: React.RefObject<DepthOfBookHistoryBlock> = React.createRef();

    constructor(props: DepthOfBookPerSymbolProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.companyProfile = null;
        this.isDashboard = this.props.isDashboard ?? false;

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
            type: 'by_order',
            mpid: null,
            byOrderRowProps: {},
            pageLengthByOrder: pageLength,
            pageLengthByPrice: pageLength,
            isToggle: false
        }

        this.orderAccess = userPermissionService.getAccessRulesByKey(
            'dob',
            this.context.userProfile.access
        ).values


        columnsByOrder = [
            columnHelperByOrder.accessor((row) => row.bid_origin, {
                id: "bid_origin",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Origin </span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) => {
                    const value = item.getValue();

                    return (
                        <div className={'cursor-pointer link'}
                             onClick={() => {
                                 this.handleMPID(value);
                             }}
                        >
                            {value}
                        </div>
                    )
                },
                header: () => <span>Bid MPID </span>,
            }),
            columnHelperByOrder.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Size</span>,
            }),
            columnHelperByOrder.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
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
            columnHelperByOrder.accessor((row) => row.offer_origin, {
                id: "offer_origin",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Origin </span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_mpid, {
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
            columnHelperByOrder.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Size</span>,
            }),
            columnHelperByOrder.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
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
            columnHelperByOrder.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Size</span>,
            }),
            columnHelperByPrice.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price </span>,
            }),
            columnHelperByPrice.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
            columnHelperByOrder.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Size</span>,
            }),
            columnHelperByPrice.accessor((row) => row.offer_count, {
                id: "offer_count",
                cell: (item) => formatterService.numberFormat(item.getValue(), 0),
                header: () => <span>Offer Count </span>,
            }),
        ];
    }

    componentDidMount() {
        window.addEventListener('themeToggle', this.handleTheme);
        window.addEventListener('resize', this.handleTheme);
        window.addEventListener('click', this.handleClickOutside);

        this.setState({isLoading: true, isDataLoading: true});
        this.getSymbols()
            .then(() => this.getData())

        this.startAutoUpdate();
    }

    componentWillUnmount() {
        window.removeEventListener('themeToggle', this.handleTheme);
        window.removeEventListener('resize', this.handleTheme);
        window.removeEventListener('click', this.handleClickOutside);

        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getOrdersInterval = setInterval(this.getData, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getOrdersInterval) clearInterval(this.getOrdersInterval);
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

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
                    const dataDepthByOrder = res || [];
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

                    this.setState({dataDepthByOrderFull: dataDepthByOrder}, () => {
                        this.filterDataDepthByOrder();
                    });
                })
                .catch((errors: IError) => {
                    this.setState({dataDepthByOrderFull: [], dataDepthByOrder: []}, () => {
                        this.filterDataDepthByOrder();
                    });
                })
                .finally(() => {
                    this.setState({isDataLoading: false}, () => {
                        this.handleTheme();
                    })
                    resolve(true);
                });
        })
    }

    handleTheme = () => {

        const colours = this.isDarkTheme() ? defaultColors.dark : defaultColors.light
        const rowProps: ITableRowProps = {}
        let bid: IDepthByOrder[] = [];
        let ask: IDepthByOrder[] = [];
        let data: IDepthByOrder[] = [];
        let count: number = 0;
        let askReverseColour = false;

        const dataFull = this.state.dataDepthByOrderFull.map(item => {
            return {...item};
        });

        if (window.innerWidth < 768) {
            dataFull.forEach(item => {
                const bidItem = {...item}
                const askItem = {...item}

                if (bidItem && bidItem.bid_quantity && parseFloat(bidItem.bid_quantity) > 0.0) {
                    bidItem.offer_origin = null;
                    bidItem.offer_mpid = null;
                    bidItem.offer_quantity = null;
                    bidItem.offer_price = null;
                    bidItem.offer_quote_condition = null;
                    bidItem.offer_updated_at = null;
                    bid.push(bidItem);
                }
                if (askItem && askItem.offer_quantity && parseFloat(askItem.offer_quantity) > 0.0) {
                    askItem.bid_origin = null;
                    askItem.bid_mpid = null;
                    askItem.bid_quantity = null;
                    askItem.bid_price = null;
                    askItem.bid_quote_condition = null;
                    askItem.bid_updated_at = null;
                    ask.push(askItem);
                }
            });

            bid = [...bid.slice(0, pageLength)]
            ask = [...ask.slice(0, pageLength).reverse()]
            data = [...bid, ...ask];
            count = data.length

            askReverseColour = true;
        } else {
            data = dataFull
            count = pageLength
            askReverseColour = false;
        }

        this.setState({dataDepthByOrder: data, pageLengthByOrder: count}, async () => {
            rowProps.row = await tableColorizationService.depthOfBookByOrder(data, colours, count, pageLength, columnsByOrder.length, colorizeLimit, askReverseColour)
            this.setState({byOrderRowProps: rowProps})
        })
    }

    isDarkTheme = () => {
        return document.documentElement.classList.contains('dark');
    };

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
        await this.getData();
    };


    setType = (type: string) => {
        this.setState({isDataLoading: true, type: type, isToggle: false}, async () => {
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
                           pageLength={this.state.pageLengthByOrder}
                           rowProps={this.state.byOrderRowProps}
                           data={this.state.dataDepthByOrder}
                           block={this}
                    />
                )
            case 'by_price':
                return (
                    <Table columns={columnsByPrice}
                           pageLength={this.state.pageLengthByPrice}
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

    openModal = (mode: string, data?: IOrder) => {
        this.depthOfBookHistoryBlockRef.current?.openModal(mode, data);
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
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
                                        href="/depth-of-book"

                                    >Back
                                    </Link>
                                    </p>
                                </div>
                            </div>
                        )}


                        {!this.isDashboard && (
                            <div className={'panel'}>
                                <div className="content__bottom d-flex justify-content-between">
                                    <h2 className={'view_block_main_title mb-0'}>
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
                        )}


                        <div className={'panel'}>

                            <div className="content__top">
                                <div className="content__title">Depth of Book Snapshot</div>
                                <div
                                    className="content__title_btns content__filter download-buttons justify-content-end mb-24 ">
                                    <div className="filter-menu">
                                        <Button
                                            variant="link"
                                            className="d-md-none admin-table-btn ripple"
                                            type="button"
                                            onClick={this.toggleMenu}
                                        >
                                            {this.state.isToggle ? (
                                                <FontAwesomeIcon icon={faSortAmountAsc}/>
                                            ) : (
                                                <FontAwesomeIcon icon={faSortAmountDesc}/>
                                            )}
                                        </Button>

                                        <ul className={`${this.state.isToggle ? 'open' : ''}`}>
                                            <li>
                                                <button
                                                    className={`border-grey-btn ripple d-flex ${this.state.type === 'by_order' ? 'active' : ''} ${this.state.isDataLoading ? 'disable' : ''}`}
                                                    disabled={this.state.isLoading || this.state.isDataLoading}
                                                    onClick={() => this.setType('by_order')}>
                                                    <span>By Order</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className={`border-grey-btn ripple d-flex ${this.state.type === 'by_price' ? 'active' : ''} ${this.state.isDataLoading ? 'disable' : ''}`}
                                                    disabled={this.state.isLoading || this.state.isDataLoading}
                                                    onClick={() => this.setType('by_price')}>
                                                    <span>By Price</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>


                            <div className={'content__bottom'}>
                                {this.state.isDataLoading ? (
                                    <LoaderBlock/>
                                ) : (
                                    <>
                                        {this.getTableRender()}
                                    </>
                                )}
                            </div>

                        </div>

                        {!this.isDashboard && (
                            <DepthOfBookHistoryBlock
                                access={this.orderAccess}
                                ref={this.depthOfBookHistoryBlockRef}
                                symbol={this.props.symbol}
                                onCallback={this.onCallback}/>
                        )}

                        <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value: any) => this.handleMPID(value)}/>
                    </>
                )}


            </>
        );
    }

}

export default DepthOfBookPerSymbolBlock
