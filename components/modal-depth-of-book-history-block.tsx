import React from 'react';
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {QuoteCondition} from "@/enums/quote-condition";
import {IOrder} from "@/interfaces/i-order";
import {OrderSide} from "@/enums/order-side";
import {getOrderStatusNames, OrderStatus} from "@/enums/order-status";
import ordersService from "@/services/orders/orders-service";
import filterService from "@/services/filter/filter";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";

interface ModalDepthOfBookHistoryBlockState extends IState {
    isLoading: boolean;
    data: IOrder[];
    dataFull: IOrder[];
    filterData: any;
    pageLength: number;
}

interface ModalDepthOfBookHistoryBlockProps extends ICallback {
    onSelected?: (order: IOrder) => void;
    pageLength?: number;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let rowProps: ITableRowProps;
const pageLength = 20;

class ModalDepthOfBookHistoryBlock extends React.Component<ModalDepthOfBookHistoryBlockProps, ModalDepthOfBookHistoryBlockState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: ModalDepthOfBookHistoryBlockState;

    constructor(props: ModalDepthOfBookHistoryBlockProps) {
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
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) => item.getValue(),
                header: () => <span>MPID</span>,
            }),
            columnHelper.accessor((row) => row.side, {
                id: "side",
                cell: (item) => <span
                    className={`${item.getValue().toString().toLowerCase()}-order-side`}>{item.getValue()}</span>,
                header: () => <span>Side </span>,
            }),
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Size </span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Price </span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        rowProps = {
            className: this.props.onSelected ? 'cursor-pointer' : '',
            onCallback: (order: IOrder) => this.props.onSelected && this.props.onSelected(order)
        }
    }

    getOrders = () => {
        ordersService.getOrderHistory(null, 'open', this.state.pageLength)
            .then((res: Array<IOrder>) => {

                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
                    s.side = OrderSide[s.side as keyof typeof OrderSide] || ''
                    s.status_name = getOrderStatusNames(s.status as OrderStatus);
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
                        <div className={'content__title'}>Order history
                            (last {this.state.pageLength})</div>
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

export default ModalDepthOfBookHistoryBlock;
