import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import AssetImage from "@/components/asset-image";
import DepthOfBookForm from "@/components/depth-of-book-form";
import {IOrder} from "@/interfaces/i-order";
import ordersService from "@/services/orders/orders-service";
import {IDepthOrder} from "@/interfaces/i-depth-order";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";


interface DepthOfBookBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: IOrder | null;
    modalTitle: string;
    errors: string[];
    data: IDepthOrder[];
    dataFull: IDepthOrder[];
    filterData: any;
    mpid: string | null;
}

interface DepthOfBookBlockProps extends ICallback {
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

class DepthOfBookBlock extends React.Component<DepthOfBookBlockProps, DepthOfBookBlockState> {

    state: DepthOfBookBlockState;
    errors: Array<string> = new Array<string>();
    getOrdersInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: DepthOfBookBlockProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'new',
            modalTitle: '',
            errors: [],
            formData: null,
            data: [],
            dataFull: [],
            filterData: [],
            mpid: null
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div onClick={() => {
                        this.navigate(item.getValue().symbol)
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
            columnHelper.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
                    </div>,
                header: () => <span>Bid MPID </span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Size</span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => row.bid_updated_at, {
                id: "bid_updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Bid Updated Date </span>,
            }),
            columnHelper.accessor((row) => row.offer_mpid, {
                id: "offer_mpid",
                cell: (item) =>
                    <div className={'cursor-pointer link'}
                         onClick={() => {
                             this.handleMPID(item.getValue());
                         }}
                    >
                        {item.getValue()}
                    </div>,
                header: () => <span>Offer MPID </span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Size</span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => row.offer_updated_at, {
                id: "offer_updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Offer Updated Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'symbol_name', placeholder: 'Symbol'},
            {key: 'bid_mpid', placeholder: 'Bid MPID'},
            {key: 'offer_mpid', placeholder: 'Offer MPID'},
        ]
    }

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getOrders();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getOrdersInterval = setInterval(this.getOrders, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getOrdersInterval) clearInterval(this.getOrdersInterval);
    }

    getOrders = () => {
        ordersService.getOrders()
            .then((res: Array<IDepthOrder>) => {

                const data = res || [];

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }
    openModal = (mode: string, data?: IOrder) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }


    modalTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Order'
        } else if (mode === 'new') {
            return 'Add Order'
        } else if (mode === 'add') {
            return 'Edit Order'
        } else if (mode === 'delete') {
            return 'Do you want to cancel this Order?';
        } else {
            return '';
        }
    }

    onCallback = async (values: any, open: boolean) => {
        this.getOrders();

        if (open) {
            this.setState({isOpenModal: false}, () => {
                this.openModal('view', values as IOrder);
            })
        } else {
            this.closeModal();
        }
    };

    onCancel = async () => {
        this.getOrders();

        this.closeModal();
    };

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }

    customBtnAction = (action: any, data: any) => {
        this.setState({
            isOpenModal: true,
            formData: data || null,
            formAction: 'add',
            modalTitle: this.modalTitle('add')
        })
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }


    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Depth of Book</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end в-тщт">
                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('new')}>Add Order
                                </button>
                            )}
                        </div>

                    </div>

                    <div className={'content__top border-bottom-0'}>
                        Latest dates order updates
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
                                           access={this.props.access}
                                           filters={tableFilters}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>

                            <Modal isOpen={this.state.isOpenModal}
                                   onClose={() => this.closeModal()}
                                   title={this.state.modalTitle}
                                   className={`bbo ${this.state.formAction} ${['new', 'add'].includes(this.state.formAction) ? 'big_modal' : ''}`}
                            >
                                <DepthOfBookForm
                                    action={this.state.formAction}
                                    data={this.state.formData}
                                    onCallback={this.onCallback}
                                    onCancel={this.onCancel}
                                />
                            </Modal>

                            <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value:any) => this.handleMPID(value)}/>

                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(DepthOfBookBlock, 'DepthOfBookBlock');
