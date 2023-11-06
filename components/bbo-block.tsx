import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import bboService from "@/services/bbo/bbo-service";
import {IBBO} from "@/interfaces/i-bbo";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import downloadFile from "@/services/download-file/download-file";
import AssetImage from "@/components/asset-image";
import BBOForm from "@/components/bbo-form";


interface BBOState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: IBBO | null;
    modalTitle: string;
    errors: string[];
    data: IBBO[];
    dataFull: IBBO[];
    filterData: any;
}

interface BBOProps extends ICallback {
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


class BBO extends React.Component<BBOProps, BBOState> {

    state: BBOState;
    errors: Array<string> = new Array<string>();
    getBBOInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: BBOProps, context: IDataContext<null>) {
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
            dataFull: [],
            filterData: [],
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
            columnHelper.accessor((row) => row.quote_condition, {
                id: "quote_condition",
                cell: (item) => item.getValue(),
                header: () => <span>QC </span>,
            }),
            columnHelper.accessor((row) => row.bid_mpid, {
                id: "bid_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Bid MPID </span>,
            }),
            columnHelper.accessor((row) => row.bid_quantity, {
                id: "bid_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Qty </span>,
            }),
            columnHelper.accessor((row) => row.bid_price, {
                id: "bid_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Bid Price </span>,
            }),
            columnHelper.accessor((row) => row.bid_date, {
                id: "bid_date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.bid_time, {
                id: "bid_time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
            }),
            columnHelper.accessor((row) => row.offer_mpid, {
                id: "offer_mpid",
                cell: (item) => item.getValue(),
                header: () => <span>Offer MPID </span>,
            }),
            columnHelper.accessor((row) => row.offer_quantity, {
                id: "offer_quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Qty </span>,
            }),
            columnHelper.accessor((row) => row.offer_price, {
                id: "offer_price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Offer Price </span>,
            }),
            columnHelper.accessor((row) => row.offer_date, {
                id: "offer_date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.offer_time, {
                id: "offer_time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];
    }

    navigate = (symbol: string) => {
        this.props.onCallback(symbol);
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getBBO();
        // this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getBBOInterval = setInterval(this.getBBO, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getBBOInterval) clearInterval(this.getBBOInterval);
    }

    getBBO = () => {
        bboService.getBBO()
            .then((res: Array<IBBO>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];

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
    openModal = (mode: string, data?: IBBO) => {
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
                this.openModal('edit', values as IBBO);
            })
        } else {
            this.closeModal();
        }
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
        bboService.downloadBBO(this.state.filterData).then((res) => {
            downloadFile.CSV('bbo', res);
        })
    }

    downloadBBOXLSX = () => {
        bboService.downloadBBO(this.state.filterData).then((res) => {
            downloadFile.XLSX('bbo', res);
        })
    }

    render() {
        return (

            <>
                <div className="panel">
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
                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('add')}>Add BBO
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
                                            value={filterService.setValue('bid_mpid', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('bid_mpid', item)}
                                            options={filterService.buildOptions('bid_mpid', this.state.dataFull)}
                                            placeholder="Bid MPID"
                                        />
                                    </div>
                                    <div className="input__wrap">
                                        <Select
                                            className="select__react"
                                            classNamePrefix="select__react"
                                            isClearable={true}
                                            isSearchable={true}
                                            value={filterService.setValue('offer_mpid', this.state.filterData)}
                                            onChange={(item) => this.handleFilterChange('offer_mpid', item)}
                                            options={filterService.buildOptions('offer_mpid', this.state.dataFull)}
                                            placeholder="Offer MPID"
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
                                           editBtn={true}
                                           viewBtn={true}
                                           access={this.props.access}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>

                            <Modal isOpen={this.state.isOpenModal}
                                   onClose={() => this.closeModal()}
                                   title={this.state.modalTitle}
                                   className={`bbo ${this.state.formAction}`}
                            >
                                <BBOForm
                                    action={this.state.formAction}
                                    data={this.state.formData}
                                    onCallback={this.onCallback}
                                />
                            </Modal>


                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(BBO, 'BBO');
