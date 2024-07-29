import React from 'react';
import LoaderBlock from "@/components/loader-block";
import {ISymbol} from "@/interfaces/i-symbol";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";

interface SubSymbolBlockState extends IState {
    isLoading: boolean;
    symbol: ISymbol | null;
    errors: string[];
    data: ISymbol[];
    isFilterShow: boolean;
    filtersClassName: string;
}

interface SubSymbolBlockProps {
    symbol: string;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

class SubSymbolBlock extends React.Component<SubSymbolBlockProps, SubSymbolBlockState> {

    state: SubSymbolBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: SubSymbolBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            symbol: null,
            data: [],
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }


        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol
            }), {
                id: "symbol",
                cell: (item) =>
                    <>
                        <div className={`table-image`}
                        >
                            {item.getValue().symbol}
                        </div>
                    </>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.cusip, {
                id: "cusip",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>CUSIP</span>,
            }),
            columnHelper.accessor((row) => row.symbol_suffix, {
                id: "symbol_suffix",
                cell: (item) => <span className={'truncate-text'} title={item.getValue()}>{item.getValue()}</span>,
                header: () => <span>Symbol Suffix </span>,
            }),
            columnHelper.accessor((row) => row.primary_ats, {
                id: "primary_ats",
                cell: (item) => item.getValue(),
                header: () => <span>Primary ATS </span>,
            }),
            columnHelper.accessor((row) => row.dsin, {
                id: "dsin",
                cell: (item) =>
                    <span className='blue-text'>{item.getValue()}</span>
                ,
                header: () => <span>DSIN</span>,
            }),
            columnHelper.accessor((row) => row.transfer_agent, {
                id: "transfer_agent",
                cell: (item) => item.getValue(),
                header: () => <span>Transfer Agent </span>,
            }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector </span>,
            }),
            columnHelper.accessor((row) => row.digital_asset_category, {
                id: "digital_asset_category",
                cell: (item) => item.getValue(),
                header: () => <span>Digital Asset Category </span>,
            }),

        ];

        tableFilters = [
            {key: 'symbol', placeholder: 'Symbol'},
            {key: 'cusip', placeholder: 'CUSIP'},
            {key: 'dsin', placeholder: 'DSIN'},
            {key: 'primary_ats', placeholder: 'ATS'},
            {key: 'market_sector', placeholder: 'Market Sector'},
            {key: 'digital_asset_category', placeholder: 'Digital Asset Category'},
        ]
    }

    componentDidMount() {
        this.getAssets()
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }


    startAutoUpdate = () => {
        this.getSymbolsInterval = setInterval(this.getAssets, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getSymbolsInterval) clearInterval(this.getSymbolsInterval as number);
    }


    getAssets = () => {
        adminService.getAssets(this.props.symbol)
            .then((res: ISymbol[]) => {

                let data = res || [];
                data = data.filter(s => s.symbol_id)
                this.setState({data: data})
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }


    render() {
        return (

            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>

                        {this.state.data.length ? (
                            <Table columns={columns}
                                   data={this.state.data}
                                   searchPanel={true}
                                   block={this}
                                   editBtn={false}
                                   viewBtn={false}
                                   deleteBtn={false}
                                   filters={tableFilters}
                                   filtersClassName={this.state.filtersClassName}
                                   ref={this.tableRef}
                            />
                        ) : (
                            <NoDataBlock/>
                        )}
                    </>
                )}
            </>

        )
    }
}

export default SubSymbolBlock;
