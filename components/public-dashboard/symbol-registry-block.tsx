import React from 'react';
import publicDashboardService from "@/services/public-dashboard/public-dashboard-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import {Subscription} from "rxjs";

interface SymbolRegistryBlockState extends IState {
    isLoading: boolean;
    errors: string[];
    data: IDashboardSymbolRegistry | null;
}

class SymbolRegistryBlock extends React.Component<{}, SymbolRegistryBlockState> {

    state: SymbolRegistryBlockState;
    private subscription: Subscription | null = null;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            errors: [],
            data: null
        }
    }

    componentDidMount() {
        this.setState({isLoading: true}, () => {
            this.getSymbolRegistry();
            this.subscriptions();
        });
    }

    componentWillUnmount() {
        this.subscription?.unsubscribe();
    }

    subscriptions(): void {
        this.subscription = websocketService.on<Array<IDashboardSymbolRegistry>>(WebsocketEvent.DASHBOARD_SYMBOL_REGISTRY).subscribe((data: Array<IDashboardSymbolRegistry>) => {
            this.handleData(data);
        });
    }

    getSymbolRegistry = () => {
        publicDashboardService.getSymbolRegistry()
            .then((res: Array<IDashboardSymbolRegistry>) => {
                const data = res || [];
                this.handleData(data);

            })
            .catch((errors: IError) => {

            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    handleData = (data: Array<IDashboardSymbolRegistry>) => {
        this.setState({data: data[0] ?? null})
    }


    render() {
        return (
            <>
                <div className={'indicator__item statistics'}>
                    <div className="content__top pb-0">
                        <div className="content__title">Symbol Registry</div>
                    </div>

                    <div>
                        <div>

                        </div>
                    </div>
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <div className={'indicator__item__data'}>
                            <div>
                                <div>Total Symbols:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_symbols) || 0, 0)}</div>
                            </div>
                            <div>
                                <div>Total Companies:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.total_companies) || 0, 0)}</div>
                            </div>
                            <div>
                                <div>Unique Industries:</div>
                                <div
                                    className={'padding-left-60'}>{formatterService.numberFormat(Number(this.state.data?.unique_industries) || 0, 0)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

}

export default SymbolRegistryBlock;
