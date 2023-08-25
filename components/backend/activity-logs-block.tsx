import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {IActivityLog} from "@/interfaces/i-activity-log";
import {IBlacklist} from "@/interfaces/i-blacklist";
import Modal from "@/components/modal";
import BlacklistForm from "@/components/backend/blacklist-form";
import moment from "moment";
import filterService from "@/services/filter/filter";
import DateRangePicker from "@/components/date-range-picker";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let customBtns: {};

interface ActivityLogsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IBlacklist | null;
    formAction: string;
    data: IActivityLog[];
    dataBlacklist: IBlacklist[];
    errors: string[];
    modalTitle: string;
    dataFull: IActivityLog[];
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class ActivityLogsBlock extends React.Component<{}> {
    state: ActivityLogsBlockState;
    dateRangePickerRef: any = React.createRef<typeof DateRangePicker>();
    getActivityLogsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'view',
            data: [],
            dataBlacklist: [],
            errors: [],
            modalTitle: '',
            dataFull: [],
            filterData: []
        }

        columns = [
            columnHelper.accessor((row) => row.user_id, {
                id: "user_id",
                cell: (item) => item.getValue(),
                header: () => <span>User</span>,
            }),
            columnHelper.accessor((row) => row.action, {
                id: "action",
                cell: (item) => item.getValue(),
                header: () => <span>Action</span>,
            }),
            columnHelper.accessor((row) => row.ip_address, {
                id: "ip_address",
                cell: (item) => item.getValue(),
                header: () => <span>IP</span>,
            }),
            columnHelper.accessor((row) => row.country_region_city, {
                id: "country_region_city",
                cell: (item) => item.getValue(),
                header: () => <span>Near</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];

        // columnsBlacklist = [
        //     columnHelper.accessor((row) => row.user_id, {
        //         id: "user_id",
        //         cell: (item) => item.getValue(),
        //         header: () => <span>User</span>,
        //     }),
        //     columnHelper.accessor((row) => row.ip_address, {
        //         id: "ip_address",
        //         cell: (item) => item.getValue(),
        //         header: () => <span>IP</span>,
        //     }),
        //     columnHelper.accessor((row) => ({
        //         blocked_by: row.blocked_by,
        //         comment: row.comment,
        //     }), {
        //         id: "blocked_by",
        //         cell: (item) =>
        //             <div className='status-panel'>
        //                 <div>{item.getValue().blocked_by}</div>
        //                 {item.getValue().comment ? <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon className="nav-icon" icon={faComment}/></div> : ''}
        //             </div>,
        //         header: () => <span>Blocked By</span>,
        //     }),
        //     columnHelper.accessor((row) => row.created_at, {
        //         id: "created_at",
        //         cell: (item) => formatterService.dateTimeFormat(item.getValue()),
        //         header: () => <span>Created Date</span>,
        //     }),
        // ];

        customBtns = {
            'Block IP': 'blockIp',
        }
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getBlacklist();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getBlacklist = () => {
        adminService.getBlacklist()
            .then((res: IBlacklist[]) => {
                const data = res?.sort((a, b) => b.id - a.id) || [];
                this.setState({dataBlacklist: data});
                this.getActivityLogs();
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
    }

    getActivityLogs = () => {
        adminService.getActivityLogs()
            .then((res: IActivityLog[]) => {
                const data = res?.sort((a, b) => b.id - a.id) || [];

                data.forEach(s => {
                    const country = s.country ? `${s.country}, ` : ''
                    const city = s.city || ''
                    s.country_region_city = `${country}${city}`
                    s.blockIpBtnDisabled = this.state.dataBlacklist.some(item => (item.ip_address === s.ip_address && item.user_id === s.user_id));
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

    blockIp = (values: IBlacklist) => {
        adminService.updateBlacklistStatus(values.ip_address, true, values.user_id, 'Blocked from Activity Logs')
            .then((res: any) => {
                this.getBlacklist();
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
    };

    startAutoUpdate(): void {
        this.getActivityLogsInterval = setInterval(this.getBlacklist, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getActivityLogsInterval) clearInterval(this.getActivityLogsInterval);
    }

    openModal = (mode: string, data?: IBlacklist) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    customBtnAction = (action: any, data: any) => {
        if (action === 'blockIp') this.blockIp(data)
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        this.setState({isOpenModal: false})
        this.getBlacklist();
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this IP address?';
        } else if  (mode === 'add') {
            return `Add IP Address`;
        }
    }

    handleResetButtonClick = () => {
        this.dateRangePickerRef.current.onReset();
        this.setState({data: this.state.dataFull, filterData: []});
    }

    handleFilterDateChange = (prop_name: string, startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
        this.setState(({
            filterData: { ...this.state.filterData, [prop_name]: {startDate: startDate, endDate: endDate} }
        }), () => {
            this.filterData();
        });
    }

    handleFilterChange = (prop_name: string, item: any): void => {
        this.setState(({
            filterData: { ...this.state.filterData, [prop_name]: item?.value || ''}
        }), () => {
            this.filterData();
        });
    }
    filterData = () => {
        this.setState({data: filterService.filterData(this.state.filterData, this.state.dataFull)});
    }

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Activity Logs</div>
                    </div>

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
                                        value={filterService.setValue('user_id', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('user_id', item)}
                                        options={filterService.buildOptions('user_id', this.state.dataFull)}
                                        placeholder="User"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('action', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('action', item)}
                                        options={filterService.buildOptions('action', this.state.dataFull)}
                                        placeholder="Action"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('ip_address', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('ip_address', item)}
                                        options={filterService.buildOptions('ip_address', this.state.dataFull)}
                                        placeholder="IP"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('country_region_city', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('country_region_city', item)}
                                        options={filterService.buildOptions('country_region_city', this.state.dataFull)}
                                        placeholder="Near"
                                    />
                                </div>
                                <div className="date__range__wrap">
                                    <DateRangePicker
                                        onChange={(startDate, endDate) => {this.handleFilterDateChange('created_at',startDate, endDate)}}
                                        onReset={() => {}}
                                        ref={this.dateRangePickerRef}
                                    />
                                </div>
                                <button
                                    className="content__filter-clear ripple"
                                    onClick={this.handleResetButtonClick}>
                                    <FontAwesomeIcon className="nav-icon" icon={filterService.getFilterResetIcon()}/>
                                </button>
                            </div>

                            {this.state.data.length ? (
                                <Table
                                    columns={columns}
                                    data={this.state.data}
                                    searchPanel={true}
                                    block={this}
                                    customBtns={customBtns}
                                />
                            ) : (
                                <>
                                    {this.state.errors.length ? (
                                        <AlertBlock type="error" messages={this.state.errors}/>
                                    ) : (
                                        <NoDataBlock primaryText="No Activity Log available yet"/>
                                    )}
                                </>
                            )}

                            {/*<div className="content__top mt-5">*/}
                            {/*    <div className="content__title">Blacklist (IP)</div>*/}
                            {/*    <button className="border-btn ripple modal-link"*/}
                            {/*            disabled={this.state.loading} onClick={() => this.openModal('add')}>Add IP*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                            {/*{this.state.dataBlacklist.length ? (*/}
                            {/*    <Table*/}
                            {/*        columns={columnsBlacklist}*/}
                            {/*        data={this.state.dataBlacklist}*/}
                            {/*        searchPanel={true}*/}
                            {/*        block={this}*/}
                            {/*        deleteBtn={true}*/}
                            {/*        filter={true}*/}
                            {/*    />*/}
                            {/*) : (*/}
                            {/*    <>*/}
                            {/*        {this.state.errors.length ? (*/}
                            {/*            <AlertBlock type="error" messages={this.state.errors}/>*/}
                            {/*        ) : (*/}
                            {/*            <NoDataBlock primaryText="No Blacklist available yet"/>*/}
                            {/*        )}*/}
                            {/*    </>*/}
                            {/*)}*/}


                        </>
                    )}

                    <Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.state.modalTitle}>
                        <BlacklistForm action={this.state.formAction} data={this.state.formData}
                                       onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()}/>
                    </Modal>
                </div>

            </>
        )
    }
}

export default ActivityLogsBlock;
