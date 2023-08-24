import React from 'react';
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Modal from "@/components/modal";
import formatterService from "@/services/formatter/formatter-service";
import AssetWithdrawForm from "@/components/asset-withdraw-form";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import LoaderBlock from "@/components/loader-block";
import {IUserAsset} from "@/interfaces/i-user-asset";
import AssetImage from "@/components/asset-image";
import AlertBlock from "./alert-block";
import NoDataBlock from "./no-data-block";


interface AssetsBlockState {
    userAsset: IUserAsset | null;
    isOpenModalQR: boolean;
    isOpenModalDeposit: boolean;
    isWithdraw: boolean;
    isLoading: boolean;
}

let isDashboard = false;

const MAX_ITEMS: number = 2;

const CopyClipboard = dynamic(() => import("../components/copy-clipboard"), {ssr: false})

const QrCode = dynamic(() => import('../components/qr-code'), {ssr: false})

class AssetsBlock extends React.Component<{ isDashboard?: boolean, navigateToCrypto?: (userAsset: IUserAsset | null) => void }> {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>
    state: AssetsBlockState;
    assets: Array<IUserAsset> = new Array<IUserAsset>();
    errors: Array<string> = new Array<string>();

    constructor(props: {}, context: IDataContext<IUserAsset>) {
        super(props);
        this.context = context;

        this.state = {
            isOpenModalQR: false,
            isOpenModalDeposit: false,
            isWithdraw: false,
            userAsset: null,
            isLoading: true
        }

        isDashboard = this.props?.isDashboard ?? true;

        this.handleModalQR = this.handleModalQR.bind(this);
        this.handleModalDeposit = this.handleModalDeposit.bind(this);
    }

    handleModalQR(userAsset: IUserAsset | null) {
        this.setState({isOpenModalQR: !this.state.isOpenModalQR, userAsset: userAsset});
    }

    handleModalDeposit(userAsset: IUserAsset | null) {
        this.setState({isOpenModalDeposit: !this.state.isOpenModalDeposit, userAsset: userAsset});
    }

    handleWithdraw(userAsset: IUserAsset | null) {
        isDashboard ? this.props.navigateToCrypto?.(userAsset) : this.setState({
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
            this.assets = userAssets.crypto || [];
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
                    <>
                        <div className="assets section">
                            <div className="content__top">
                                <div className="content__title">My Assets</div>
                                {isDashboard && (
                                    <Link href="/assets" className="b-link">View all</Link>
                                )}
                            </div>

                            {this.state.isLoading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.assets.length ? (
                                        <div className="row">
                                            {this.assets.slice(0, !isDashboard ? this.assets.length : MAX_ITEMS).map((userAsset: IUserAsset, index: number) => (
                                                <div className="col col-md-12" key={userAsset.asset.label}>
                                                    <div className="assets__item">
                                                        <div className="assets__item-wrap">
                                                            <div className="assets__item-top">
                                                                <div className="assets__item-left">
                                                                    <div className="assets__item-img">
                                                                        {userAsset.asset.image && (
                                                                            <AssetImage
                                                                                alt={userAsset.asset.label}
                                                                                src={userAsset.asset.image}
                                                                                width={24} height={24}/>
                                                                        )}
                                                                    </div>
                                                                    <div className="assets__item-text">
                                                                        <b>{userAsset.asset.name}</b>
                                                                        <span>{userAsset.asset.label}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="assets__item-qr modal-link"
                                                                     onClick={() => this.handleModalQR(userAsset)}>
                                                                    <Image src="/img/qr-ico.svg"
                                                                           width={20} height={20}
                                                                           alt="QR Code"/>
                                                                </div>
                                                            </div>
                                                            <div className="assets__item-row">
                                                                <div className="assets__item-block">
                                                                    <span>Network</span>
                                                                    <strong>{userAsset.asset.network}</strong>
                                                                </div>
                                                                {/*<div className="assets__item-block">*/}
                                                                {/*    /!*<span>Protocol</span>*!/*/}
                                                                {/*    /!*<strong>{userAsset.asset.protocol}</strong>*!/*/}
                                                                {/*</div>*/}
                                                                <div className="assets__item-block big">
                                                                    <span>Wallet Address</span>
                                                                    <strong>
                                                                        <div className={'wallet_overflow'} title={userAsset.wallet_address}>{userAsset.wallet_address}</div>
                                                                        <CopyClipboard text={userAsset.wallet_address}/>
                                                                    </strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="assets__item-bottom">
                                                            <div className="assets__item-price">
                                                                {formatterService.numberFormat(userAsset.balance)} {userAsset.asset.label}
                                                            </div>
                                                            <div className="assets__item-btns">
                                                                <button
                                                                    className="btn-dep assets__item-btn border-btn ripple"
                                                                    onClick={() => this.handleModalDeposit(userAsset)}
                                                                >
                                                                    Deposit
                                                                </button>
                                                                <button
                                                                    className="btn-withdraw assets__item-btn border-btn ripple"
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

                        <Modal isOpen={this.state.isOpenModalQR} onClose={() => this.handleModalQR(null)}
                               title={`Your ${this.state.userAsset?.asset?.label} wallet`}>
                            <div className="modal-qr">
                                <QrCode data={this.state.userAsset?.wallet_address || ''} image="/img/heart-ico.svg"/>
                            </div>
                            <div className="modal-terms">
                                <ul>
                                    <li>Send only {this.state.userAsset?.asset?.network} to this deposit address.</li>
                                    <li>Ensure the network is {this.state.userAsset?.asset?.network}.</li>
                                    <li>Please note that deposits via smart contracts are not supported, with the
                                        exception of
                                        ETH via the ERC20 network or BNB via the BSC network.
                                    </li>
                                    <li>Do not send NFTs to this address.</li>
                                </ul>
                            </div>
                            <div className="assets__item-row">
                                <div className="assets__item-block big">
                                    <span>Network</span>
                                    <strong>{this.state.userAsset?.asset?.network}</strong>
                                </div>
                                <div className="assets__item-block big">
                                    <span>Wallet Address</span>
                                    <strong>
                                        <div className={'wallet_overflow'} title={this.state.userAsset?.wallet_address}>{this.state.userAsset?.wallet_address}</div>
                                        <CopyClipboard text={this.state.userAsset?.wallet_address || ''}/>
                                    </strong>
                                </div>
                            </div>
                        </Modal>

                        <Modal isOpen={this.state.isOpenModalDeposit} onClose={() => this.handleModalDeposit(null)}
                               title={`How to deposit ${this.state.userAsset?.asset.label}`}>
                            <div className="modal-terms">
                                <span
                                    className="list-head">Follow this steps to deposit {this.state.userAsset?.asset?.label} to your wallet:</span>
                                <ul>
                                    <li>Send only {this.state.userAsset?.asset?.label} to this deposit address.</li>
                                    <li>Ensure the network is {this.state.userAsset?.asset.label}.</li>
                                    <li>Do not send NFTs to this address.</li>
                                </ul>
                            </div>
                            <div className="assets__item-row">
                                <div className="assets__item-block big">
                                    <span>Network</span>
                                    <strong>{this.state.userAsset?.asset?.network}</strong>
                                </div>
                                <div className="assets__item-block big">
                                    <span>Wallet Address</span>
                                    <strong>
                                        <div className={'wallet_overflow'} title={this.state.userAsset?.wallet_address}>{this.state.userAsset?.wallet_address}</div>
                                        <CopyClipboard text={this.state.userAsset?.wallet_address || ''}/>
                                    </strong>
                                </div>
                            </div>
                        </Modal>
                    </>
                ) : (
                    <AssetWithdrawForm data={this.state.userAsset} onCallback={() => this.handleWithdraw(null)}/>
                )}
            </>
        )
    }
}

export default AssetsBlock;
