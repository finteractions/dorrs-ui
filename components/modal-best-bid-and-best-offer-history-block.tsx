import React from 'react';
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {QuoteCondition} from "@/enums/quote-condition";
import filterService from "@/services/filter/filter";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import bestBidAndBestOfferService from "@/services/bbo/best-bid-and-best-offer-service";
import converterService from "@/services/converter/converter-service";

interface ModalBestBidAndBestOfferHistoryBlockState extends IState {
    isLoading: boolean;
    data: IBestBidAndBestOffer[];
    dataFull: IBestBidAndBestOffer[];
    filterData: any;
    pageLength: number;
}

interface ModalBestBidAndBestOfferHistoryBlockProps extends ICallback {
    onSelected?: (bestBidAndBestOffer: IBestBidAndBestOffer) => void;
    pageLength?: number;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let rowProps: ITableRowProps;
const pageLength = 20;
const decimalPlaces = Number(process.env.PRICE_DECIMALS)

class ModalBestBidAndBestOfferHistoryBlock extends React.Component<ModalBestBidAndBestOfferHistoryBlockProps, ModalBestBidAndBestOfferHistoryBlockState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: ModalBestBidAndBestOfferHistoryBlockState;

    constructor(props: ModalBestBidAndBestOfferHistoryBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            data: [],
            dataFull: [],
            filterData: [],
            pageLength: this.props?.pageLength || pageLength
        };

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) => item.getValue().symbol,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.quote_condition, {
                id: "quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>QC </span>,
            }),
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => item.getValue(),
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Bid MPID </span>,
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
            columnHelper.accessor((row) => row.offer_mpid, {
                id: "offer_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Offer MPID </span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
        ];

        rowProps = {
            className: this.props.onSelected ? 'cursor-pointer' : '',
            onCallback: (bestBidAndBestOffer: IBestBidAndBestOffer) => this.props.onSelected && this.props.onSelected(bestBidAndBestOffer)
        }
    }

    getOrders = () => {
        bestBidAndBestOfferService.getBestBidAndBestOfferHistory(null, this.state.pageLength)
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
                this.setState({isLoading: false}, () => {
                    this.props.onCallback(null);
                })
            });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    componentDidMount() {
        this.getOrders()
    }


    render() {
        return (
            <>
                <div className={'panel'}>
                    <div className={'content__top'}>
                        <div className={'content__title'}>BBO history
                            (last {this.state.pageLength})
                        </div>
                    </div>
                    <div className={'content__bottom'}>
                        {this.state.data.length ? (
                            <Table columns={columns}
                                   rowProps={rowProps}
                                   pageLength={this.state.pageLength}
                                   data={this.state.data}
                            />
                        ) : (
                            <NoDataBlock primaryText={' '} secondaryText={'No data available'}/>
                        )}
                    </div>
                </div>
            </>
        )

    }
}

export default ModalBestBidAndBestOfferHistoryBlock;
