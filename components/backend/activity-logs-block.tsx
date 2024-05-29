import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {IActivityLog} from "@/interfaces/i-activity-log";
import {getLogActivitySourceTypeNames, LogActivitySourceType} from "@/enums/log-activity-source-type";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface ActivityLogsBlockState {
    loading: boolean;
    data: IActivityLog[];
    errors: string[];
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class ActivityLogsBlock extends React.Component<{}> {
    state: ActivityLogsBlockState;
    getActivityLogsInterval: NodeJS.Timer | number | undefined;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            errors: [],
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
            columnHelper.accessor((row) => row.source, {
                id: "source",
                cell: (item) => item.getValue(),
                header: () => <span>Source</span>,
            }),
            columnHelper.accessor((row) => row.details, {
                id: "details",
                cell: (item) => item.getValue(),
                header: () => <span>Details</span>,
            }),
            columnHelper.accessor((row) => row.ip_user, {
                id: "ip_user",
                cell: (item) => item.getValue(),
                header: () => <span>IP</span>,
            }),
            columnHelper.accessor((row) => row.georegion, {
                id: "georegion",
                cell: (item) => item.getValue(),
                header: () => <span>Location</span>,
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
            {key: 'source', placeholder: 'Source'},
            {key: 'ip_user', placeholder: 'IP'},
            {key: 'georegion', placeholder: 'Location'},
            {key: 'created_at', placeholder: 'Created Date', type: 'datePickerRange'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getActivityLogs()
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getActivityLogs = () => {
        adminService.getActivityLogs()
            .then((res: IActivityLog[]) => {
                const data = res?.sort((a, b) => b.id - a.id) || [];

                data.forEach(s => {
                    s.source = getLogActivitySourceTypeNames(s.source as LogActivitySourceType);
                    s.details = s.log?.details;
                })
                this.setState({dataFull: data, data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getActivityLogsInterval = setInterval(this.getActivityLogs, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getActivityLogsInterval) clearInterval(this.getActivityLogsInterval as number);
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
                            {this.state.data.length ? (
                                <Table
                                    columns={columns}
                                    pageLength={pageLength}
                                    data={this.state.data}
                                    searchPanel={true}
                                    block={this}
                                    filters={tableFilters}
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
                        </>
                    )}
                </div>

            </>
        )
    }
}

export default ActivityLogsBlock;
