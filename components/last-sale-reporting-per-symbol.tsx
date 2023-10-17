import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Link from "next/link";
import {useRouter} from "next/router";
import lastSaleService from "@/services/last-sale/last-sale-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import {createColumnHelper} from "@tanstack/react-table";
import {Condition} from "@/enums/condition";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import {TradingViewWidget} from "@/components/trading-view-widget";

interface LastSaleReportingPerSymbolProps {
    symbol: string;
}

interface LastSaleReportingPerSymbolState extends IState {
    isLoading: boolean;
    isLoadingChart: boolean;
    errors: string[];
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

const initData = [
    {
        time: '2023-10-10',
        value: 99999.36
    },
    {
        time: '2023-12-11',
        value: 289563.99
    },
    {
        time: '2023-12-12',
        value: 96622.33
    },
    {
        time: '2023-12-22',
        value: 25
    }
];

const initialData = [
    {time: '2018-12-22', value: 32.51},
    {time: '2018-12-23', value: 31.11},
    {time: '2018-12-24', value: 27.02},
    {time: '2018-12-25', value: 27.32},
    {time: '2018-12-26', value: 25.17},
    {time: '2018-12-27', value: 28.89},
    {time: '2018-12-28', value: 25.46},
    {time: '2018-12-29', value: 23.92},
    {time: '2018-12-30', value: 22.68},
    {time: '2018-12-31', value: 22.67},
];

class LastSaleReportingPerSymbolBlock extends React.Component<LastSaleReportingPerSymbolProps> {

    lastSales: Array<ILastSale> = new Array<ILastSale>();
    charts: Array<ITradingView> = new Array<ITradingView>();
    state: LastSaleReportingPerSymbolState;

    constructor(props: LastSaleReportingPerSymbolProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isLoadingChart: true,
            errors: [],
        }


        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => Condition[item.getValue() as keyof typeof Condition] || '',
                header: () => <span>Condition</span>,
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
            columnHelper.accessor((row) => row.time, {
                id: "time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => item.getValue(),
                header: () => <span>Tick Indication</span>,
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
        this.getLastSaleReportingChart();
        this.getLastSaleReporting();

    }

    getLastSaleReportingChart = () => {
        lastSaleService.getLastSaleReportingChartBySymbol(this.props.symbol)
            .then((res: Array<ITradingView>) => {
                this.charts = res;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoadingChart: false});
            });
    }

    getLastSaleReporting = () => {
        lastSaleService.getLastSaleReportingBySymbol(this.props.symbol)
            .then((res: Array<ILastSale>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                this.lastSales = data;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false});
            });
    }
    handleBack = () => {
        const router = useRouter();
        router.push('/last-sale-reporting');
    }

    onCallback = async (values: any, step: boolean) => {
        this.getLastSaleReporting();
    };

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
                                    href="/last-sale-reporting"

                                >Back
                                </Link>
                                </p>
                            </div>
                        </div>
                        <div className={'panel'}>
                            <div className="content__top">
                                <div className="content__title">Last Sale Reporting for {this.props.symbol}</div>
                            </div>
                            <div className={`content__bottom ${this.lastSales.length > 0 ? '' : 'd-none'}`}>

                                <>
                                    {this.state.isLoadingChart ? (
                                        <LoaderBlock/>
                                    ) : (
                                        <TradingViewWidget data={this.charts}/>
                                    )}

                                    <Table columns={columns}
                                           data={this.lastSales}
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

export default LastSaleReportingPerSymbolBlock;
