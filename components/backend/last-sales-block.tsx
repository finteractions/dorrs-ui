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
import {ILastSale} from "@/interfaces/i-last-sale";
import {Condition} from "@/enums/condition";
import downloadFile from "@/services/download-file/download-file";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface LastSalesBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: ILastSale | null;
    formAction: string;
    data: ILastSale[];
    errors: string[];
    modalTitle: string;
    dataFull: ILastSale[];
    filterData: any;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class LastSalesBlock extends React.Component<{}> {
    state: LastSalesBlockState;
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
        }

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
            columnHelper.accessor((row) => row.symbol_name, {
                id: "symbol_name",
                cell: (item) => item.getValue(),
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => item.getValue(),
                header: () => <span>Condition</span>,
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
                const data = res?.sort((a, b) => a.id - b.id) || [];

                data.forEach(s => {
                    s.condition = Condition[s.condition as keyof typeof Condition] || ''
                })

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
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
        this.getLastSales();
        this.closeModal();
    };

    downloadLastSaleReportingCSV = () => {
        adminService.downloadLastSales(this.state.filterData).then((res) => {
            downloadFile.CSV('last_sale_reporting', res);
        })
    }

    downloadLastSaleReportingXLSX = () => {
        adminService.downloadLastSales(this.state.filterData).then((res) => {
            downloadFile.XLSX('last_sale_reporting', res);
        })
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
                                                value={filterService.setValue('condition', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('condition', item)}
                                                options={filterService.buildOptions('condition', this.state.dataFull)}
                                                placeholder="Condition"
                                            />
                                        </div>
                                        <div className="input__wrap">
                                            <Select
                                                className="select__react"
                                                classNamePrefix="select__react"
                                                isClearable={true}
                                                isSearchable={true}
                                                value={filterService.setValue('tick_indication', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('tick_indication', item)}
                                                options={filterService.buildOptions('tick_indication', this.state.dataFull)}
                                                placeholder="Tick Indication"
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
                                                value={filterService.setValue('date', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('date', item)}
                                                options={filterService.buildOptions('date', this.state.dataFull)}
                                                placeholder="Date"
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
                                <div className="box__title">Symbol</div>
                                <div
                                    className="box__wrap">{this.state.formData?.symbol_name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Condition</div>
                                <div
                                    className="box__wrap">{Condition[this.state.formData?.condition as keyof typeof Condition] || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Tick Indication</div>
                                <div
                                    className="box__wrap">{this.state.formData?.tick_indication}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Quantity</div>
                                <div
                                    className="box__wrap">{this.state.formData?.quantity ? formatterService.numberFormat(parseFloat(this.state.formData.quantity)) : ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Price</div>
                                <div
                                    className="box__wrap">{this.state.formData?.price ? formatterService.numberFormat(parseFloat(this.state.formData.price)) : ''}</div>
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
                            <div className="view-form-box">
                                <div className="box__title">Created Date</div>
                                <div
                                    className="box__wrap">{formatterService.dateTimeFormat(this.state.formData?.created_at || '')}</div>
                            </div>
                        </div>
                    </div>
                </Modal>

            </>
        )
    }
}

export default LastSalesBlock;
