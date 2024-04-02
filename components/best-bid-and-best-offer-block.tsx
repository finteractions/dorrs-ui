import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import bestBidAndBestOfferService from "@/services/bbo/best-bid-and-best-offer-service";
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import formatterService from "@/services/formatter/formatter-service";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import BestBidAndBestOfferForm from "@/components/best-bid-and-best-offer-form";
import {QuoteCondition} from "@/enums/quote-condition";
import ModalMPIDInfoBlock from "@/components/modal-mpid-info-block";
import converterService from "@/services/converter/converter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faFilter, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";


interface BestBidAndBestOfferBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: IBestBidAndBestOffer | null;
    modalTitle: string;
    errors: string[];
    data: IBestBidAndBestOffer[];
    mpid: string | null;
    isToggle: boolean;
    isFilterShow: boolean;
    filtersClassName: string;
}

interface BestBidAndBestOfferBlockProps extends ICallback {
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

class BestBidAndBestOfferBlock extends React.Component<BestBidAndBestOfferBlockProps, BestBidAndBestOfferBlockState> {

    state: BestBidAndBestOfferBlockState;
    errors: Array<string> = new Array<string>();
    getBBOInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    tableRef: React.RefObject<any> = React.createRef();

    constructor(props: BestBidAndBestOfferBlockProps, context: IDataContext<null>) {
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
            columnHelper.accessor((row) => row.quote_condition, {
                id: "quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>QC </span>,
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
                header: () => <span>Bid Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => row.bid_date, {
                id: "bid_date",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Date</span>,
            }),
            columnHelper.accessor((row) => row.bid_time, {
                id: "bid_time",
                cell: (item) => item.getValue(),
                header: () => <span>Bid Time</span>,
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
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue(), decimalPlaces),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => row.offer_date, {
                id: "offer_date",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Date</span>,
            }),
            columnHelper.accessor((row) => row.offer_time, {
                id: "offer_time",
                cell: (item) => item.getValue(),
                header: () => <span>Offer Time</span>,
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
            {key: 'quote_condition', placeholder: 'Quote Condition'},
            {key: 'bid_mpid', placeholder: 'Bid MPID'},
            {key: 'offer_mpid', placeholder: 'Offer MPID'},
            {key: 'uti', placeholder: 'UTI'},
        ]
    }

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getBBO();
        this.startAutoUpdate();
        window.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
        window.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event: any) => {
        const menu = document.querySelector('.filter-menu-best-bid-and-best-offer');
        if (menu && !menu.contains(event.target)) {
            this.setState({isToggle: false});
        }
    };

    handleShowFilters = () => {
        this.setState({isFilterShow: !this.state.isFilterShow}, () => {
            this.setState({filtersClassName: this.state.isFilterShow ? '' : 'd-none d-md-flex'})
        })
    };

    toggleMenu = () => {
        this.setState({isToggle: !this.state.isToggle})
    };

    startAutoUpdate = () => {
        this.getBBOInterval = setInterval(this.getBBO, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getBBOInterval) clearInterval(this.getBBOInterval);
    }

    getBBO = () => {
        bestBidAndBestOfferService.getBestBidAndBestOffer()
            .then((res: Array<IBestBidAndBestOffer>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];

                data.forEach(s => {
                    s.quote_condition = QuoteCondition[s.quote_condition as keyof typeof QuoteCondition] || ''
                })

                this.setState({data: data});
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: IBestBidAndBestOffer) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }


    modalTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View BBO'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} BBO`;
        }
    }

    onCallback = async (values: any, open: boolean) => {
        this.getBBO();

        if (open) {
            this.setState({isOpenModal: false}, () => {
                this.openModal('view', values as IBestBidAndBestOffer);
            })
        } else {
            this.closeModal();
        }
    };

    downloadBBOCSV = () => {
        if (this.tableRef.current) {
            bestBidAndBestOfferService.downloadBestBidAndBestOffer(this.tableRef.current.getColumnFilters()).then((res) => {
                downloadFile.CSV('bbo', res);
            })
        }
    }

    downloadBBOXLSX = () => {
        if (this.tableRef.current) {
            bestBidAndBestOfferService.downloadBestBidAndBestOffer(this.tableRef.current.getColumnFilters()).then((res) => {
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
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Best Bid and Best Offer</div>
                        <div className="content__title_btns content__filter download-buttons justify-content-end">
                            <div className="filter-menu filter-menu-best-bid-and-best-offer">
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
                                                onClick={this.downloadBBOCSV}>
                                            <span className="file-item__download"></span>
                                            <span>CSV</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className="border-grey-btn ripple d-flex"
                                                onClick={this.downloadBBOXLSX}>
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
                                            onClick={() => this.openModal('add')}>Add BBO
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
                                   className={`bbo ${this.state.formAction} ${['add', 'edit'].includes(this.state.formAction) ? 'big_modal' : ''}`}
                            >
                                <BestBidAndBestOfferForm
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

export default portalAccessWrapper(BestBidAndBestOfferBlock, 'BestBidAndBestOfferBlock');
