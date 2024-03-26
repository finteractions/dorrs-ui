import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import Modal from "@/components/modal";
import MembershipForm from "@/components/membership-form";
import formatterService from "@/services/formatter/formatter-service";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface MembershipFormsBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IMembership | null;
    formAction: string;
    data: IMembership[];
    errors: string[];
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

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
        }

        columns = [
            columnHelper.accessor((row) => ({
                name: row.user_name,
                email: row.user_id
            }), {
                id: "user",
                cell: (item) => <div>
                    <span>{item.getValue().name}</span><br/>
                    <span>{item.getValue().email}</span>
                </div>,
                header: () => <span>Name <br/>Email</span>,
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

        tableFilters = [
            {key: 'user_name', placeholder: 'Name'},
            {key: 'user_id', placeholder: 'Email'},
            {key: 'status', placeholder: 'Status'},
        ]
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

                this.setState({data: data});
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
                                    {this.state.data.length ? (
                                        <Table
                                            columns={columns}
                                            pageLength={pageLength}
                                            data={this.state.data}
                                            searchPanel={true}
                                            block={this}
                                            viewBtn={true}
                                            filters={tableFilters}
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
