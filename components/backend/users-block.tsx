import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import {IUserDetail} from "@/interfaces/i-user-detail";
import adminIconService from "@/services/admin/admin-icon-service";
import UserImage from "@/components/user-image";
import {NextRouter, withRouter} from 'next/router';
import formatterService from "@/services/formatter/formatter-service";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface UsersBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IUserDetail | null;
    formAction: string;
    data: IUserDetail[];
    errors: string[];
    modalTitle: string;
}

interface UsersBlockProps {
    router: NextRouter;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class UsersBlock extends React.Component<UsersBlockProps> {
    state: UsersBlockState;
    getUsersInterval!: NodeJS.Timer;

    constructor(props: UsersBlockProps) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'view',
            data: [],
            errors: [],
            modalTitle: '',
        }

        columns = [
            columnHelper.accessor((row) => ({
                name: row.name,
                user_image: row.user_image
            }), {
                id: "name",
                cell: (item) =>
                    <div className={'table-image'}>
                        <UserImage alt={'Profile Image'} src={item.getValue().user_image || ''} width="28px"
                                   height="28px"/>
                        {item.getValue().name}
                    </div>,
                header: () => <span>Name</span>,
            }),

            columnHelper.accessor((row) => row.user_id.email, {
                id: "email",
                cell: (item) => item.getValue(),
                header: () => <span>Email</span>,
            }),
            columnHelper.accessor((row) => row.user_id.email_verified, {
                id: "email_verified",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>Email Verified</span>,
            }),
            columnHelper.accessor((row) => row.active, {
                id: "active",
                cell: (item) => <FontAwesomeIcon className="nav-icon"
                                                 icon={adminIconService.iconBoolean(item.getValue())}/>,
                header: () => <span>Active</span>,
            }),
            columnHelper.accessor((row) => row.user_id.account_type, {
                id: "account_type",
                cell: (item) => item.getValue(),
                header: () => <span>Account Type</span>,
            }),
            columnHelper.accessor((row) => row.user_id.user_type, {
                id: "user_type",
                cell: (item) => item.getValue(),
                header: () => <span>User Type</span>,
            }),
            columnHelper.accessor((row) => ({
                comment_status: row.comment_status,
                comment: row.comment,
                status: row.status
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
                        {item.getValue().comment_status ?
                            <div title={item.getValue().comment} className="status-comment"><FontAwesomeIcon
                                className="nav-icon" icon={faComment}/></div> : ''}
                    </div>,
                header: () => <span>Status</span>,
            }),
            columnHelper.accessor((row) => row.created_at, {
                id: "created_at",
                cell: (item) => formatterService.dateTimeFormat(item.getValue()),
                header: () => <span>Created Date</span>,
            }),
        ];

        tableFilters = [
            {key: 'name', placeholder: 'Name'},
            {key: 'user_id.email', placeholder: 'Email'},
            {key: 'email_verified_text', placeholder: 'Email Verified'},
            {key: 'active_text', placeholder: 'Active'},
            {key: 'user_id.account_type', placeholder: 'Account Type'},
            {key: 'user_id.user_type', placeholder: 'User Type'},
            {key: 'status', placeholder: 'Status'},
            {key: 'created_at', placeholder: 'Created Date', type: 'datePickerRange'},
        ]
    }

    componentDidMount() {
        this.setState({loading: true});

        this.getUsers();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getUsers = () => {
        adminService.getUsers()
            .then((res: IUserDetail[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];

                data.forEach(s => {
                    s.name = `${s.user_id.first_name} ${s.user_id.last_name}`
                    s.status = s.approved_by ? s.is_approved ? 'Approved' : 'Rejected' : 'Pending'
                    s.active = !s.user_id.is_blocked
                    s.active_text = s.active ? 'Yes' : 'No'
                    s.email_verified_text = s.user_id.email_verified ? 'Yes' : 'No'
                    s.comment_status = !!s.comment
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
        this.getUsersInterval = setInterval(this.getUsers, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getUsersInterval) clearInterval(this.getUsersInterval);
    }

    openModal = (mode: string, data?: IUserDetail) => {
        this.props.router.push(`/backend/user-management/?user=${encodeURIComponent(data?.user_id.email || '')}`);
    }

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Users</div>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.data.length ? (
                                <>
                                    <Table
                                        columns={columns}
                                        pageLength={pageLength}
                                        data={this.state.data}
                                        searchPanel={true}
                                        block={this}
                                        viewBtn={true}
                                        filters={tableFilters}
                                    />
                                </>

                            ) : (
                                <>
                                    {this.state.errors.length ? (
                                        <AlertBlock type="error" messages={this.state.errors}/>
                                    ) : (
                                        <NoDataBlock primaryText="No Users available yet"/>
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

export default withRouter(UsersBlock);
