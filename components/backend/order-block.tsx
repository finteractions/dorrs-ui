import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import formatterService from "@/services/formatter/formatter-service";
import Modal from "@/components/modal";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {IFirm} from "@/interfaces/i-firm";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import {QuoteCondition} from "@/enums/quote-condition";
import {IOrder} from "@/interfaces/i-order";
import {getOrderStatusNames, OrderStatus} from "@/enums/order-status";
import {OrderSide} from "@/enums/order-side";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface OrdersBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IOrder | null;
    formAction: string;
    data: IOrder[];
    errors: string[];
    modalTitle: string;
    dataFull: IOrder[];
    filterData: any;
    showSymbolForm: boolean;
    mpid: string | null;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class OrdersBlock extends React.Component<{}> {
    state: OrdersBlockState;
    getAssetsInterval!: NodeJS.Timer;

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
            dataFull: [],
            filterData: [],
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
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];
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

                    this.setState({dataFull: data, data: data}, () => {
                        this.filterData();
                    });
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
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
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

    handleResetButtonClick = () => {
        this.setState({data: this.state.dataFull, filterData: []});
    }


    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }

    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }


    onCallback = async (values: any, step: boolean) => {
        this.getOrders();
        this.closeModal();
    };

    downloadOrdersCSV = () => {
        adminService.downloadOrders(this.state.filterData).then((res) => {
            downloadFile.CSV('orders', res);
        })
    }

    downloadOrdersXLSX = () => {
        adminService.downloadOrders(this.state.filterData).then((res) => {
            downloadFile.XLSX('orders', res);
        })
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
                                    <div className="content__filter mb-3">
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('user_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('user_name', item)}
                                                options={filterService.buildOptions('user_name', this.state.dataFull)}
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('user_id', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('user_id', item)}
                                                options={filterService.buildOptions('user_id', this.state.dataFull)}
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('firm_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('firm_name', item)}
                                                options={filterService.buildOptions('firm_name', this.state.dataFull)}
                                                placeholder="Firm"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('symbol_name', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('symbol_name', item)}
                                                options={filterService.buildOptions('symbol_name', this.state.dataFull)}
                                                placeholder="Symbol"
                                            />
                                        </div>
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
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={false}
                                               deleteBtn={false}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No symbols available yet"/>
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
                                    className={`${this.state.formData?.side.toString().toLowerCase()}-order-side`}>{this.state.formData?.side.toString()}</span></div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">MPID</div>
                                <div
                                    className="box__wrap">{this.state.formData?.mpid}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Size</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quantity ? formatterService.numberFormat(parseFloat(this.state.formData.quantity)) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Price</div>
                                <div
                                    className="box__wrap">{this.state.formData?.price ? formatterService.numberFormat(parseFloat(this.state.formData.price)) : ''}</div>
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

                <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value:any) => this.handleMPID(value)}/>

            </>
        )
    }
}

export default OrdersBlock;
