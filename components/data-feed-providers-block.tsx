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
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";
import formatterService from "@/services/formatter/formatter-service";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";


interface DataFeedProvidersBlockState extends IState {
    isLoading: boolean;
    data: IDataFeedProviderStatistics[];
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface DataFeedProvidersBlockProps extends ICallback {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

let isDashboard = false;
const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

class DataFeedProvidersBlock extends React.Component<DataFeedProvidersBlockProps, DataFeedProvidersBlockState> {

    state: DataFeedProvidersBlockState;
    errors: Array<string> = new Array<string>();
    getSymbolsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: DataFeedProvidersBlockProps) {
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
                name: row.name,
                image: row?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <>
                        <div onClick={() => {
                            this.navigate(item.getValue().name)
                        }}
                             className={`table-image cursor-pointer link`}
                        >
                            <div className="table-image-container">
                                <AssetImage alt=''
                                            src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                           height={28}/>
                            </div>
                            {item.getValue().name}
                        </div>
                    </>
                ,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.total_symbol, {
                id: "total_symbol",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 0)}</span>,
                header: () => <span>Total # of Symbols </span>,
            }),
            columnHelper.accessor((row) => row.total_trade, {
                id: "total_trade",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 0)}</span>,
                header: () => <span>Total # of Trades </span>,
            }),
            columnHelper.accessor((row) => row.total_quantity, {
                id: "total_quantity",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 6)}</span>,
                header: () => <span>Total # of Quantity </span>,
            }),
            columnHelper.accessor((row) => row.total_value, {
                id: "total_value",
                cell: (item) => <span>{formatterService.numberFormat(item.getValue(), 4)}</span>,
                header: () => <span>Total # by Dollar Value </span>,
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
        dataFeedProvidersService.getStatistics()
            .then((res: Array<IDataFeedProviderStatistics>) => {
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
                        <div className="content__title">Data Feed Providers</div>
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

export default portalAccessWrapper(DataFeedProvidersBlock, 'DataFeedProvidersBlock');
