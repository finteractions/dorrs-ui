import React from 'react';
import Link from 'next/link'
import formatterService from "@/services/formatter/formatter-service";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import LoaderBlock from "@/components/loader-block";
import {IUserAsset} from "@/interfaces/i-user-asset";
import AssetImage from "@/components/asset-image";
import AlertBlock from "./alert-block";
import NoDataBlock from "./no-data-block";
import AssetWithdrawForm from "@/components/asset-withdraw-form";

interface FiatBlockState {
    userAsset: IUserAsset | null;
    isLoading: boolean;
    isWithdraw: boolean;
}

let isDashboard = false;

const MAX_ITEMS: number = 2;

class FiatBlock extends React.Component<{ isDashboard?: boolean, navigateToFiat?: (userAsset: IUserAsset | null) => void }> {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;
    state: FiatBlockState;
    assets: Array<IUserAsset> = new Array<IUserAsset>();
    errors: Array<string> = new Array<string>();

    constructor(props: {}, context: IDataContext<IUserAsset>) {
        super(props);
        this.context = context;

        this.state = {
            userAsset: null,
            isLoading: true,
            isWithdraw: false
        }
        isDashboard = this.props?.isDashboard ?? true;
    }

    handleWithdraw(userAsset: IUserAsset | null) {
        isDashboard ? this.props.navigateToFiat?.(userAsset) : this.setState({
            isWithdraw: !this.state.isWithdraw,
            userAsset: userAsset
        });
    }

    componentDidMount() {
        const userAsset = this.context.getSharedData();
        userAsset ? this.handleWithdraw(userAsset) : null;

        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const userAssets = this.context?.userAssets;
        const errors = this.context?.errors.get('userAssets');

        if (userAssets) {
            this.assets = userAssets.fiat || [];
            this.errors = [];
        }

        if (errors?.length) {
            this.assets = [];
            this.errors = errors;
        }

        if ((userAssets && !errors) || (!userAssets && errors)) {
            this.state.isLoading ? this.setState({isLoading: false}) : null;
        }
    }

    render() {
        return (
            <>
                {!this.state.isWithdraw ? (
                    <div className="fiat section">
                        <div className="content__top">
                            <div className="content__title">My Fiat</div>
                            {isDashboard && (
                                <Link href="/fiats" className="b-link">View all</Link>
                            )}
                        </div>

                        {this.state.isLoading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                {this.assets.length ? (
                                    <div className="row">
                                        {this.assets.slice(0, !isDashboard ? this.assets.length : MAX_ITEMS).map((userAsset: IUserAsset, index: number) => (
                                            <div className="col" key={userAsset.asset.label}>
                                                <div className="fiat__item">
                                                    <div className="fiat__item-left">
                                                        <div className="fiat__item-img">
                                                            {userAsset.asset.image && (
                                                                <AssetImage
                                                                    alt={userAsset.asset.label}
                                                                    src={userAsset.asset.image}
                                                                    width={24} height={24}/>
                                                            )}
                                                        </div>
                                                        <span>{userAsset.asset.name}</span>
                                                    </div>
                                                    <div className="fiat__item-right">
                                                        <div className="fiat__item-balance">
                                                            {userAsset.asset.label} {formatterService.numberFormat(userAsset.balance)}
                                                        </div>
                                                        <div className="assets__item-btns">
                                                            <button
                                                                className="btn-dep assets__item-btn border-btn ripple"
                                                                onClick={() => this.handleWithdraw(userAsset)}
                                                            >
                                                                Withdraw
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {this.errors.length ? (
                                            <AlertBlock type="error" messages={this.errors}/>
                                        ) : (
                                            <NoDataBlock/>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <AssetWithdrawForm data={this.state.userAsset} onCallback={() => this.handleWithdraw(null)}/>
                )}
            </>
        );
    }

}

export default FiatBlock;
