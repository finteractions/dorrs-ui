import React from 'react';
import LoaderBlock from "@/components/loader-block";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";
import converterService from "@/services/converter/converter-service";
import AssetImage from "@/components/asset-image";

interface DataFeedProviderHistoryProps {
    name: string;
}

interface DataFeedProviderHistoryState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IDataFeedProviderHistory[];
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')


class DataFeedProviderHistoryBlock extends React.Component<DataFeedProviderHistoryProps> {
    state: DataFeedProviderHistoryState;
    tableRef: React.RefObject<any> = React.createRef();


    constructor(props: DataFeedProviderHistoryProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: [],
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex',
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div
                        className={`table-image`}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.last_price, {
                id: "last_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Last Sale Price</span>,
            }),
            columnHelper.accessor((row) => ({
                daily_volume: row.daily_volume,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().daily_volume, item.getValue().decimals),
                header: () => <span>Daily Volume</span>,
            }),
            columnHelper.accessor((row) => row.percentage_change, {
                id: "percentage_change",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 2)} %</span>,
                header: () => <span>Percentage of Volume</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getHistory()
            .finally(() => this.setState({isLoading: false}))
        window.addEventListener('click', this.handleClickOutside);

    }

    componentWillUnmount() {
        window.addEventListener('click', this.handleClickOutside);
    }

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-last-sale');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };


    getHistory = () => {
        return new Promise((resolve) => {
            dataFeedProvidersService.getHistory(this.props.name)
                .then((res: Array<IDataFeedProviderHistory>) => {
                    const data = res || [];

                    this.setState({data: data});
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    resolve(true);
                });
        });
    }

    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <Table columns={columns}
                           data={this.state.data}
                           searchPanel={true}
                           block={this}
                           filters={tableFilters}
                           filtersClassName={this.state.filtersClassName}
                           ref={this.tableRef}
                    />
                )}
            </>
        );
    }

}

export default DataFeedProviderHistoryBlock;
