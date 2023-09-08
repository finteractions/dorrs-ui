import React from 'react';
import Link from 'next/link'
import LoaderBlock from "@/components/loader-block";
import AssetImage from "@/components/asset-image";
import NoDataBlock from "./no-data-block";
import {ISymbol} from "@/interfaces/i-symbol";
import Modal from "@/components/modal";
import {FormStatus} from "@/enums/form-status";
import SymbolForm from "@/components/symbol-form";
import symbolService from "@/services/symbol/symbol-service";


interface SymbolBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
    symbol: ISymbol | null;
    errors: string[];
}

interface SymbolBlockProps {
    isDashboard: boolean;
}

let isDashboard = false;

const MAX_ITEMS: number = 5;

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

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
            errors: [],
            symbol: null
        }

        isDashboard = this.props?.isDashboard ?? true;
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
                if (res) this.symbols = res;
            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    modalHandle = (symbol?: ISymbol) => {
        this.setState({
            isOpenModal: !this.state.isOpenModal,
            symbol: symbol || null,
            formAction: symbol?.status ? [FormStatus.REJECTED.toString(), FormStatus.SUBMITTED.toString()].includes(symbol?.status) ? 'edit' : 'view' : 'add'
        });
    }

    modalTitle = () => {
        switch (this.state.formAction) {
            case 'add':
                return 'Add'
            case 'edit':
                return 'Edit'
            case 'view':
                return 'View';
        }
    }

    onCallback = async (values: any, step: boolean) => {
        this.modalHandle();
        this.getSymbols();
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
                                        onClick={() => this.modalHandle()}>Add Symbol
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
                                    <div className="row">
                                        {this.symbols.slice(0, !isDashboard ? this.symbols.length : MAX_ITEMS).map((symbol: ISymbol, index: number) => (
                                            <div className="col w-100" key={symbol.code}>
                                                <div className="fiat__item">
                                                    <div className="fiat__item-left">
                                                        <div className="fiat__item-img">
                                                            <AssetImage
                                                                alt={symbol?.code}
                                                                src={symbol?.image || ''}
                                                                width={24} height={24}/>
                                                        </div>
                                                        <span>{symbol.name} ({symbol.ticker})</span>
                                                    </div>
                                                    <div className="fiat__item-right">
                                                        <div className="fiat__item-balance">
                                                            <div
                                                                className={`table__status table__status-${symbol.status.toLowerCase()}`}>
                                                                {`${symbol.status.charAt(0).toUpperCase()}${symbol.status.slice(1).toLowerCase()}`}
                                                            </div>
                                                        </div>
                                                        <div className="assets__item-btns">
                                                            <button
                                                                className="btn-dep assets__item-btn border-btn ripple"
                                                                onClick={() => this.modalHandle(symbol)}
                                                            >
                                                                Open
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <NoDataBlock/>
                                )}

                                <Modal isOpen={this.state.isOpenModal}
                                       onClose={() => this.modalHandle()}
                                       title={`${this.modalTitle()} Symbol`}
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
