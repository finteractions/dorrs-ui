import React from 'react';
import LoaderBlock from "@/components/loader-block";
import NoDataBlock from "./no-data-block";
import {ISymbol} from "@/interfaces/i-symbol";
import Modal from "@/components/modal";
import SymbolForm from "@/components/symbol-form";
import symbolService from "@/services/symbol/symbol-service";
import Table from "@/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import Link from "next/link";


interface SymbolBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    symbol: ISymbol | null;
    modalTitle: string;
    errors: string[];
}

interface SymbolBlockProps {
    isDashboard: boolean;
}

let isDashboard = false;

const MAX_ITEMS: number = 5;

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

class SymbolBlock extends React.Component<SymbolBlockProps, SymbolBlockState> {

    state: SymbolBlockState;
    symbols: Array<ISymbol> = new Array<ISymbol>();
    errors: Array<string> = new Array<string>();
    getSymbolsInterval!: NodeJS.Timer;

    constructor(props: SymbolBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            modalTitle: '',
            errors: [],
            symbol: null
        }

        isDashboard = this.props?.isDashboard ?? true;

        columns = [
            columnHelper.accessor((row) => row.figi, {
                id: "figi",
                cell: (item) => item.getValue(),
                header: () => <span>FIGI</span>,
            }),
            columnHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span>Name</span>,
            }),
            columnHelper.accessor((row) => row.ticker, {
                id: "ticker",
                cell: (item) => item.getValue(),
                header: () => <span>Ticker</span>,
            }),
            columnHelper.accessor((row) => row.exchange_code, {
                id: "exchange_code",
                cell: (item) => item.getValue(),
                header: () => <span>Exchange Code</span>,
            }),
            columnHelper.accessor((row) => row.security_type, {
                id: "security_type",
                cell: (item) => item.getValue(),
                header: () => <span>Security Type</span>,
            }),
            columnHelper.accessor((row) => row.market_sector, {
                id: "market_sector",
                cell: (item) => item.getValue(),
                header: () => <span>Market Sector</span>,
            }),
            columnHelper.accessor((row) => row.figi_composite, {
                id: "figi_composite",
                cell: (item) => item.getValue(),
                header: () => <span>FIGI Composite</span>,
            }),
            columnHelper.accessor((row) => row.share_class, {
                id: "share_class",
                cell: (item) => item.getValue(),
                header: () => <span>Share Class</span>,
            }),
            columnHelper.accessor((row) => row.status, {
                id: "status",
                cell: (item) =>
                    <div className={`table__status table__status-${item.getValue().toLowerCase()}`}>
                        {item.getValue()}
                    </div>
                ,
                header: () => <span>Status</span>,
            })
        ];
    }

    componentDidMount() {
        this.setState({isLoading: true});
        this.getSymbols();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getSymbolsInterval = setInterval(this.getSymbols, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getSymbolsInterval) clearInterval(this.getSymbolsInterval);
    }

    getSymbols = () => {
        symbolService.getSymbols()
            .then((res: Array<ISymbol>) => {
                const data = res?.sort((a, b) => {
                    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
                }) || [];

                data.forEach(s => {
                    s.status = `${s.status.charAt(0).toUpperCase()}${s.status.slice(1).toLowerCase()}`;
                });

                this.symbols = data;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    openModal = (mode: string, data?: ISymbol) => {
        this.setState({isOpenModal: true, symbol: data || null, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    closeModal(): void {
        this.setState({isOpenModal: false})
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove this symbol?';
        } else if (mode === 'view') {
            return 'View Symbol'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Symbol`;
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.getSymbols();
        this.closeModal();
    };

    render() {
        return (
            <>

                <>
                    <div className="assets section">
                        <div className="content__top">
                            <div className="content__title">Symbols</div>
                            <div className="assets__item-row">
                                <button className="border-btn ripple modal-link"
                                        disabled={this.state.isLoading}
                                        onClick={() => this.openModal('add')}>Add Symbol
                                </button>
                                {isDashboard && (
                                    <Link href="/symbols" className="b-link">View all</Link>
                                )}
                            </div>

                        </div>

                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                {this.symbols.length > 0 ? (
                                    <Table columns={columns}
                                           data={this.symbols}
                                           // searchPanel={true}
                                           block={this}
                                           // editBtn={true}
                                           // viewBtn={true}
                                    />
                                ) : (
                                    <NoDataBlock/>
                                )}

                                <Modal isOpen={this.state.isOpenModal}
                                       onClose={() => this.closeModal()}
                                       title={this.state.modalTitle}
                                >
                                    <SymbolForm
                                        isAdmin={false}
                                        action={this.state.formAction}
                                        data={this.state.symbol}
                                        onCallback={this.onCallback}
                                    />
                                </Modal>
                            </>
                        )}
                    </div>
                </>
            </>
        )
    }
}

export default SymbolBlock;
