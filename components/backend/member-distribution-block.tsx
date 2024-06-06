import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IChartStatistics} from "@/interfaces/i-chart-statistics";
import {IMemberDistributionPerTariff} from "@/interfaces/i-member-distribution-per-tariff";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import Modal from "@/components/modal";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import MemberDistributionInfoBlock from "@/components/backend/member-distribution-info-block";
import {IMemberDistributionHistory} from "@/interfaces/i-member-distribution-history";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";


interface MemberDistributionBlockState {
    isOpenModal: boolean;
    isStatisticsOpenModal: boolean;
    isLoading: boolean;
    isDataLoading: boolean;
    memberDistributionStatisticsData: any[];
    memberDistributionViewData: IMemberDistribution[];
    memberDistributionHistoryData: IMemberDistributionHistory[];
    isMemberDistributionHistory: boolean;
    formData: IMemberDistribution | null;
    errors: string[];
    formAction: string;
    defaultDate: string;
    selectedDate: string;
    statistics: IChartStatistics | null;
}

const columnmemberDistributionViewDataHelper = createColumnHelper<any>();
let memberDistributionsDataColumns: any[] = [];
let memberDistributionsDataFilters: Array<ITableFilter> = []

const columnmemberDistributionHistoryDataHelper = createColumnHelper<any>();
let memberDistributionsHistoryColumns: any[] = [];
let memberDistributionsHistoryFilters: Array<ITableFilter> = []

const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class MemberDistributionBlock extends React.Component<{}> {
    state: MemberDistributionBlockState;
    dates: Array<string>;

    customBtns: Array<ICustomButtonProps> = [
        {
            icon: <FontAwesomeIcon className="nav-icon" icon={faEye}/>,
            onCallback: 'customBtnAction'
        }
    ]

    constructor(props: {}) {
        super(props);

        this.state = {
            isOpenModal: false,
            isStatisticsOpenModal: false,
            isLoading: true,
            isDataLoading: true,
            memberDistributionStatisticsData: [],
            memberDistributionViewData: [],
            memberDistributionHistoryData: [],
            isMemberDistributionHistory: false,
            errors: [],
            formData: null,
            formAction: 'view',
            defaultDate: '',
            selectedDate: '',
            statistics: null
        }

        memberDistributionsDataColumns = [
            columnmemberDistributionViewDataHelper.accessor((row) => row.firm_name, {
                id: "firm_name",
                cell: (item) => item.getValue(),
                header: () => <span>Firm</span>,
            }),
            columnmemberDistributionViewDataHelper.accessor((row) => row.due_amount, {
                id: "due_amount",
                cell: (item) => formatterService.numberFormat(item.getValue(), 2),
                header: () => <span>Due Amount</span>,
            }),
            columnmemberDistributionViewDataHelper.accessor((row) => ({
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
            columnmemberDistributionViewDataHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        memberDistributionsHistoryColumns = [
            columnmemberDistributionHistoryDataHelper.accessor((row) => row.date_formatted, {
                id: "date_formatted",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnmemberDistributionHistoryDataHelper.accessor((row) => ({
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
            columnmemberDistributionHistoryDataHelper.accessor((row) => row.updated_at, {
                id: "updated_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Updated Date</span>,
            }),
        ];

        memberDistributionsDataFilters = [
            {key: 'firm_name', placeholder: 'Firm'},
            {key: 'status_name', placeholder: 'Status'},
        ];

        memberDistributionsHistoryFilters = [
            {key: 'date_formatted', placeholder: 'Date'},
            {key: 'status_name', placeholder: 'Status'},
        ];

        this.dates = [];
    }

    componentDidMount() {
        this.getDates()
    }

    getDates() {
        adminService.getMemberDistributionDates().then((res: any) => {
            this.dates = res;
        })
            .then(() => {
                const date = this.dates[0] || '';
                this.setState({defaultDate: date, selectedDate: date});
            })
            .finally(() => {
                this.setState({isLoading: false}, async () => {
                    await this.loadData()
                });
            })
    }


    getStatistics(values: any) {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributionStatistics(values)
                .then((res: Array<IChartStatistics>) => {
                    this.setState({memberDistributionStatisticsData: res})

                })
                .finally(() => {
                    resolve(true)
                })
        })
    }

    getmemberDistributionViewData(values: any) {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributions(values)
                .then((res: IMemberDistribution[]) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    });
                    this.setState({memberDistributionViewData: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getmemberDistributionHistoryData() {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributionHistory()
                .then((res: IMemberDistributionHistory[]) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    });
                    this.setState({memberDistributionHistoryData: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }


    loadData() {
        const body = {
            date: this.state.selectedDate
        }
        return new Promise(resolve => {
            this.getStatistics(body)
                .then(() => this.getmemberDistributionViewData(body))
                .then(() => !this.state.isMemberDistributionHistory ? this.getmemberDistributionHistoryData() : null)
                .finally(() => {
                    this.setState({isLoading: false, isDataLoading: false})
                    resolve(true);
                })
        })
    }

    getClassName(name: string) {
        const statuses: any = {
            'total_forecast': 'bg-light-blue',
            'total_approved': 'bg-light-green',
            'total_payment_due': 'bg-light-yellow',
            'total_commission': 'bg-light-red',
        }

        return statuses[name.toLowerCase()] || '#000'
    }

    getStatisticsTitle(name: string) {
        const titles: any = {
            'total_forecast': 'Total Forecast',
            'total_approved': 'Total Approved',
            'total_payment_due': 'Total Payment Due',
            'total_commission': 'DORRS Commission',
        }

        return titles[name.toLowerCase()] || ''
    }

    openModal = (mode: string, data?: IMemberDistributionPerTariff) => {
        this.setState({formAction: mode, formData: data || null, isOpenModal: true})
    }

    openStatisticsModal(statistics: IChartStatistics): void {
        this.setState({isStatisticsOpenModal: true, statistics: statistics});
    }

    closeModal(): void {
        this.setState({isOpenModal: false, isStatisticsOpenModal: false, formData: null});
    }

    onCallback = async (values: any) => {
        await this.loadData();
    };

    customBtnAction = (data: any) => {
        this.changeView(data.date_formatted)
    }

    changeView = (date?: any) => {
        this.setState({
            isMemberDistributionHistory: !this.state.isMemberDistributionHistory,
            selectedDate: date ?? this.state.defaultDate,
            isDataLoading: true
        }, async () => {
            await this.loadData();
        })
    }

    render() {
        return (

            <>
                <div className="dashboard section">
                    <div className="content__top">
                        <div className="content__title">Member Distribution</div>
                    </div>


                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className={'approve-form mx-0'}>
                                <div className={'approve-form-text d-flex-1'}>
                                    Date: {this.state.selectedDate}
                                </div>
                                {this.state.isMemberDistributionHistory && (
                                    <button
                                        className={`border-btn ripple modal-link ${this.state.isDataLoading ? 'disable' : ''}`}
                                        disabled={this.state.isDataLoading}
                                        onClick={() => this.changeView()}>Back
                                    </button>
                                )}
                            </div>

                            {this.state.isDataLoading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    <div className="view_panel statistics__panel flex-1 mx-0 mb-4">
                                        {this.state.memberDistributionStatisticsData.map((item: IChartStatistics) => {
                                            return (
                                                <div key={item.key}
                                                     className={` statistics flex-25 dashboard__chart ${this.getClassName(item.key)}`}>
                                                    <div>
                                                        <div className='bold'>{this.getStatisticsTitle(item.key)}</div>
                                                        <div>${formatterService.numberFormat(Number(item.value), 2)}</div>
                                                    </div>
                                                    {(item.percentage || item.count) && (
                                                        <div>
                                                            <button
                                                                onClick={() => this.openStatisticsModal(item)}
                                                                className={`admin-table-btn ripple ${this.getClassName(item.key)}`}>
                                                                <FontAwesomeIcon
                                                                    className="nav-icon" icon={faEye}/></button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>


                                    <div className="dashboard__transaction__panel">
                                        {this.state.memberDistributionViewData.length ? (
                                            <Table
                                                columns={memberDistributionsDataColumns}
                                                pageLength={pageLength}
                                                data={this.state.memberDistributionViewData}
                                                searchPanel={false}
                                                block={this}
                                                viewBtn={true}
                                                filters={memberDistributionsDataFilters}
                                            />
                                        ) : (
                                            <div className={'mt-24'}>
                                                <NoDataBlock primaryText="No data available yet"/>
                                            </div>
                                        )}
                                    </div>

                                    {!this.state.isMemberDistributionHistory && (
                                        <>
                                            <div className={'info-panel-title-text my-4 bold'}>
                                                Invoices
                                            </div>
                                            <div className="dashboard__transaction__panel">
                                                {this.state.memberDistributionHistoryData.length ? (
                                                    <Table
                                                        columns={memberDistributionsHistoryColumns}
                                                        pageLength={pageLength}
                                                        data={this.state.memberDistributionHistoryData}
                                                        searchPanel={false}
                                                        block={this}
                                                        viewBtn={false}
                                                        customBtnProps={this.customBtns}
                                                        filters={memberDistributionsHistoryFilters}
                                                    />
                                                ) : (
                                                    <div className={'mt-24'}>
                                                        <NoDataBlock primaryText="No invoices available yet"/>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {this.state.errors.length > 0 && (
                                <AlertBlock type="error" messages={this.state.errors}/>
                            )}
                        </>
                    )}
                </div>


                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={'View Member Distribution'}
                       className={'big_modal'}
                >

                    <MemberDistributionInfoBlock data={this.state.formData} onCallback={this.onCallback}/>
                </Modal>

                <Modal isOpen={this.state.isStatisticsOpenModal}
                       onClose={() => this.closeModal()}
                       title={`View ${this.getStatisticsTitle(this.state.statistics?.key || '')}`}
                       className={''}
                >

                    <div className="view_panel flex-1 mx-0 row-gap-25">
                        {this.state.statistics?.value && (
                            <div className="view_block">
                                <div className="view_block_title bold">Amount</div>
                                <div>{formatterService.numberFormat(Number(this.state.statistics?.value), 2)}</div>
                            </div>
                        )}
                        {this.state.statistics?.count && (
                            <div className="view_block">
                                <div className="view_block_title bold">User count:</div>
                                <div>{formatterService.numberFormat(Number(this.state.statistics?.count), 0)}</div>
                            </div>
                        )}
                        {this.state.statistics?.percentage && (
                            <div className="view_block">
                                <div className="view_block_title bold">DORRS Fee Commission:</div>
                                <div>{formatterService.numberFormat(Number(this.state.statistics?.percentage), 0)}%</div>
                            </div>
                        )}

                    </div>
                </Modal>

            </>
        )
    }
}

export default MemberDistributionBlock;
