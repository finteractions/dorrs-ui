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
import {ILastSale} from "@/interfaces/i-last-sale";
import {Condition} from "@/enums/condition";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface LastSalesBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: ILastSale | null;
    formAction: string;
    data: ILastSale[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    mpid: string | null;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class LastSalesBlock extends React.Component<{}> {
    state: LastSalesBlockState;
    getAssetsInterval!: NodeJS.Timer;

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
            columnHelper.accessor((row) => ({
                date: row.date,
                time: row.time
            }), {
                id: "datetime",
                cell: (item) => <div>
                    <span>{item.getValue().date}</span><br/>
                    <span>{item.getValue().time}</span>
                </div>,
                header: () => <span>Date <br/>Time</span>,
            }),
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => item.getValue(),
                header: () => <span>Tick <br/> Ind.</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
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
            {key: 'condition', placeholder: 'Condition'},
            {key: 'mpid', placeholder: 'MPID'},
            {key: 'tick_indication', placeholder: 'Tick'},
            {key: 'uti', placeholder: 'UTI'},
            {key: 'date', placeholder: 'Date'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getLastSales();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getLastSales = () => {
        adminService.getLastSales()
            .then((res: ILastSale[]) => {
                const data = res || [];

                data.forEach(s => {
                    s.condition = Condition[s.condition as keyof typeof Condition] || ''
                })

                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getAssetsInterval = setInterval(this.getLastSales, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
    }

    openModal = (mode: string, data?: IFirm) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this Last Sale?';
        } else if (mode === 'view') {
            return 'View Last Sale'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Last Sale`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getLastSales();
    }

    onCallback = async (values: any, step: boolean) => {
        this.getLastSales();
        this.closeModal();
    };

    downloadLastSaleReportingCSV = () => {
        if (this.tableRef.current) {
            adminService.downloadLastSales(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('last_sale_reporting', res);
            })
        }
    }

    downloadLastSaleReportingXLSX = () => {
        if (this.tableRef.current) {
            adminService.downloadLastSales(this.tableRef.current.getColumnFilters()).then((res) => {
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
                <div className="assets section page__section">
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
                    <div className='approve-form'>
                        <div
                            className={`approve-form-text w-100`}>
                            <>
                                Created
                                by {this.state.formData?.user_name} at {formatterService.dateTimeFormat(this.state.formData?.created_at || '')}
                            </>
                        </div>
                    </div>
                    <div className="form-panel">
                        <div className='view-form user-view-form'>
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
                                <div className="box__title">Symbol</div>
                                <div
                                    className="box__wrap">{this.state.formData?.symbol_name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Symbol Suffix</div>
                                <div
                                    className="box__wrap">{this.state.formData?.symbol_suffix || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Condition</div>
                                <div
                                    className="box__wrap">{this.state.formData?.condition}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">MPID</div>
                                <div
                                    className="box__wrap">{this.state.formData?.mpid || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Tick</div>
                                <div
                                    className="box__wrap">{this.state.formData?.tick_indication}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title"></div>
                                <div
                                    className="box__wrap"></div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Quantity</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quantity ? formatterService.numberFormat(parseFloat(this.state.formData.quantity), converterService.getDecimals(Number(this.state.formData.fractional_lot_size))) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Price</div>
                                <div
                                    className="box__wrap">{this.state.formData?.price ? formatterService.numberFormat(parseFloat(this.state.formData.price), decimalPlaces) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Date</div>
                                <div
                                    className="box__wrap">{this.state.formData?.date}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Time</div>
                                <div
                                    className="box__wrap">{this.state.formData?.time}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Universal Transaction ID (UTI)</div>
                                <div
                                    className="box__wrap">{this.state.formData?.uti}</div>
                            </div>
                        </div>
                    </div>
                </Modal>

                <ModalMPIDInfoBlock mpid={this.state.mpid} onCallback={(value: any) => this.handleMPID(value)}/>

            </>
        )
    }
}

export default LastSalesBlock;
