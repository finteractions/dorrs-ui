import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import formatterService from "@/services/formatter/formatter-service";
import Modal from "@/components/modal";
import {IFirm} from "@/interfaces/i-firm";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import {QuoteCondition} from "@/enums/quote-condition";
import {IOrder} from "@/interfaces/i-order";
import {getOrderStatusNames, OrderStatus} from "@/enums/order-status";
import {OrderSide} from "@/enums/order-side";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface OrdersBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IOrder | null;
    formAction: string;
    data: IOrder[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    mpid: string | null;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class OrdersBlock extends React.Component<{}> {
    state: OrdersBlockState;
    getAssetsInterval: NodeJS.Timer | number | undefined;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
            mpid: null
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                name: row.user_name,
                email: row.user_id
            }), {
                id: "user",
                cell: (item) => <div>
                    <span>{item.getValue().name}</span><br/>
                    <span className="text-ellipsis">{item.getValue().email}</span>
                </div>,
                header: () => <span>Name <br/>Email</span>,
            }),
            columnHelper.accessor((row) => row.firm_name, {
                id: "firm_name",
                cell: (item) => item.getValue(),
                header: () => <span>Firm</span>,
            }),
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => ({
                symbol: row.symbol_name,
                image: row.company_profile?.logo
            }), {
                id: "symbol",
                cell: (item) =>
                    <div className={`table-image`}
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
            columnHelper.accessor((row) => row.quote_condition, {
                id: "quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>QC </span>,
            }),
            columnHelper.accessor((row) => row.side, {
                id: "side",
                cell: (item) => <span
                    className={`${item.getValue().toString().toLowerCase()}-order-side`}>{item.getValue()}</span>,
                header: () => <span>Side </span>,
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
                header: () => <span>Size </span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Price </span>,
            }),
            columnHelper.accessor((row) => row.ref_id, {
                id: "ref_id",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Reference Number ID (RefID)</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
            columnHelper.accessor((row) => ({
                status: row.status,
                statusName: row.status_name
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().statusName}
                        </div>
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'user_name', placeholder: 'Name'},
            {key: 'user_id', placeholder: 'Email'},
            {key: 'firm_name', placeholder: 'Firm'},
            {key: 'symbol_name', placeholder: 'Symbol'},
            {key: 'origin', placeholder: 'Origin'},
            {key: 'quote_condition', placeholder: 'Quote Condition'},
            {key: 'side', placeholder: 'Side'},
            {key: 'mpid', placeholder: 'MPID'},
            {key: 'ref_id', placeholder: 'RefID'},
            {key: 'uti', placeholder: 'UTI'},
            {key: 'status_name', placeholder: 'Status'},
        ]
    }

    componentDidMount() {
        this.getOrders()
            .then(() => {
                this.setState({loading: false}, () => {
                    this.startAutoUpdate();
                })
            })
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getOrders = () => {
        return new Promise(resolve => {
            adminService.getOrders()
                .then((res: IOrder[]) => {
                    const data = res || [];

                    data.forEach(s => {
                        s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || '';
                        s.side = OrderSide[s.side as keyof typeof OrderSide] || '';
                        s.status_name = getOrderStatusNames(s.status as OrderStatus);
                    })

                    this.setState({data: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })

    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getOrders, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
    }

    openModal = (mode: string, data?: IFirm) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this Order?';
        } else if (mode === 'view') {
            return 'View Order'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Order`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getOrders();
    }

    onCallback = async (values: any, step: boolean) => {
        this.getOrders();
        this.closeModal();
    };

    downloadOrdersCSV = () => {
        if (this.tableRef.current) {
            adminService.downloadOrders(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('orders', res);
            })
        }
    }

    downloadOrdersXLSX = () => {
        if (this.tableRef.current) {
            adminService.downloadOrders(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('orders', res);
            })
        }
    }

    handleMPID = (mpid: string | null) => {
        this.setState({mpid: mpid})
    }

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Orders</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadOrdersCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadOrdersXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                        </div>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data.length ? (
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={false}
                                               deleteBtn={false}
                                               filters={tableFilters}
                                               ref={this.tableRef}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No orders available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={this.modalTitle(this.state.formAction)}
                >

                    <div className="form-panel">
                        <div className='view-form user-view-form'>
                            <div className="approve-form w-100">
                                <div className="approve-form-text">
                                    <div
                                        className={`table__status table__status-${this.state.formData?.status}`}>
                                        Status: {`${getOrderStatusNames(this.state.formData?.status as OrderStatus)}`}
                                    </div>
                                </div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Name</div>
                                <div
                                    className="box__wrap">{this.state.formData?.user_name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Email</div>
                                <div
                                    className="box__wrap">{this.state.formData?.user_id || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Origin</div>
                                <div
                                    className="box__wrap">{this.state.formData?.origin || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title"></div>
                                <div
                                    className="box__wrap"></div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Symbol</div>
                                <div
                                    className="box__wrap">{this.state.formData?.symbol_name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Quote Condition</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quote_condition}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">
                                    Side
                                </div>
                                <div
                                    className="box__wrap"><span
                                    className={`${this.state.formData?.side.toString().toLowerCase()}-order-side`}>{this.state.formData?.side.toString()}</span>
                                </div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">MPID</div>
                                <div
                                    className="box__wrap">{this.state.formData?.mpid}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Size</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quantity ? formatterService.numberFormat(parseFloat(this.state.formData.quantity), Number(this.state.formData.fractional_lot_size)) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Price</div>
                                <div
                                    className="box__wrap">{this.state.formData?.price ? formatterService.numberFormat(parseFloat(this.state.formData.price), decimalPlaces) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Reference Number ID (RefID)</div>
                                <div
                                    className="box__wrap">{this.state.formData?.ref_id}</div>
                            </div>

                            <div className="view-form-box">
                                <div className="box__title">Universal Transaction ID (UTI)</div>
                                <div
                                    className="box__wrap">{this.state.formData?.uti}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Created Date</div>
                                <div
                                    className="box__wrap">{formatterService.dateTimeFormat(this.state.formData?.created_at || '')}</div>
                            </div>
                        </div>
                    </div>
                </Modal>

                <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value: any) => this.handleMPID(value)}/>

            </>
        )
    }
}

export default OrdersBlock;
