import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import Link from 'next/link';
import {IActivityLog} from "@/interfaces/i-activity-log";
import {IBlacklist} from "@/interfaces/i-blacklist";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import {getLogActivitySourceTypeNames, LogActivitySourceType} from "@/enums/log-activity-source-ty[e";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let columnsBlacklist: any[] = [];

interface UserActivityLogsBlockState {
    loading: boolean;
    loadingBlacklist: boolean;
    data: IActivityLog[];
    dataBlacklist: IBlacklist[];
    errors: string[];
    errorsBlacklist: string[];

}

interface UserActivityLogsBlockProps {
    user_id: string
}

class UserActivityLogsBlock extends React.Component<UserActivityLogsBlockProps> {
    state: UserActivityLogsBlockState;


    constructor(props: UserActivityLogsBlockProps) {
        super(props);

        this.state = {
            loading: true,
            loadingBlacklist: true,
            data: [],
            dataBlacklist: [],
            errors: [],
            errorsBlacklist: [],
        }

        columns = [
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

        columnsBlacklist = [
            columnHelper.accessor((row) => row.ip_address, {
                id: "ip_address",
                cell: (item) => item.getValue(),
                header: () => <span>IP</span>,
            }),
            columnHelper.accessor((row) => ({
                blocked_by: row.blocked_by,
                comment: row.comment,
            }), {
                id: "blocked_by",
                cell: (item) =>
                    <div className='status-panel'>
                        <div>{item.getValue().blocked_by}</div>
                        {item.getValue().comment ?
                            <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon
                                className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Blocked By</span>,
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
        this.getUserActivityLogs();
    }

    getUserActivityLogs = () => {

        adminService.getUserActivityLogs(this.props.user_id)
            .then((res: IActivityLog[]) => {
                const data = res.sort((a, b) => b.id - a.id);
                data.forEach(s => {
                    s.source = getLogActivitySourceTypeNames(s.source as LogActivitySourceType);
                    s.details = s.log?.details;
                })
                this.setState({data: data});
                this.getUserBlacklist();
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    getUserBlacklist = () => {
        adminService.getBlacklist()
            .then((res: IBlacklist[]) => {
                const data = res.sort((a, b) => b.id - a.id).filter(i => i.user_id === this.props.user_id);
                this.setState({dataBlacklist: data});
            })
            .catch((errors: IError) => {
                this.setState({errorsBlacklist: errors.messages});
            })
            .finally(() => {
                this.setState({loadingBlacklist: false})
            });
    }

    render() {
        return (

            <>
                <div className="info-panel-section activitylogs">
                    <div className="info-panel-section-title mb-2">
                        <div className='info-panel-title-text'>Activity Logs <span
                            className='info-panel-section-sub-title'>(last 10 actions)</span></div>

                        <Link className='link info-panel-title-link' href="/backend/activity-logs">
                            All history
                        </Link>
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
                                        <Table
                                            columns={columns}
                                            data={this.state.data.slice(0, 10)}
                                            filter={false}
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
                        </>
                    )}
                </div>

                {/*<div className="info-panel-section blacklist">*/}
                {/*    <div className="info-panel-section-title mb-2">*/}
                {/*        <div className='info-panel-title-text'>Blacklist (IP)</div>*/}

                {/*        <Link className='link info-panel-title-link' href="/backend/blacklist">*/}
                {/*            All blacklist*/}
                {/*        </Link>*/}
                {/*    </div>*/}

                {/*    {this.state.loadingBlacklist ? (*/}
                {/*        <LoaderBlock/>*/}
                {/*    ) : (*/}
                {/*        <>*/}
                {/*            {this.state.loadingBlacklist ? (*/}
                {/*                <LoaderBlock/>*/}
                {/*            ) : (*/}
                {/*                <>*/}
                {/*                    {this.state.dataBlacklist.length ? (*/}
                {/*                        <Table*/}
                {/*                            columns={columnsBlacklist}*/}
                {/*                            data={this.state.dataBlacklist}*/}
                {/*                            filter={false}*/}
                {/*                        />*/}
                {/*                    ) : (*/}
                {/*                        <>*/}
                {/*                            {this.state.errorsBlacklist.length ? (*/}
                {/*                                <AlertBlock type="error" messages={this.state.errorsBlacklist}/>*/}
                {/*                            ) : (*/}
                {/*                                <NoDataBlock primaryText="No Blacklist available yet"/>*/}
                {/*                            )}*/}
                {/*                        </>*/}
                {/*                    )}*/}
                {/*                </>*/}
                {/*            )}*/}
                {/*        </>*/}
                {/*    )}*/}
                {/*</div>*/}

            </>
        )
    }
}

export default UserActivityLogsBlock;
