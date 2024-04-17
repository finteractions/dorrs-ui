import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import lastSaleService from "@/services/last-sale/last-sale-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import formatterService from "@/services/formatter/formatter-service";
import LastSaleReportingForm from "@/components/last-sale-reporting-form";
import {Condition} from "@/enums/condition";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faFilter, faPlus} from "@fortawesome/free-solid-svg-icons";


interface LastSaleReportingBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: ILastSale | null;
    modalTitle: string;
    errors: string[];
    data: ILastSale[];
    mpid: string | null;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface LastSaleReportingBlockProps extends ICallback {
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
let tableFilters: Array<ITableFilter> = []

class LastSaleReportingBlock extends React.Component<LastSaleReportingBlockProps, LastSaleReportingBlockState> {

    state: LastSaleReportingBlockState;
    errors: Array<string> = new Array<string>();
    getLastSaleReportingInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: LastSaleReportingBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            modalTitle: '',
            errors: [],
            formData: null,
            data: [],
            mpid: null,
            isToggle: false,
            isFilterShow: false,
            filtersClassName: 'd-none d-md-flex'
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                symbol_suffix: row.symbol_suffix,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div onClick={() => {
                        this.navigate(item.getValue().symbol, item.getValue().symbol_suffix)
                    }}
                         className={`table-image cursor-pointer link`}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().symbol}
                    </div>
                ,
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.symbol_suffix, {
                id: "symbol_suffix",
                cell: (item) => item.getValue(),
                header: () => <span>Symbol Suffix</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => item.getValue(),
                header: () => <span>Condition</span>,
            }),
            columnHelper.accessor((row) => ({
                mpid: row.mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link table-image'}
                         onClick={() => {
                             this.handleMPID(item.getValue().mpid);
                         }}
                    >
                        <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                    width={28} height={28}/>
                        {item.getValue().mpid}
                    </div>,
                header: () => <span>MPID</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Quantity</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Price</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.time, {
                id: "time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
            }),
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => formatterService.formatAndColorTickIndicationValueHTML(item.getValue()),
                header: () => <span>Tick</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];

        tableFilters = [
            {key: 'symbol_name', placeholder: 'Symbol'},
            {key: 'origin', placeholder: 'Origin'},
            {key: 'condition', placeholder: 'Condition'},
            {key: 'mpid', placeholder: 'MPID'},
            {key: 'tick_indication', placeholder: 'Tick'},
            {key: 'uti', placeholder: 'UTI'},
            {key: 'date', placeholder: 'Date'},
        ]
    }

    navigate = (symbol: string, symbol_suffix: string) => {
        this.props.onCallback(symbol, symbol_suffix);
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getLastSaleReporting();
        this.startAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.removeEventListener('click', this.handleClickOutside);
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

    startAutoUpdate = () => {
        this.getLastSaleReportingInterval = setInterval(this.getLastSaleReporting, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getLastSaleReportingInterval) clearInterval(this.getLastSaleReportingInterval);
    }

    getLastSaleReporting = () => {
        lastSaleService.getLastSaleReporting()
            .then((res: Array<ILastSale>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];

                data.forEach(s => {
                    s.condition = Condition[s.condition as keyof typeof Condition] || ''
                })

                this.setState({data: data});
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: ILastSale) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }

    modalTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Sale Report'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Sale Report`;
        }
    }

    onCallback = async (values: any, open: boolean) => {
        this.getLastSaleReporting();

        if (open) {
            this.setState({isOpenModal: false}, () => {
                this.openModal('view', values as ILastSale);
            })
        } else {
            this.closeModal();
        }
    };

    downloadLastSaleReportingCSV = () => {
        if (this.tableRef.current) {
            lastSaleService.downloadLastSales(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('last_sale_reporting', res);
            })
        }

    }

    downloadLastSaleReportingXLSX = () => {
        if (this.tableRef.current) {
            lastSaleService.downloadLastSales(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('last_sale_reporting', res);
            })
        }
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Last Sale Reporting</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <div className="filter-menu filter-menu-last-sale">
                                <Button
                                    variant="link"
                                    className="d-md-none admin-table-btn ripple"
                                    type="button"
                                    onClick={this.toggleMenu}
                                >
                                    <FontAwesomeIcon icon={faFileExport}/>
                                </Button>
                                <ul className={`${this.state.isToggle ? 'open' : ''}`}>
                                    <li>
                                        <button className="border-grey-btn ripple d-flex"
                                                onClick={this.downloadLastSaleReportingCSV}>
                                            <span className="file-item__download"></span>
                                            <span>CSV</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="border-grey-btn ripple d-flex"
                                                onClick={this.downloadLastSaleReportingXLSX}>
                                            <span className="file-item__download"></span>
                                            <span>XLSX</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <Button
                                variant="link"
                                className="d-md-none admin-table-btn ripple"
                                type="button"
                                onClick={() => this.handleShowFilters()}
                            >
                                <FontAwesomeIcon icon={faFilter}/>
                            </Button>

                            {this.props.access.create && (
                                <>
                                    <button className="d-none d-md-block b-btn ripple"
                                            disabled={this.state.isLoading}
                                            onClick={() => this.openModal('add')}>Add Sale Report
                                    </button>
                                    <Button
                                        variant="link"
                                        className="d-md-none admin-table-btn ripple"
                                        type="button"
                                        onClick={() => this.openModal('add')}
                                    >
                                        <FontAwesomeIcon icon={faPlus}/>
                                    </Button>
                                </>

                            )}
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
                                           editBtn={true}
                                           viewBtn={true}
                                           filters={tableFilters}
                                           filtersClassName={this.state.filtersClassName}
                                           access={this.props.access}
                                           ref={this.tableRef}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>

                            <Modal isOpen={this.state.isOpenModal}
                                   onClose={() => this.closeModal()}
                                   title={this.state.modalTitle}
                                   className={`${this.state.formAction} ${['add', 'edit'].includes(this.state.formAction) ? 'big_modal' : ''}`}
                            >
                                <LastSaleReportingForm
                                    action={this.state.formAction}
                                    data={this.state.formData}
                                    onCallback={this.onCallback}
                                />
                            </Modal>

                            <ModalMPIDInfoBlock mpid={this.state.mpid}
                                                onCallback={(value: any) => this.handleMPID(value)}/>
                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(LastSaleReportingBlock, 'LastSaleReportingBlock');
