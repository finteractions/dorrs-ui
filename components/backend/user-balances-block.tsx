import React from 'react';
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import NoDataBlock from "@/components/no-data-block";
import adminService from "@/services/admin/admin-service";
import {createColumnHelper} from "@tanstack/react-table";
import Table from "@/components/table/table";
import {IBalance} from "@/interfaces/i-balance";
import formatterService from "@/services/formatter/formatter-service";
import Link from "next/link";

const columnHelper = createColumnHelper<any>();
let columns: any[] = [];

interface UserBalancesBlockState {
    loading: boolean;
    data: IBalance[];
    errors: string[];

}

interface UserBalancesBlockProps {
    user_id: string
}

class UserBalancesBlock extends React.Component<UserBalancesBlockProps> {
    state: UserBalancesBlockState;

    constructor(props: UserBalancesBlockProps) {
        super(props);

        this.state = {
            loading: true,
            data: [],
            errors: [],
        }

        columns = [
            columnHelper.accessor((row) => row.asset, {
                id: "asset",
                cell: (item) => item.getValue(),
                header: () => <span>Asset</span>,
            }),
            columnHelper.accessor((row) => row.balance, {
                id: "balance",
                cell: (item) => formatterService.numberFormat(item.getValue()),
                header: () => <span>Balance</span>,
            }),
            columnHelper.accessor((row) => row.wallet_address, {
                id: "wallet_address",
                cell: (item) => item.getValue(),
                header: () => <span>Wallet</span>,
            }),
        ];
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getUserBalances();
    }

    getUserBalances = () => {

        adminService.getUserBalances(this.props.user_id)
            .then((res: IBalance[]) => {
                const data = res.sort((a, b) => b.id - a.id).slice(0,10);
                this.setState({data: data});
            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    render() {
        return (

            <>
                <div className="info-panel-section balances">
                   <div className="info-panel-section-title mb-2">
                       <div className='info-panel-title-text'>Balances <span className='info-panel-section-sub-title'>(last 10 record)</span></div>

                       <Link className='link info-panel-title-link' href="/backend/balances-screen">
                           All balances
                       </Link>
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
                                            data={this.state.data}
                                            filter={false}
                                        />
                                    ) : (
                                        <>
                                            {this.state.errors.length ? (
                                                <AlertBlock type="error" messages={this.state.errors}/>
                                            ) : (
                                                <NoDataBlock primaryText="No Balances available yet"/>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </>
        )
    }
}

export default UserBalancesBlock;
