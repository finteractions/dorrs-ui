import React from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {IBestBidAndBestOffer} from "@/interfaces/i-best-bid-and-best-offer";
import Modal from "@/components/modal";
import LoaderBlock from "@/components/loader-block";
import formService from "@/services/form/form-service";
import NoDataBlock from "@/components/no-data-block";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
interface ModalMPIDInfoBlockState extends IState {
    mpid: string | null;
    isLoading: boolean;
    isOpenModal: boolean;
    mpidInfo: IMPIDSearch | null;
}

interface ModalMPIDInfoBlockProps extends ICallback {
    onSelected?: (bestBidAndBestOffer: IBestBidAndBestOffer) => void;
    mpid?: string | null;
}

class ModalMPIDInfoBlock extends React.Component<ModalMPIDInfoBlockProps, ModalMPIDInfoBlockState> {
    state: ModalMPIDInfoBlockState;

    constructor(props: ModalMPIDInfoBlockProps) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            mpid: null,
            mpidInfo: null
        };

    }

    componentDidUpdate(prevProps: Readonly<ModalMPIDInfoBlockProps>, prevState: Readonly<ModalMPIDInfoBlockState>, snapshot?: any) {
        if (this.props.mpid && prevProps.mpid !== this.props.mpid) {
            this.openModal();
        }
    }


    openModal = () => {
        this.setState({isOpenModal: true, isLoading: true}, async () => {
            await this.getMPIDInfo()
        })
    }

    getMPIDInfo = async () => {
        await formService.searchMPID(this.props.mpid ?? '')
            .then(async (res: Array<IMPIDSearch>) => {
                const data = res || []
                const info = data[0];
                if (info) {
                    this.setState({mpidInfo: info})
                }
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    closeModal(): void {
        this.setState({isOpenModal: false, mpid: null, mpidInfo: null}, () => {
            this.props.onCallback(null)
        })
    }

    render() {
        return (
            <>
                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={'MPID Info'}
                >
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.mpidInfo ? (
                                <div className={''}>
                                    <div className="view_panel flex-1 mx-0 ">
                                        {this.state.mpidInfo.firm && (
                                            <div className="view_block">
                                                <div className="view_block_title bold">Firm Name</div>
                                                <div className="">{this.state.mpidInfo.firm}</div>
                                            </div>
                                        )}
                                        {this.state.mpidInfo.user && (
                                            <div className="view_block">
                                                <div className="view_block_title bold">Name</div>
                                                <div className="">{this.state.mpidInfo.user}</div>
                                            </div>
                                        )}
                                        {this.state.mpidInfo.email && (
                                            <div className="view_block">
                                                <div className="view_block_title bold">Email</div>
                                                <div className="">{this.state.mpidInfo.email}</div>
                                            </div>
                                        )}
                                        {this.state.mpidInfo.phone && (
                                            <div className="view_block">
                                                <div className="view_block_title bold">Phone</div>
                                                <div className="">
                                                    <PhoneInput
                                                        value={this.state.mpidInfo.phone || ''}
                                                        inputProps={{readOnly: true}}
                                                        disableDropdown
                                                        containerClass={'plain-tel-input'}/>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                            ) : (
                                <NoDataBlock primaryText={' '} secondaryText={'No data available'}/>
                            )}
                        </>
                    )}
                </Modal>
            </>
        )

    }
}

export default ModalMPIDInfoBlock;
