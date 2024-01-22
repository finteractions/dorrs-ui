import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import {IChartStatistics} from "@/interfaces/i-chart-statistics";
import {IMemberDistributionPerTariff} from "@/interfaces/i-member-distribution-per-tariff";
import {createColumnHelper} from "@tanstack/react-table";
import formatterService from "@/services/formatter/formatter-service";
import filterService from "@/services/filter/filter";
import Table from "@/components/table/table";
import NoDataBlock from "@/components/no-data-block";
import Modal from "@/components/modal";
import {getInvoiceStatusNames, InvoiceStatus} from "@/enums/invoice-status";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IMemberDistribution} from "@/interfaces/i-member-distribution";
import MemberDistributionInfoBlock from "@/components/backend/member-distribution-info-block";
import {IMemberDistributionHistory} from "@/interfaces/i-member-distribution-history";
import {faEye, faStar} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import {ICustomButtonProps} from "@/interfaces/i-custom-button-props";


interface MemberDistributionBlockState {
    isOpenModal: boolean;
    isLoading: boolean;
    isDataLoading: boolean;
    memberDistributionStatisticsData: any[];
    memberDistributionViewData: IMemberDistribution[];
    memberDistributionViewDataFull: IMemberDistribution[];
    memberDistributionViewDataFilter: any;
    memberDistributionHistoryData: IMemberDistributionHistory[];
    memberDistributionHistoryDataFull: IMemberDistributionHistory[];
    memberDistributionHistoryDataFilter: any;
    isMemberDistributionHistory: boolean;
    formData: IMemberDistribution | null;
    errors: string[];
    formAction: string;
    defaultDate: string;
    selectedDate: string;
}

const columnmemberDistributionViewDataHelper = createColumnHelper<any>();
let memberDistributionsDataColumns: any[] = [];

const columnmemberDistributionHistoryDataHelper = createColumnHelper<any>();
let memberDistributionsHistoryColumns: any[] = [];


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
            isLoading: true,
            isDataLoading: true,
            memberDistributionStatisticsData: [],
            memberDistributionViewData: [],
            memberDistributionViewDataFull: [],
            memberDistributionViewDataFilter: [],
            memberDistributionHistoryData: [],
            memberDistributionHistoryDataFull: [],
            memberDistributionHistoryDataFilter: [],
            isMemberDistributionHistory: false,
            errors: [],
            formData: null,
            formAction: 'view',
            defaultDate: '',
            selectedDate: ''
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
                    this.setState({memberDistributionViewDataFull: data, memberDistributionViewData: data}, () => {
                        this.filterMemberDistributionViewData();
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

    getmemberDistributionHistoryData() {
        return new Promise<boolean>(resolve => {
            adminService.getMemberDistributionHistory()
                .then((res: IMemberDistributionHistory[]) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status_name = getInvoiceStatusNames(s.status as InvoiceStatus)
                    });
                    this.setState({memberDistributionHistoryDataFull: data, memberDistributionHistoryData: data}, () => {
                        this.filterMemberDistributionHistoryData();
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

    filterMemberDistributionViewData = () => {
        this.setState({memberDistributionViewData: filterService.filterData(this.state.memberDistributionViewDataFilter, this.state.memberDistributionViewDataFull)});
    }

    filterMemberDistributionHistoryData = () => {
        this.setState({memberDistributionHistoryData: filterService.filterData(this.state.memberDistributionHistoryDataFilter, this.state.memberDistributionHistoryDataFull)});
    }

    closeModal(): void {
        this.setState({isOpenPerTariffModal: false, isOpenModal: false, formData: null});
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

    onCallback = async (values: any) => {
        await this.loadData();
    };

    customBtnAction = (action: any, data: any) => {
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

    handleMemberDistributionViewDataFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            memberDistributionViewDataFilter: {...this.state.memberDistributionViewDataFilter, [prop_name]: item?.value || ''}
        }), () => {
            this.filterMemberDistributionViewData();
        });
    }

    handleMemberDistributionViewDataResetButtonClick = () => {
        this.setState({memberDistributionViewData: this.state.memberDistributionViewDataFull, memberDistributionViewDataFilter: []});
    }

    handleMemberDistributionHistoryDataFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            memberDistributionHistoryDataFilter: {
                ...this.state.memberDistributionHistoryDataFilter,
                [prop_name]: item?.value || ''
            }
        }), () => {
            this.filterMemberDistributionHistoryData();
        });
    }

    handleMemberDistributionHistoryDataResetButtonClick = () => {
        this.setState({memberDistributionHistoryData: this.state.memberDistributionHistoryDataFull, memberDistributionHistoryDataFilter: []});
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
                                <div className={'approve-form-text'}>
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
                                        {this.state.memberDistributionStatisticsData.map(item => {
                                            return (
                                                <div key={item.key}
                                                     className={` statistics flex-25 dashboard__chart ${this.getClassName(item.key)}`}>
                                                    <div className='bold'>{this.getStatisticsTitle(item.key)}</div>
                                                    <div>${formatterService.numberFormat(item.value, 2)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>


                                    <div className="dashboard__transaction__panel">
                                        <div className="content__filter mb-3">
                                            <div className="input__wrap">
                                                <Select
                                                    className="select__react"
                                                    classNamePrefix="select__react"
                                                    isClearable={true}
                                                    isSearchable={true}
                                                    value={filterService.setValue('firm_name', this.state.memberDistributionViewDataFilter)}
                                                    onChange={(item) => this.handleMemberDistributionViewDataFilterChange('firm_name', item)}
                                                    options={filterService.buildOptions('firm_name', this.state.memberDistributionViewDataFull)}
                                                    placeholder="Firm"
                                                />
                                            </div>
                                            <div className="input__wrap">
                                                <Select
                                                    className="select__react"
                                                    classNamePrefix="select__react"
                                                    isClearable={true}
                                                    isSearchable={true}
                                                    value={filterService.setValue('status_name', this.state.memberDistributionViewDataFilter)}
                                                    onChange={(item) => this.handleMemberDistributionViewDataFilterChange('status_name', item)}
                                                    options={filterService.buildOptions('status_name', this.state.memberDistributionViewDataFull)}
                                                    placeholder="Status"
                                                />
                                            </div>


                                            <button
                                                className="content__filter-clear ripple"
                                                onClick={this.handleMemberDistributionViewDataResetButtonClick}>
                                                <FontAwesomeIcon className="nav-icon"
                                                                 icon={filterService.getFilterResetIcon()}/>
                                            </button>
                                        </div>

                                        {this.state.memberDistributionViewData.length ? (
                                            <Table
                                                columns={memberDistributionsDataColumns}
                                                data={this.state.memberDistributionViewData}
                                                searchPanel={false}
                                                block={this}
                                                viewBtn={true}
                                                filter={false}
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
                                                <div className="content__filter mb-3">
                                                    <div className="input__wrap">
                                                        <Select
                                                            className="select__react"
                                                            classNamePrefix="select__react"
                                                            isClearable={true}
                                                            isSearchable={true}
                                                            value={filterService.setValue('date_formatted', this.state.memberDistributionHistoryDataFilter)}
                                                            onChange={(item) => this.handleMemberDistributionHistoryDataFilterChange('date_formatted', item)}
                                                            options={filterService.buildOptions('date_formatted', this.state.memberDistributionHistoryDataFull)}
                                                            placeholder="Date"
                                                        />
                                                    </div>
                                                    <div className="input__wrap">
                                                        <Select
                                                            className="select__react"
                                                            classNamePrefix="select__react"
                                                            isClearable={true}
                                                            isSearchable={true}
                                                            value={filterService.setValue('status_name', this.state.memberDistributionHistoryDataFilter)}
                                                            onChange={(item) => this.handleMemberDistributionHistoryDataFilterChange('status_name', item)}
                                                            options={filterService.buildOptions('status_name', this.state.memberDistributionHistoryDataFull)}
                                                            placeholder="Status"
                                                        />
                                                    </div>


                                                    <button
                                                        className="content__filter-clear ripple"
                                                        onClick={this.handleMemberDistributionHistoryDataResetButtonClick}>
                                                        <FontAwesomeIcon className="nav-icon"
                                                                         icon={filterService.getFilterResetIcon()}/>
                                                    </button>
                                                </div>

                                                {this.state.memberDistributionHistoryData.length ? (
                                                    <Table
                                                        columns={memberDistributionsHistoryColumns}
                                                        data={this.state.memberDistributionHistoryData}
                                                        searchPanel={false}
                                                        block={this}
                                                        viewBtn={false}
                                                        customBtnProps={this.customBtns}
                                                        filter={false}
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

            </>
        )
    }
}

export default MemberDistributionBlock;
