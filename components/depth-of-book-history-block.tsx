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
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import downloadFile from "@/services/download-file/download-file";
import {QuoteCondition} from "@/enums/quote-condition";
import DepthOfBookForm from "@/components/depth-of-book-form";
import {IOrder} from "@/interfaces/i-order";
import ordersService from "@/services/orders/orders-service";
import {getOrderStatusNames, OrderStatus} from "@/enums/order-status";
import {OrderSide} from "@/enums/order-side";
import {
    faCheckDouble,
    faEdit
} from "@fortawesome/free-solid-svg-icons";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";


interface DepthOfBookHistoryBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: IOrder | null;
    modalTitle: string;
    errors: string[];
    data: IOrder[];
    dataFull: IOrder[];
    filterData: any;
}

interface DepthOfBookHistoryBlockProps extends ICallback {
    symbol?: string;
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


class DepthOfBookHistoryBlock extends React.Component<DepthOfBookHistoryBlockProps, DepthOfBookHistoryBlockState> {

    state: DepthOfBookHistoryBlockState;
    errors: Array<string> = new Array<string>();
    getOrdersInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    customBtns: Array<ICustomButtonProps> = this.props.access.edit ? [
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faEdit}/>,
            onCallback: 'addOrder'
        },
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faCheckDouble}/>,
            onCallback: 'removeOrder'
        }
    ] : [];

    constructor(props: DepthOfBookHistoryBlockProps, context: IDataContext<null>) {
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
        }

        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
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
            columnHelper.accessor((row) => row.mpid, {
                id: "mpid",
                cell: (item) => item.getValue(),
                header: () => <span>MPID </span>,
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
            columnHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];
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

        ordersService.getOrderHistory(this.props.symbol)
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
            // return 'Do you want to cancel this Order?';
            return 'Do you want to delete this Order?';
        } else if (mode === 'remove') {
            return 'Do you want to close this Order?';
        } else {
            return '';
        }
    }

    onCallback = async (values: any, open: boolean) => {
        this.getOrders();
        this.props.onCallback(null);

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

    downloadBBOCSV = () => {
        this.setSymbol()
            .then(() => {
                ordersService.downloadOrders(this.state.filterData).then((res) => {
                    downloadFile.CSV('orders', res);
                })
            })
    }

    downloadBBOXLSX = () => {
        this.setSymbol()
            .then(() => {
                ordersService.downloadOrders(this.state.filterData).then((res) => {
                    downloadFile.XLSX('orders', res);
                })
            })

    }

    setSymbol = () => {
        return new Promise(resolve => {
            if (this.props.symbol) {
                this.setState(({
                    filterData: {...this.state.filterData, 'symbol_name': this.props.symbol}
                }), () => resolve(true));
            } else {
                resolve(true)
            }
        })
    }

    addOrder = (data: IOrder) => {
        this.setState({
            isOpenModal: true,
            formData: data,
            formAction: 'add',
            modalTitle: this.modalTitle('add')
        })
    }

    removeOrder = (data: IOrder) => {
        this.setState({
            isOpenModal: true,
            formData: data,
            formAction: 'remove',
            modalTitle: this.modalTitle('remove')
        })
    }

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">History by order additing</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end в-тщт">
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadBBOCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button className="border-grey-btn ripple d-flex"
                                    onClick={this.downloadBBOXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('new')}>Add Order
                                </button>
                            )}
                        </div>

                    </div>

                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__bottom">
                                <div className="content__filter mb-3">
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('origin', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('origin', item)}
                                            options={filterService.buildOptions('origin', this.state.dataFull)}
                                            placeholder="Origin"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('quote_condition', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('quote_condition', item)}
                                            options={filterService.buildOptions('quote_condition', this.state.dataFull)}
                                            placeholder="Quote Condition"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('side', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('side', item)}
                                            options={filterService.buildOptions('side', this.state.dataFull)}
                                            placeholder="Side"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('mpid', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('mpid', item)}
                                            options={filterService.buildOptions('mpid', this.state.dataFull)}
                                            placeholder="MPID"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('ref_id', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('ref_id', item)}
                                            options={filterService.buildOptions('ref_id', this.state.dataFull)}
                                            placeholder="RefID"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('uti', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('uti', item)}
                                            options={filterService.buildOptions('uti', this.state.dataFull)}
                                            placeholder="UTI"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('status_name', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('status_name', item)}
                                            options={filterService.buildOptions('status_name', this.state.dataFull)}
                                            placeholder="Status"
                                        />
                                    </div>
                                    <button
                                        className="content__filter-clear ripple"
                                        onClick={this.handleResetButtonClick}>
                                        <FontAwesomeIcon className="nav-icon"
                                                         icon={filterService.getFilterResetIcon()}/>
                                    </button>
                                </div>

                                {this.state.data.length ? (
                                    <Table columns={columns}
                                           data={this.state.data}
                                           searchPanel={true}
                                           block={this}
                                           editBtn={false}
                                           viewBtn={true}
                                           deleteBtn={true}
                                           customBtnProps={this.customBtns}
                                           access={this.props.access}
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
                                    symbol={this.props.symbol}
                                    action={this.state.formAction}
                                    data={this.state.formData}
                                    onCallback={this.onCallback}
                                    onCancel={this.onCancel}
                                />
                            </Modal>


                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(DepthOfBookHistoryBlock, 'DepthOfBookBlock');
