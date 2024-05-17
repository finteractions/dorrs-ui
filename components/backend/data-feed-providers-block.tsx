import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import Modal from "@/components/modal";
import DataFeedProviderForm from "@/components/backend/data-feed-provider-form";
import AssetImage from "@/components/asset-image";
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";


const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface DataFeedProvidersBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formDataFeedProviderData: IDataFeedProvider | null;
    formDataFeedProviderLinks: ISettings[];
    formAction: string;
    data: IDataFeedProvider[];
    errors: string[];
    modalTitle: string;
}

interface DataFeedProvidersBlockProps extends ICallback {

}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';
const pageLength = Number(process.env.AZ_PAGE_LENGTH)

class DataFeedProvidersBlock extends React.Component<DataFeedProvidersBlockProps, DataFeedProvidersBlockState> {
    state: DataFeedProvidersBlockState;
    getAssetsInterval!: NodeJS.Timer;

    constructor(props: DataFeedProvidersBlockProps) {
        super(props);

        const host = `${window.location.protocol}//${window.location.host}`;

        this.state = {
            loading: true,
            isOpenModal: false,
            formDataFeedProviderData: null,
            formDataFeedProviderLinks: [],
            formAction: 'add',
            data: [],
            errors: [],
            modalTitle: '',
        }

        columns = [
            columnHelper.accessor((row) => ({
                name: row.name,
                image: row.logo
            }), {
                id: "name",
                cell: (item) =>
                    <div className={`table-image cursor-pointer link`}
                         onClick={() => {
                             this.navigate(item.getValue().name)
                         }}
                    >
                        <div className="table-image-container">
                            <AssetImage alt='' src={item.getValue().image ? `${item.getValue().image}` : ''}
                                        width={28} height={28}/>
                        </div>
                        {item.getValue().name}
                    </div>
                ,
                header: () => <span>Name</span>,
            }),
        ];
    }

    navigate = (name: string) => {
        this.props.onCallback(name);
    }

    componentDidMount() {
        this.getDataFeedProviders()
            .then(() => this.getDataFeedProviderLinks())
            .finally(() => {
                this.setState({loading: false}, () => {
                    this.startAutoUpdate();
                })
            })
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    getDataFeedProviders = () => {
        return new Promise(resolve => {
            adminService.getDataFeedProviders()
                .then((res: IDataFeedProvider[]) => {
                    const data = res || [];
                    this.setState({data: data});
                })
                .catch((errors: IError) => {
                    this.setState({errors: errors.messages});
                })
                .finally(() => {
                    resolve(true)
                });
        })
    }

    getDataFeedProviderLinks = () => {
        return new Promise(resolve => {
            dataFeedProvidersService.getLinks()
                .then((res: ISettings[]) => {
                    const data = res || [];
                    this.setState({formDataFeedProviderLinks: data});
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
        this.getAssetsInterval = setInterval(this.getDataFeedProviders, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate(): void {
        if (this.getAssetsInterval) clearInterval(this.getAssetsInterval);
    }

    openModal = (mode: string, data?: IDataFeedProvider) => {
        this.setState({
            isOpenModal: true,
            formAction: mode,
            formDataFeedProviderData: {...data} as IDataFeedProvider || null,
            modalTitle: this.modalTitle(mode)
        })
    }


    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this Data Feed Provider?';
        } else if (mode === 'view') {
            return 'View Data Feed Provider'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Data Feed Provider`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false}, async () => {
            await this.getDataFeedProviders();
        });

    }

    onCallback = async (values: any, step: boolean) => {
        this.closeModal();
        await this.getDataFeedProviders();
    };

    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top">
                        <div className="content__title">Data Feed Providers</div>
                        <button className="border-btn ripple modal-link"
                                disabled={this.state.loading} onClick={() => this.openModal('add')}>Add Data Feed
                            Provider
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
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No Data Feed Provider available yet"/>
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
                       className={this.state.formAction !== 'delete' ? 'big_modal' : ''}
                >

                    <DataFeedProviderForm action={this.state.formAction}
                                          dataFeedProviderData={this.state.formDataFeedProviderData}
                                          dataFeedProviderLinks={this.state.formDataFeedProviderLinks}
                                          onCallback={this.onCallback}
                    />
                </Modal>

            </>
        )
    }
}

export default DataFeedProvidersBlock;
