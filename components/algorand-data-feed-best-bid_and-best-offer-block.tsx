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
import statisticsService from "@/services/statistics/statistics-service";
import Link from "next/link";
import CopyClipboard from "@/components/copy-clipboard";
import {IMarketBestBidAndBestOfferStatistics} from "@/interfaces/i-market-best-bid-and-best-offer-statistics";


interface AlgorandDataFeedBestBidAndBestOfferBlockState extends IState {
    isLoading: boolean;
    data: IMarketBestBidAndBestOfferStatistics[];
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface AlgorandDataFeedBestBidAndBestOfferBlockProps extends ICallback {
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

class AlgorandDataFeedBestBidAndBestOfferBlock extends React.Component<AlgorandDataFeedBestBidAndBestOfferBlockProps, AlgorandDataFeedBestBidAndBestOfferBlockState> {

    host = `${window.location.protocol}//${window.location.host}`;

    state: AlgorandDataFeedBestBidAndBestOfferBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: AlgorandDataFeedBestBidAndBestOfferBlockProps) {
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
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.digital_asset_category, {
                id: "digital_asset_category",
                cell: (item) => item.getValue(),
                header: () => <span>Category </span>,
            }),
            columnHelper.accessor((row) => ({
                company_name: row.company_profile?.company_name || '',
            }), {
                id: "company_name",
                cell: (item) => item.getValue().company_name,
                header: () => <span>Company </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => row.latest_update, {
                id: "latest_update",
                cell: (item) => item.getValue() ? formatterService.dateTimeFormat(item.getValue()) : '-',
                header: () => <span>Updated Date </span>,
            }),
            columnHelper.accessor((row) => ({
                contract: row.algorand_best_bid_and_best_offer_application_id,
                link: row.algorand_best_bid_and_best_offer_application_id_link
            }), {
                id: "algorand_tx_hash_link",
                cell: (item) => {
                    return item.getValue().link ? (
                        <div className={'d-flex align-items-center'}>
                            <Link href={item.getValue().link} target={'_blank'}
                                 className="link">{item.getValue().contract}</Link>
                            <CopyClipboard
                                text={`${item.getValue().contract}`}/>
                        </div>

                    ) : (
                        <></>
                    )
                },
                header: () => <span>Contract Address</span>,
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
        statisticsService.getMarketData<IMarketBestBidAndBestOfferStatistics>('best-bid-and-best-offer')
            .then((res: Array<any>) => {

                const data = res?.filter(s => s.algorand_best_bid_and_best_offer_application_id) || [] as any;

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
                <div className="">
                    <div className="content__top mobile">
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

export default portalAccessWrapper(AlgorandDataFeedBestBidAndBestOfferBlock, 'AlgorandDataFeedBlock');
