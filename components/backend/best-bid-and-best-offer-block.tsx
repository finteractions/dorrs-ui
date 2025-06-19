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
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import {getBidQuoteCondition, getOfferQuoteCondition, QuoteCondition} from "@/enums/quote-condition";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface BestBidAndBestOfferBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IBestBidAndBestOffer | null;
    formAction: string;
    data: IBestBidAndBestOffer[];
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
    mpid: string | null;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)
const decimalPlaces = Number(process.env.PRICE_DECIMALS || '2')

class BestBidAndBestOfferBlock extends React.Component<{}> {
    state: BestBidAndBestOfferBlockState;
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
                                         height={28}/>
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
            columnHelper.accessor((row) => ({
                mpid: row.bid_mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "bid_mpid",
                cell: (item) =>
                    <>
                        {item.getValue().mpid && (
                            <div className={'cursor-pointer link table-image'}
                                 onClick={() => {
                                     this.handleMPID(item.getValue().mpid);
                                 }}
                            >
                                <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                            height={28}/>
                                {item.getValue().mpid}
                            </div>
                        )}
                    </>,
                header: () => <span>Bid MPID</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.bid_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Bid Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => ({
                date: row.bid_date,
                time: row.bid_time
            }), {
                id: "bid_datetime",
                cell: (item) => <div>
                    <span>{item.getValue().date}</span><br/>
                    <span>{item.getValue().time}</span>
                </div>,
                header: () => <span>Bid <br/>Date / Time</span>,
            }),
            columnHelper.accessor((row) => ({
                mpid: row.offer_mpid,
                image: row.data_feed_provider_logo
            }), {
                id: "offer_mpid",
                cell: (item) =>
                    <>
                        {item.getValue().mpid && (
                            <div className={'cursor-pointer link table-image'}
                                 onClick={() => {
                                     this.handleMPID(item.getValue().mpid);
                                 }}
                            >
                                <AssetImage alt='' src={item.getValue().image ? `${host}${item.getValue().image}` : ''}
                                            height={28}/>
                                {item.getValue().mpid}
                            </div>
                        )}
                    </>,
                header: () => <span>Offer MPID</span>,
            }),
            columnHelper.accessor((row) => ({
                quantity: row.offer_quantity,
                decimals: converterService.getDecimals(row.fractional_lot_size)
            }), {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue().quantity, item.getValue().decimals),
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => ({
                date: row.offer_date,
                time: row.offer_time
            }), {
                id: "offer_datetime",
                cell: (item) => <div>
                    <span>{item.getValue().date}</span><br/>
                    <span>{item.getValue().time}</span>
                </div>,
                header: () => <span>Offer <br/>Date / Time</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];

        tableFilters = [
            {key: 'user_name', placeholder: 'Name'},
            {key: 'user_id', placeholder: 'Email'},
            {key: 'firm_name', placeholder: 'Firm'},
            {key: 'symbol_name', placeholder: 'Symbol'},
            {key: 'origin', placeholder: 'Origin'},
            {key: 'quote_condition', placeholder: 'Quote Condition'},
            {key: 'bid_mpid', placeholder: 'Bid MPID'},
            {key: 'offer_mpid', placeholder: 'Offer MPID'},
            {key: 'uti', placeholder: 'UTI'},
        ]
    }

    componentDidMount() {
        this.getBBO()
            .then(() => {
                this.setState({loading: false}, () => {
                    this.startAutoUpdate();
                })
            })
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getBBO = () => {
        return new Promise(resolve => {
            adminService.getBestBidAndBestOffer()
                .then((res: IBestBidAndBestOffer[]) => {
                    const data = res || [];

                    data.forEach(s => {
                        s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
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
        this.getAssetsInterval = setInterval(this.getBBO, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval as number);
    }

    openModal = (mode: string, data?: IFirm) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this BBO?';
        } else if (mode === 'view') {
            return 'View BBO'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} BBO`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getBBO();
    }

    onCallback = async (values: any, step: boolean) => {
        this.getBBO();
        this.closeModal();
    };

    downloadBBOCSV = () => {
        if (this.tableRef.current) {
            adminService.downloadBestBidAndBestOffer(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('bbo', res);
            })
        }
    }

    downloadBBOXLSX = () => {
        if (this.tableRef.current) {
            adminService.downloadBestBidAndBestOffer(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.XLSX('bbo', res);
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
                        <div className="content__title">Best Bid and Best Offer</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
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
                                                <NoDataBlock primaryText="No data available yet"/>
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
                                <div className="box__title">Quote Condition</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quote_condition}</div>
                            </div>
                            {getBidQuoteCondition().includes((this.state.formData?.quote_condition || '').toUpperCase() as QuoteCondition) && (
                                <>
                                    <div className="view-form-box">
                                        <div className="box__title">Bid MPID</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.bid_mpid}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Bid Qty</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.bid_quantity ? formatterService.numberFormat(parseFloat(this.state.formData.bid_quantity), Number(this.state.formData.fractional_lot_size)) : ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Bid Price</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.bid_price ? formatterService.numberFormat(parseFloat(this.state.formData.bid_price), decimalPlaces) : ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Bid Date</div>
                                        <div
                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.formData?.bid_date || '', 'MM/dd/yyyy')}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Bid Time</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.bid_time}</div>
                                    </div>
                                </>
                            )}

                            {getOfferQuoteCondition().includes((this.state.formData?.quote_condition || '').toUpperCase() as QuoteCondition) && (

                                <>
                                    <div className="view-form-box">
                                        <div className="box__title">Offer MPID</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.offer_mpid}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Offer Qty</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.offer_quantity ? formatterService.numberFormat(parseFloat(this.state.formData.offer_quantity), Number(this.state.formData.fractional_lot_size)) : ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Offer Price</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.offer_price ? formatterService.numberFormat(parseFloat(this.state.formData.offer_price), decimalPlaces) : ''}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Offer Date</div>
                                        <div
                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.formData?.offer_date || '', 'MM/dd/yyyy')}</div>
                                    </div>
                                    <div className="view-form-box">
                                        <div className="box__title">Offer Time</div>
                                        <div
                                            className="box__wrap">{this.state.formData?.offer_time}</div>
                                    </div>
                                </>
                            )}

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

export default BestBidAndBestOfferBlock;
