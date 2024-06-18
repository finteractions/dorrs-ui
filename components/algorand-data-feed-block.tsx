import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import AssetImage from "@/components/asset-image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";
import formatterService from "@/services/formatter/formatter-service";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {IMarketStatistics} from "@/interfaces/i-market-statistics";
import algorandService from "@/services/algorand/algorand-service";


interface AlgorandDataFeedBlockState extends IState {
    isLoading: boolean;
    data: IMarketStatistics[];
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface AlgorandDataFeedBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

class AlgorandDataFeedBlock extends React.Component<AlgorandDataFeedBlockProps, AlgorandDataFeedBlockState> {

    host = `${window.location.protocol}//${window.location.host}`;

    state: AlgorandDataFeedBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: AlgorandDataFeedBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            data: [],
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }

        const host = `${window.location.protocol}//${window.location.host}`;


        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <>
                        <div onClick={() => {
                            this.navigate(item.getValue().symbol)
                        }}
                             className={`table-image cursor-pointer link`}
                        >
                            <div className="table-image-container">
                                <AssetImage alt='' src={item.getValue().image ? `${this.host}${item.getValue().image}` : ''}
                                            width={28} height={28}/>
                            </div>
                            {formatterService.formatSymbolName(item.getValue().symbol)}
                        </div>
                    </>
                ,
                header: () => <span>Origin</span>,
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
            columnHelper.accessor((row) => row.latest_update, {
                id: "latest_update",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date </span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getStatistics();
        // this.startAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.removeEventListener('click', this.handleClickOutside);
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    startAutoUpdate = () => {
        this.getSymbolsInterval = setInterval(this.getStatistics, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getSymbolsInterval) clearInterval(this.getSymbolsInterval as number);
    }

    getStatistics = () => {
        algorandService.getMarketData()
            .then((res: Array<IMarketStatistics>) => {
                const data = res || [];
                this.setState({data: data});

            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Algorand Data Feed</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <Button
                                variant="link"
                                className="d-md-none admin-table-btn ripple"
                                type="button"
                                onClick={() => this.handleShowFilters()}
                            >
                                <FontAwesomeIcon icon={faFilter}/>
                            </Button>
                        </div>

                    </div>


                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__bottom">
                                {this.state.data.length ? (
                                    <Table columns={columns}
                                           data={this.state.data}
                                           searchPanel={true}
                                           block={this}
                                           filters={tableFilters}
                                           filtersClassName={this.state.filtersClassName}
                                           ref={this.tableRef}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(AlgorandDataFeedBlock, 'DataFeedProvidersBlock');
