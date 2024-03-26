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
import filterService from "@/services/filter/filter";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";


interface LastSaleReportingBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: ILastSale | null;
    modalTitle: string;
    errors: string[];
    data: ILastSale[];
    mpid: string | null;
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
            mpid: null
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
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
                    </div>,
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
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

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
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadLastSaleReportingCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadLastSaleReportingXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('add')}>Add Sale Report
                                </button>
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
