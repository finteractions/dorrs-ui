import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Table from "@/components/table/table";
import AlertBlock from "@/components/alert-block";
import {createColumnHelper} from "@tanstack/react-table";
import ordersService from "@/services/orders/orders-service";
import {IUserAsset} from "@/interfaces/i-user-asset";
import NoDataBlock from "@/components/no-data-block";

interface WalletsBlockState extends IState {
    isLoading: boolean
}

let userAsset: IUserAsset | null;

const columnHelper = createColumnHelper<any>();

let columns: any[] = [];
let rowProps: ITableRowProps;

class WalletsBlock extends React.Component<{ userAsset?: IUserAsset | null, onLoading?: (isLoading: boolean) => void, onCallback?: (withdrawAddress: IWithdrawAddress) => void }> {

    state: WalletsBlockState;
    withdrawAddresses: Array<IWithdrawAddress>;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: false
        }

        userAsset = this.props.userAsset ?? null;

        columns = [
            columnHelper.accessor((row) => row.address, {
                id: "wallet_address",
                cell: (item) => item.getValue(),
                header: () => <span></span>,

            }),
            columnHelper.accessor((row) => row.asset, {
                id: "asset",
                cell: (item) => item.getValue(),
                header: () => <span></span>,
            }),
            columnHelper.accessor((row) => row.name, {
                id: "name",
                cell: (item) => item.getValue(),
                header: () => <span></span>,
            }),
        ];

        rowProps = {
            className: 'cursor-pointer icon-chevron-right',
            onCallback: (withdrawAddress: IWithdrawAddress) => this.onCallback(withdrawAddress)
        }

        this.withdrawAddresses = new Array<IWithdrawAddress>();
    }

    componentDidMount() {
        this.getWithdrawAddress();
    }

    getWithdrawAddress() {
        this.setState({isLoading: true});
        this.props.onLoading?.(true)
        ordersService.getWithdrawAddresses()
            .then((res: Array<IWithdrawAddress>) => {
                this.withdrawAddresses = userAsset ? res.filter(s => s.asset === userAsset?.asset?.label).reverse() : res.reverse();
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            }).finally(() => {
            this.setState({isLoading: false});
            this.props.onLoading?.(false)
        });
    }

    onCallback(withdrawAddress: IWithdrawAddress) {
        this.props.onCallback?.(withdrawAddress);
    }

    render() {
        return (
            <>
                <div className="modal-withdraw">
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.withdrawAddresses.length ? (

                                <div className="modal-withdraw-wrapper ">
                                    <Table pageLength={5}
                                           columns={columns}
                                           data={this.withdrawAddresses}
                                           rowProps={rowProps}
                                    />
                                </div>

                            ) : (
                                <>
                                    <NoDataBlock primaryText={' '}
                                                 secondaryText={'No wallets for selected virtual symbol'}/>
                                </>
                            )}
                            {this.state.errorMessages && (
                                <AlertBlock type={"error"}
                                            messages={this.state.errorMessages}/>
                            )}
                        </>
                    )}
                </div>
            </>
        )
    }
}

export default WalletsBlock;
