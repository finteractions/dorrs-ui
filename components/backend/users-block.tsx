import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// import Modal from "@/components/modal";
import {faComment} from "@fortawesome/free-solid-svg-icons";
// import UserForm from "@/components/backend/user-form";
import {IUserDetail} from "@/interfaces/i-user-detail";
import adminIconService from "@/services/admin/admin-icon-service";
import UserImage from "@/components/user-image";
import {NextRouter, withRouter} from 'next/router';
import Select from "react-select";
import filterService from "@/services/filter/filter";
import moment from "moment/moment";
import formatterService from "@/services/formatter/formatter-service";
import DateRangePicker from "@/components/date-range-picker";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface UsersBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IUserDetail | null;
    formAction: string;
    data: IUserDetail[];
    errors: string[];
    modalTitle: string;
    dataFull: IUserDetail[];
    filterData: any;
}

interface UsersBlockProps {
    router: NextRouter;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class UsersBlock extends React.Component<UsersBlockProps> {
    state: UsersBlockState;
    dateRangePickerRef: any = React.createRef<typeof DateRangePicker>();
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
            dataFull: [],
            filterData: []
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
        this.getUsersInterval = setInterval(this.getUsers, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getUsersInterval) clearInterval(this.getUsersInterval);
    }

    openModal = (mode: string, data?: IUserDetail) => {
        this.props.router.push(`/backend/user-management/?user=${encodeURIComponent(data?.user_id.email || '')}`);
        // this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    handleResetButtonClick = () => {
        this.dateRangePickerRef.current.onReset();
        this.setState({data: this.state.dataFull, filterData: []});
    }

    handleFilterDateChange = (prop_name: string, startDate: moment.Moment | null, endDate: moment.Moment | null): void => {
        this.setState(({
            filterData: {...this.state.filterData, [prop_name]: {startDate: startDate, endDate: endDate}}
        }), () => {
            this.filterData();
        });
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

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">User Management</div>
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
                                        value={filterService.setValue('name', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('name', item)}
                                        options={filterService.buildOptions('name', this.state.dataFull)}
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('user_id.email', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('user_id.email', item)}
                                        options={filterService.buildOptions('user_id.email', this.state.dataFull)}
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('email_verified_text', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('email_verified_text', item)}
                                        options={filterService.buildOptions('email_verified_text', this.state.dataFull)}
                                        placeholder="Email Verified"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('active_text', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('active_text', item)}
                                        options={filterService.buildOptions('active_text', this.state.dataFull)}
                                        placeholder="Active"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('user_id.account_type', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('user_id.account_type', item)}
                                        options={filterService.buildOptions('user_id.account_type', this.state.dataFull)}
                                        placeholder="Account Type"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('user_id.user_type', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('user_id.user_type', item)}
                                        options={filterService.buildOptions('user_id.user_type', this.state.dataFull)}
                                        placeholder="User Type"
                                    />
                                </div>
                                <div className="input__wrap">
                                    <Select
                                        className="select__react"
                                        classNamePrefix="select__react"
                                        isClearable={true}
                                        isSearchable={true}
                                        value={filterService.setValue('status', this.state.filterData)}
                                        onChange={(item) => this.handleFilterChange('status', item)}
                                        options={filterService.buildOptions('status', this.state.dataFull)}
                                        placeholder="Status"
                                    />
                                </div>
                                <div className="date__range__wrap">
                                    <DateRangePicker
                                        onChange={(startDate, endDate) => {
                                            this.handleFilterDateChange('created_at', startDate, endDate)
                                        }}
                                        onReset={() => {
                                        }}
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
                                <>
                                    <Table
                                        columns={columns}
                                        pageLength={pageLength}
                                        data={this.state.data}
                                        searchPanel={true}
                                        block={this}
                                        viewBtn={true}
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

                {/*<Modal isOpen={this.state.isOpenModal} onClose={() => this.cancelForm()} title={this.state.modalTitle}>*/}
                {/*    <UserForm action={this.state.formAction} data={this.state.formData}*/}
                {/*              onCancel={() => this.cancelForm()} onCallback={() => this.submitForm()}/>*/}
                {/*</Modal>*/}
            </>
        )
    }
}

export default withRouter(UsersBlock);
