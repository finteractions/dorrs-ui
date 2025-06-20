import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AssetImage from "@/components/asset-image";
import {IMarketLastSaleStatistics} from "@/interfaces/i-market-last-sale-statistics";
import statisticsService from "@/services/statistics/statistics-service";
import {faPlus, faMinus, faThLarge, faList, faEye, faSortAmountAsc, faSquare} from "@fortawesome/free-solid-svg-icons";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";
import {getGlobalConfig} from "@/utils/global-config";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {faSortAmountDesc} from "@fortawesome/free-solid-svg-icons/faSortAmountDesc";
import {Button} from "react-bootstrap";
import converterService from "@/services/converter/converter-service";


interface QuoteBoardBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IMarketLastSaleStatistics[];
    dataList: IMarketLastSaleStatistics[];
    dataListFull: IMarketLastSaleStatistics[];
    filterDataList: any;
    dataWatchList: IMarketLastSaleStatistics[];
    dataWatchListFull: IMarketLastSaleStatistics[];
    filterDataWatchList: any;
    quoteModeView: string;
    favouriteSymbolList: Array<string>;
    isToggle: boolean;
}

interface QuoteBoardBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}


const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

const PATH_FAVOURITE_LIST = `${getGlobalConfig().host}-favouriteSymbolList`;
const PATH_MODE_VIEW = `${getGlobalConfig().host}-quoteView`;

class QuoteBoardBlock extends React.Component<QuoteBoardBlockProps, QuoteBoardBlockState> {

    host = `${window.location.protocol}//${window.location.host}`;

    state: QuoteBoardBlockState;
    errors: Array<string> = new Array<string>();
    getBBOInterval: NodeJS.Timer | number | undefined;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    customBtns: Array<ICustomButtonProps> = [
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faPlus}/>,
            onCallback: 'addToFavourites'
        }
    ]

    customBtnsWatchList: Array<ICustomButtonProps> = [
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faMinus}/>,
            onCallback: 'removeFromFavorites'
        }
    ]

    constructor(props: QuoteBoardBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        const favouriteSymbolList = JSON.parse(localStorage.getItem(PATH_FAVOURITE_LIST) || '[]');
        const quoteModeView = localStorage.getItem(PATH_MODE_VIEW) || 'tile';

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: [],
            dataList: [],
            dataListFull: [],
            filterDataList: [],
            dataWatchList: [],
            dataWatchListFull: [],
            filterDataWatchList: [],
            favouriteSymbolList: favouriteSymbolList,
            quoteModeView: quoteModeView,
            isToggle: false
        }


        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div onClick={() => {
                        this.navigate('quote-board', item.getValue().symbol)
                    }}
                         className={`table-image cursor-pointer link`}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${this.host}${item.getValue().image}` : ''}
                                        height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => ({
                company_name: row.company_profile?.company_name || '',
            }), {
                id: "company_name",
                cell: (item) => item.getValue().company_name,
                header: () => <span>Company </span>,
            }),
            columnHelper.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Last Price </span>,
            }),
            columnHelper.accessor((row) => row.price_changed, {
                id: "price_changed",
                cell: (item) => formatterService.formatAndColorNumberValueHTML(item.getValue()),
                header: () => <span>Price Change</span>,
            }),
            columnHelper.accessor((row) => row.percentage_changed, {
                id: "percentage_changed",
                cell: (item) => formatterService.formatAndColorNumberBlockHTML(item.getValue()),
                header: () => <span>% Change</span>,
            }),
            columnHelper.accessor((row) => ({
                vwap: row.vwap,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "vwap",
                cell: (item) => formatterService.numberFormat(item.getValue().vwap, decimalPlaces),
                header: () => <span>VWAP (90 Days)</span>,
            }),
        ];
    }

    navigate = (mode: string, symbol: string, optional?: string) => {
        this.props.onCallback(mode, symbol, optional);
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getMarketStatistics();
        this.startAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    startAutoUpdate = () => {
        this.getBBOInterval = setInterval(this.getMarketStatistics, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getBBOInterval) clearInterval(this.getBBOInterval as number);
    }

    getMarketStatistics = () => {
        statisticsService.getMarketData<IMarketLastSaleStatistics>('last-sale')
            .then((res: Array<IMarketLastSaleStatistics>) => {
                let data = res || [];
                data = data.filter(s => s.latest_update)
                this.setState({data: data}, () => {
                    this.prepareData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    prepareData = () => {
        const {data} = this.state;
        const watchDataList = data.filter(item => {
            return this.state.favouriteSymbolList.includes(item.symbol_name)
        });

        const dataList = data.filter(item => {
            return !this.state.favouriteSymbolList.includes(item.symbol_name)
        });

        this.setState({dataWatchListFull: watchDataList, dataWatchList: watchDataList}, () => {
            this.filterWatchData();
        });

        this.setState({dataListFull: dataList, dataList: dataList}, () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({dataList: filterService.filterData(this.state.filterDataList, this.state.dataListFull)});
    }

    filterWatchData = () => {
        this.setState({dataWatchList: filterService.filterData(this.state.filterDataWatchList, this.state.dataWatchListFull)});
    }

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterDataList: {...this.state.filterDataList, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    handleResetButtonClick = () => {
        this.setState({dataList: this.state.dataListFull, filterDataList: []});
    }

    addToFavourites = (data: any) => {
        const {favouriteSymbolList} = this.state;

        if (!favouriteSymbolList.includes(data.symbol_name)) {
            const updatedFavouriteSymbolList = new Set([...favouriteSymbolList, data.symbol_name]);
            const updatedFavouriteSymbolArray = Array.from(updatedFavouriteSymbolList);

            this.setState({favouriteSymbolList: updatedFavouriteSymbolArray}, () => {
                this.updateFavouriteSymbolList()
                    .then(() => this.prepareData())
            });
        }
    }

    removeFromFavorites = (statistics: IMarketLastSaleStatistics) => {
        const {favouriteSymbolList} = this.state;
        const updatedFavouriteSymbolList = favouriteSymbolList.filter(item => item !== statistics.symbol_name);

        this.setState({favouriteSymbolList: updatedFavouriteSymbolList}, () => {
            this.updateFavouriteSymbolList()
                .then(() => this.prepareData())
        });
    }

    updateFavouriteSymbolList = () => {
        return new Promise(resolve => {
            localStorage.setItem(PATH_FAVOURITE_LIST, JSON.stringify(this.state.favouriteSymbolList));
            resolve(true);
        })
    }

    setModeView = (mode: string) => {
        this.setState({quoteModeView: mode, isToggle: false}, async () => {
            await this.updateModeView()
        });
    }

    updateModeView = () => {
        return new Promise(resolve => {
            localStorage.setItem(PATH_MODE_VIEW, this.state.quoteModeView);
            resolve(true);
        })
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    getViewRender = () => {
        switch (this.state.quoteModeView) {
            case 'table':
                return (
                    <>

                        {this.state.dataWatchList.length > 0 && (
                            <div className={'panel'}>
                                <div className="content__top">
                                    <div className="content__title">Watch List</div>
                                </div>

                                <div className={'content__bottom'}>
                                    <Table columns={columns}
                                           data={this.state.dataWatchList}
                                           customBtnProps={this.customBtnsWatchList}
                                           block={this}
                                        // access={this.props.access}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={'panel'}>
                            <div className="content__top">
                                <div className="content__title">Market Overview</div>
                            </div>
                            {this.state.dataList.length ? (
                                <>

                                    <div className={'content__bottom'}><Table columns={columns}
                                                                              data={this.state.dataList}
                                                                              customBtnProps={this.customBtns}
                                                                              block={this}
                                        // access={this.props.access}
                                    />

                                    </div>
                                </>
                            ) : (
                                <NoDataBlock/>
                            )}

                        </div>
                    </>
                )
            case 'tile':
                return (
                    <>
                        {this.state.dataWatchList.length > 0 && (
                            <>
                                <div className={'panel'}>
                                    <div className="content__top">
                                        <div className="content__title">Watch List</div>
                                    </div>
                                </div>
                                <div className="indicators content__bottom">
                                    {this.state.dataWatchList.map(item => (
                                        <div key={item.symbol_name}
                                             className={`indicator__item ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>
                                            <div className={''}>

                                                <div className={'table-image image-28 mix-blend-mode-multiple-img'}>
                                                    <AssetImage alt=''
                                                                src={item.company_profile?.logo}
                                                                width={28} height={28}/>
                                                </div>

                                                <div onClick={() => this.navigate('quote-board', item.symbol_name)}
                                                     className={`table-image cursor-pointer link`}>{item.symbol_name}
                                                </div>
                                            </div>

                                            <div className={'gap-10'}>
                                                <div title={'Remove from Watch List'}
                                                     className={'admin-table-actions'}>
                                                    <button
                                                        type="button"
                                                        className='custom-btn admin-table-btn ripple '
                                                        onClick={() => this.removeFromFavorites(item)}
                                                    >
                                                        <FontAwesomeIcon className="nav-icon" icon={faMinus}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={'indicator__item__data'}>
                                                <div>
                                                    <div>Last Price:</div>
                                                    <div><span className={'sign'}></span><span
                                                        className={'stay'}>{formatterService.numberFormat(Number(item.last_price), decimalPlaces)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div>Price Change:</div>
                                                    <div>{formatterService.formatAndColorNumberValueHTML(item.price_changed)}</div>
                                                </div>
                                                <div>
                                                    <div>% Change:</div>
                                                    <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                                </div>
                                                <div>
                                                    <div>VWAP (90 Days):</div>
                                                    <div><span className={'sign'}></span><span
                                                        className={'stay'}>{formatterService.numberFormat(Number(item.vwap), decimalPlaces)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>

                        )}

                        <div className={'panel'}>
                            <div className="content__top">
                                <div className="content__title">Market Overview</div>
                            </div>
                        </div>
                        {this.state.dataList.length ? (
                            <div className="tile indicators content__bottom">
                                {this.state.dataList.map(item => (
                                    <div key={item.symbol_name}
                                         className={`indicator__item ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>
                                        <div className={''}>
                                            <div className={'table-image image-28 mix-blend-mode-multiple-img'}>
                                                <AssetImage alt=''
                                                            src={item.company_profile?.logo}
                                                            width={28} height={28}/>
                                            </div>
                                            <div onClick={() => this.navigate('quote-board', item.symbol_name)}
                                                 className={`table-image cursor-pointer link`}>{item.symbol_name}
                                            </div>
                                        </div>

                                        <div className={'gap-10'}>
                                            <div title={'Add to Watch List'}
                                                 className={'admin-table-actions'}>
                                                <button
                                                    type="button"
                                                    className='custom-btn admin-table-btn ripple '
                                                    onClick={() => this.addToFavourites(item)}
                                                >
                                                    <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={'indicator__item__data'}>
                                            <div>
                                                <div>Last Price:</div>
                                                <div><span className={'sign'}></span><span
                                                    className={'stay'}>{formatterService.numberFormat(Number(item.last_price), decimalPlaces)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div>Price Change:</div>
                                                <div>{formatterService.formatAndColorNumberValueHTML(item.price_changed)}</div>
                                            </div>
                                            <div>
                                                <div>% Change:</div>
                                                <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                            </div>
                                            <div>
                                                <div>VWAP (90 Days):</div>
                                                <div><span className={'sign'}></span><span
                                                    className={'stay'}>{formatterService.numberFormat(Number(item.vwap), decimalPlaces)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={'panel'}>
                                <NoDataBlock/>
                            </div>
                        )}
                    </>

                );
            case 'compact':
                return (
                    <>
                        {this.state.dataWatchList.length > 0 && (
                            <>
                                <div className={'panel'}>
                                    <div className="content__top">
                                        <div className="content__title">Watch List</div>
                                    </div>
                                </div>
                                <div className="indicators content__bottom">
                                    {this.state.dataWatchList
                                        .slice()
                                        .sort((a, b) => Number(b.percentage_changed) - Number(a.percentage_changed))
                                        .map(item => (
                                            <div key={item.symbol_name}
                                                 className={`indicator__item compact ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>
                                                <div className={'gap-10 justify-content-between'}>
                                                    <div onClick={() => this.navigate('quote-board', item.symbol_name)}
                                                         className={`table-image cursor-pointer link`}>{item.symbol_name}
                                                    </div>

                                                    <div title={'Remove from Watch List'}
                                                         className={'admin-table-actions navigate-buttons pb-0'}>
                                                        <button
                                                            type="button"
                                                            className='custom-btn admin-table-btn ripple indicator-item'
                                                            onClick={() => this.removeFromFavorites(item)}
                                                        >
                                                            <FontAwesomeIcon className="nav-icon" icon={faMinus}/>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={'stay'}>{formatterService.numberFormat(Number(item.last_price), decimalPlaces)}</div>
                                                <div className={'indicator__item__data'}>
                                                    <div>{formatterService.formatAndColorNumberValueHTML(item.price_changed)}</div>
                                                    <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                                </div>
                                            </div>
                                        ))}

                                </div>
                            </>

                        )}

                        <div className={'panel'}>
                            <div className="content__top">
                                <div className="content__title">Market Overview</div>
                            </div>
                        </div>
                        {this.state.dataList.length ? (
                            <div className="tile indicators content__bottom">
                                {this.state.dataList
                                    .slice()
                                    .sort((a, b) => Number(b.percentage_changed) - Number(a.percentage_changed))
                                    .map(item => (
                                        <div key={item.symbol_name}
                                             className={`indicator__item compact ${formatterService.getBackgroundColourByValue(item.percentage_changed)}-block`}>
                                            <div className={'gap-10 justify-content-between'}>
                                                <div onClick={() => this.navigate('quote-board', item.symbol_name)}
                                                     className={`table-image cursor-pointer link`}>{item.symbol_name}
                                                </div>

                                                <div title={'Remove from Watch List'}
                                                     className={'admin-table-actions navigate-buttons pb-0'}>
                                                    <button
                                                        type="button"
                                                        className='custom-btn admin-table-btn ripple indicator-item'
                                                        onClick={() => this.addToFavourites(item)}
                                                    >
                                                        <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={'stay'}>{formatterService.numberFormat(Number(item.last_price), decimalPlaces)}</div>
                                            <div className={'indicator__item__data'}>
                                                <div>{formatterService.formatAndColorNumberValueHTML(item.price_changed)}</div>
                                                <div>{formatterService.formatAndColorNumberBlockHTML(item.percentage_changed)}</div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className={'panel'}>
                                <NoDataBlock/>
                            </div>
                        )}
                    </>
                );
            default:
                return (
                    <></>
                )
        }
    }

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Quote Board</div>
                        <div
                            className="content__title_btns content__filter download-buttons justify-content-end">
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
                                            className={`border-grey-btn ripple d-flex ${this.state.quoteModeView === 'table' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                            disabled={this.state.isLoading}
                                            onClick={() => this.setModeView('table')}>
                                            <span>
                                                {this.state.isToggle ? (
                                                    <>Table</>
                                                ) : (
                                                    <FontAwesomeIcon className="nav-icon" icon={faList}/>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`border-grey-btn ripple d-flex ${this.state.quoteModeView === 'tile' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                            disabled={this.state.isLoading}
                                            onClick={() => this.setModeView('tile')}>
                                            <span>{this.state.isToggle ? (
                                                <>Tile</>
                                            ) : (
                                                <FontAwesomeIcon className="nav-icon" icon={faThLarge}/>
                                            )}
                                            </span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className={`border-grey-btn ripple d-flex ${this.state.quoteModeView === 'compact' ? 'active' : ''} ${this.state.isLoading ? 'disable' : ''}`}
                                            disabled={this.state.isLoading}
                                            onClick={() => this.setModeView('compact')}>
                                            <span>{this.state.isToggle ? (
                                                <>Compact</>
                                            ) : (
                                                <FontAwesomeIcon className="nav-icon" icon={faSquare}/>
                                            )}
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>{this.getViewRender()}</>
                )}

            </>

        )
    }
}

export default portalAccessWrapper(QuoteBoardBlock, 'QuoteBoardBlock');
