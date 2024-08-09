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
import {IFirm} from "@/interfaces/i-firm";
import FirmForm from "@/components/backend/firm-form";
import {IBank} from "@/interfaces/i-bank";
import {IBankTemplate} from "@/interfaces/i-bank-template";
import adminIconService from "@/services/admin/admin-icon-service";
import AssetImage from "@/components/asset-image";
import publicDirectoryService from "@/services/public-directory/public-directory-service";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import PublicDirectoryForm from "@/components/backend/public-directory-form";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];
let tableFilters: Array<ITableFilter> = []

interface PublicDirectoryBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formFirmData: IDirectoryCompanyProfile | null;
    formAction: string;
    data: Array<IDirectoryCompanyProfile>;
    errors: string[];
    modalTitle: string;
    showSymbolForm: boolean;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class PublicDirectoryBlock extends React.Component<{}> {
    state: PublicDirectoryBlockState;
    getProfileInterval: NodeJS.Timer | number | undefined;
    columnDefinition: any;
    columnValues: any;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formFirmData: null,
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
            showSymbolForm: true,
        }

        const host = `${window.location.protocol}//${window.location.host}`;

        columns = [
            columnHelper.accessor((row) => ({
                company_name: row.company_name,
                logo: row.logo,
            }), {
                id: "company_name",
                cell: (item) =>
                    <>
                        <div className={`table-image`}
                        >
                            <div className="table-image-container">
                                <AssetImage alt=''
                                            src={item.getValue().logo ? `${host}${item.getValue().logo}` : ''}
                                            width={28} height={28}/>
                            </div>
                            {item.getValue().company_name}
                        </div>
                    </>

                ,
                header: () => <span>Company Name</span>,
            }),
            columnHelper.accessor((row) => ({
                asset_class: row.asset_class,
            }), {
                id: "asset_class",
                cell: (item) =>
                    <div
                        className={'d-flex gap-20 public-directory-col tag-block'}>
                        <div className={'flex-1-1-100'}>
                            <div className={'w-100 content__bottom tags'}>
                                {item.getValue().asset_class.length > 0 ? (
                                    <>
                                        {item.getValue().asset_class.map((s: string, idx: number) => (
                                            <React.Fragment key={idx}>
                                                                                            <span
                                                                                                className={'tag'}>{s}</span>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>-</>
                                )}
                            </div>
                        </div>
                    </div>
                ,
                header: () => <span>Asset Classes</span>,
            }),
            columnHelper.accessor((row) => ({
                asset_region: row.asset_region,
            }), {
                id: "asset_region",
                cell: (item) =>
                    <div
                        className={'d-flex gap-20 public-directory-col tag-block'}>
                        <div className={'flex-1-1-100'}>
                            <div className={'w-100 content__bottom tags'}>
                                {item.getValue().asset_region.length > 0 ? (
                                    <>
                                        {item.getValue().asset_region.map((s: string, idx: number) => (
                                            <React.Fragment key={idx}>
                                                <span className={'tag'}>{s}</span>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>-</>
                                )}
                            </div>
                        </div>
                    </div>
                ,
                header: () => <span>Asset Regions</span>,
            }),
            columnHelper.accessor((row) => ({
                network: row.network,
            }), {
                id: "network",
                cell: (item) =>
                    <div
                        className={'d-flex gap-20 public-directory-col tag-block'}>
                        <div className={'flex-1-1-100'}>
                            <div className={'w-100 content__bottom tags'}>
                                {item.getValue().network.length > 0 ? (
                                    <>
                                        {item.getValue().network.map((s: string, idx: number) => (
                                            <React.Fragment key={idx}>
                                                <span className={'tag'}>{s}</span>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : (
                                    <>-</>
                                )}
                            </div>
                        </div>
                    </div>
                ,
                header: () => <span>Networks Currently Live</span>,
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
            columnHelper.accessor((row) => ({
                status: row.profile_status
            }), {
                id: "profile_status",
                cell: (item) =>
                    <div className='status-panel'>
                        <div className={`table__status show table__status-${(item.getValue().status).toLowerCase()}`}>
                            {item.getValue().status}
                        </div>
                    </div>,
                header: () => <span>Profile Status</span>,
            }),
        ];

        tableFilters = [
            {key: 'asset_class', placeholder: 'Asset Class'},
            {key: 'asset_region', placeholder: 'Asset Region'},
            {key: 'network', placeholder: 'Network'},
            {key: 'status', placeholder: 'Status'},
            {key: 'profile_status', placeholder: 'Profile Status'},
        ]
    }

    componentDidMount() {
        this.getFirms()
            .then(() => this.getBank())
            .finally(() => {
                this.setState({loading: false}, () => {
                    this.startAutoUpdate();
                })
            })


    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getFirms = () => {
        return new Promise(resolve => {
            adminService.getDirectoryProfile()
                .then((res: Array<IDirectoryCompanyProfile>) => {
                    const data = res || [];
                    data.forEach(s => {
                        s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                    })
                    this.handleData(data);
                })
                .catch((errors: IError) => {

                })
                .finally(() => {
                    this.setState({isLoading: false},() => resolve(true))
                });
        })
    }

    handleData = (data: Array<IDirectoryCompanyProfile>) => {
        this.setState({data: data ?? null})
    }

    getBank = () => {
        return new Promise(resolve => {
            adminService.getFirmBank()
                .then((res: IBank[]) => {
                    const bank = res[0];

                    const columns = bank.columns;
                    let values = bank.values;

                    const columnsObject = JSON.parse(columns) as any
                    values = values.replace(/'/g, '"');
                    const valuesObject = JSON.parse(values)

                    this.columnDefinition = columnsObject;
                    this.columnValues = valuesObject;

                    this.setState({
                        formBankData: new class implements IBankTemplate {
                            columnDefinition = columnsObject;
                            columnValues = valuesObject
                        }
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

    startAutoUpdate(): void {
        this.getProfileInterval = setInterval(this.getFirms, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getProfileInterval) clearInterval(this.getProfileInterval as number);
    }

    openModal = (mode: string, data?: IFirm) => {

        this.setState({
            isOpenModal: true,
            formAction: mode,
            formFirmData: data || null,
            modalTitle: this.modalTitle(mode)
        })
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this Company?';
        } else if (mode === 'view') {
            return 'View Company'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Company`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false}, async () => {
            await this.getFirms();
        });

    }

    onCallback = async (values: any, step: boolean) => {
        this.closeModal();
        await this.getFirms();
    };

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Public Directory</div>
                        <button className="border-btn ripple modal-link"
                                disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Company
                        </button>
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
                                        <Table columns={columns}
                                               pageLength={pageLength}
                                               data={this.state.data}
                                               searchPanel={true}
                                               block={this}
                                               viewBtn={true}
                                               editBtn={true}
                                               deleteBtn={true}
                                               filters={tableFilters}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No firms available yet"/>
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

                    <PublicDirectoryForm
                        action={this.state.formAction}
                        firmData={this.state.formFirmData}
                        onCallback={this.onCallback}
                    />
                </Modal>

            </>
        )
    }
}

export default PublicDirectoryBlock;
