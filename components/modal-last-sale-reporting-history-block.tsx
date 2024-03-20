import React from 'react';
import {ISymbol} from "@/interfaces/i-symbol";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import filterService from "@/services/filter/filter";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import lastSaleService from "@/services/last-sale/last-sale-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import {Condition} from "@/enums/condition";

interface ModalLastSaleReportingHistoryBlockState extends IState {
    isLoading: boolean;
    data: ILastSale[];
    dataFull: ILastSale[];
    filterData: any;
    pageLength: number;
}

interface ModalLastSaleReportingHistoryBlockProps extends ICallback {
    onSelected?: (lastSale: ILastSale) => void;
    pageLength?: number;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let rowProps: ITableRowProps;
const pageLength = 20;

class ModalLastSaleReportingHistoryBlock extends React.Component<ModalLastSaleReportingHistoryBlockProps, ModalLastSaleReportingHistoryBlockState> {
    symbols: Array<ISymbol> = new Array<ISymbol>();
    state: ModalLastSaleReportingHistoryBlockState;

    constructor(props: ModalLastSaleReportingHistoryBlockProps) {
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
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => item.getValue(),
                header: () => <span>Condition</span>,
            }),
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => item.getValue(),
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) => item.getValue(),
                header: () => <span>MPID</span>,
            }),
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Quantity</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Price</span>,
            }),
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => formatterService.formatAndColorTickIndicationValueHTML(item.getValue()),
                header: () => <span>Tick</span>,
            }),
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        rowProps = {
            className: this.props.onSelected ? 'cursor-pointer' : '',
            onCallback: (lastSale: ILastSale) => this.props.onSelected && this.props.onSelected(lastSale)
        }
    }

    getOrders = () => {
        lastSaleService.getLastSaleReportingHistory(null, this.state.pageLength)
            .then((res: Array<ILastSale>) => {

                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.condition = Condition[s.condition as keyof typeof Condition] || ''
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
                        <div className={'content__title'}>Last Sale history
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

export default ModalLastSaleReportingHistoryBlock;
