import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import filterService from "@/services/filter/filter";
import Select from "react-select";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/modal";
import MembershipForm from "@/components/membership-form";
import formatterService from "@/services/formatter/formatter-service";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface MembershipFormsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IMembership | null;
    formAction: string;
    data: IMembership[];
    errors: string[];
    dataFull: IMembership[];
    filterData: any;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class MembershipFormsBlock extends React.Component<{}> {
    state: MembershipFormsBlockState;

    getMembershipFormsInterval!: NodeJS.Timer;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'view',
            data: [],
            errors: [],
            dataFull: [],
            filterData: []
        }

        columns = [
            columnHelper.accessor((row) => row.user_id, {
                id: "user_id",
                cell: (item) => item.getValue(),
                header: () => <span>User</span>,
            }),
            columnHelper.accessor((row) => ({
                status: row.status
            }), {
                id: "status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status table__status-${item.getValue().status.toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
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
        this.getForms();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getForms = () => {
        adminService.getUserMembershipForms()
            .then((res: Array<IMembership>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.created_at) - Date.parse(a.created_at);
                }) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                });

                this.setState({dataFull: data, data: data}, () => {
                    this.filterData();
                });
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    startAutoUpdate(): void {
        this.getMembershipFormsInterval = setInterval(this.getForms, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getMembershipFormsInterval) clearInterval(this.getMembershipFormsInterval);
    }

    openModal = (mode: string, data?: IAdminAsset) => {
        this.setState({isOpenModal: true, formData: data, formAction: mode})
    }

    modalTitle = () => {
        return 'View Membership Form'
    }

    cancelForm(): void {
        this.setState({isOpenModal: false})
    }

    submitForm(): void {
        this.setState({isOpenModal: false})
        this.getForms();
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

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Membership Forms</div>
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
                                                value={filterService.setValue('status', this.state.filterData)}
                                                onChange={(item) => this.handleFilterChange('status', item)}
                                                options={filterService.buildOptions('status', this.state.dataFull)}
                                                placeholder="Status"
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
                                        <Table
                                            columns={columns}
                                            data={this.state.data}
                                            searchPanel={true}
                                            block={this}
                                            viewBtn={true}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No Membership Forms available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.cancelForm()}
                       title={this.modalTitle()}
                >
                    <MembershipForm action={this.state.formAction}
                                    data={this.state.formData}
                                    onCancel={() => this.cancelForm()}
                                    onCallback={() => this.submitForm()}
                                    isAdmin={true}
                    />
                </Modal>
            </>
        )
    }
}

export default MembershipFormsBlock;
