import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import Modal from "@/components/modal";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import lastSaleService from "@/services/last-sale/last-sale-service";
import {ILastSale} from "@/interfaces/i-last-sale";
import formatterService from "@/services/formatter/formatter-service";
import LastSaleReportForm from "@/components/last-sale-reporting-form";
import {Condition} from "@/enums/condition";


interface LastSaleReportingState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    formData: ILastSale | null;
    modalTitle: string;
    errors: string[];
}

interface LastSaleReportingProps {
    access: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}


const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];



class LastSaleReporting extends React.Component<LastSaleReportingProps, LastSaleReportingState> {

    state: LastSaleReportingState;
    data: Array<ILastSale> = new Array<ILastSale>();
    errors: Array<string> = new Array<string>();
    getLastSaleReportingInterval!: NodeJS.Timer;

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    constructor(props: LastSaleReportingProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            modalTitle: '',
            errors: [],
            formData: null,
        }

        columns = [
            columnHelper.accessor((row) => row.origin, {
                id: "origin",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Origin</span>,
            }),
            columnHelper.accessor((row) => row.symbol_name, {
                id: "symbol_name",
                cell: (item) => item.getValue(),
                header: () => <span>Symbol</span>,
            }),
            columnHelper.accessor((row) => row.condition, {
                id: "condition",
                cell: (item) => Condition[item.getValue()] || '',
                header: () => <span>Condition</span>,
            }),
            columnHelper.accessor((row) => row.quantity, {
                id: "quantity",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Quantity</span>,
            }),
            columnHelper.accessor((row) => row.price, {
                id: "price",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Price</span>,
            }),
            columnHelper.accessor((row) => row.time, {
                id: "time",
                cell: (item) => item.getValue(),
                header: () => <span>Time</span>,
            }),
            columnHelper.accessor((row) => row.date, {
                id: "date",
                cell: (item) => item.getValue(),
                header: () => <span>Date</span>,
            }),
            columnHelper.accessor((row) => row.tick_indication, {
                id: "tick_indication",
                cell: (item) => item.getValue(),
                header: () => <span>Tick Indication</span>,
            }),
            columnHelper.accessor((row) => row.uti, {
                id: "uti",
                cell: (item) => <span className="blue-text">{item.getValue()}</span>,
                header: () => <span>Universal Transaction ID (UTI)</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getLastSaleReporting();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getLastSaleReportingInterval = setInterval(this.getLastSaleReporting, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getLastSaleReportingInterval) clearInterval(this.getLastSaleReportingInterval);
    }

    getLastSaleReporting = () => {
        lastSaleService.getLastSaleReporting()
            .then((res: Array<ILastSale>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                this.data = data;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: ILastSale) => {
        this.setState({isOpenModal: true, formData: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }


    modalTitle = (mode: string) => {
        if (mode === 'view') {
            return 'View Sale Report'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Sale Report`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.getLastSaleReporting();
        this.closeModal();
    };

    render() {
        return (

            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Last Sale Reporting</div>
                        <div className="content__title_btns">
                            {this.props.access.create && (
                                <button className="b-btn ripple"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('add')}>Add Sale Report
                                </button>
                            )}
                        </div>

                    </div>


                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="content__bottom">
                                {this.data.length > 0 ? (
                                    <Table columns={columns}
                                           data={this.data}
                                           searchPanel={true}
                                           block={this}
                                           editBtn={true}
                                           viewBtn={true}
                                           access={this.props.access}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}
                            </div>

                            <Modal isOpen={this.state.isOpenModal}
                                   onClose={() => this.closeModal()}
                                   title={this.state.modalTitle}
                            >
                                <LastSaleReportForm
                                    action={this.state.formAction}
                                    data={this.state.formData}
                                    onCallback={this.onCallback}
                                />
                            </Modal>



                        </>
                    )}
                </div>
            </>

        )
    }
}

export default portalAccessWrapper(LastSaleReporting, 'LastSaleReporting');
