import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Modal from "@/components/modal";
import MembershipForm from "@/components/membership-form";
import formService from "@/services/form/form-service";
import {FormStatus} from "@/enums/form-status";

interface MembershipBlockState extends IState, IModalState {
    isLoading: boolean;
    formAction: string;
}

const fetchIntervalSec = process.env.FETCH_INTERVAL_SEC || '30';

class MembershipBlock extends React.Component {

    state: MembershipBlockState;

    membershipForm: IMembershipForm;

    getMembershipFormsInterval!: NodeJS.Timer;

    constructor(props: {}, membershipForm: IMembershipForm) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add'
        }

        this.membershipForm = membershipForm;

    }

    componentDidMount() {
        this.setState({loading: true});
        this.getMembershipForm();
        this.startAutoUpdate();
    }

    componentWillUnmount() {
        this.stopAutoUpdate();
    }

    startAutoUpdate = () => {
        this.getMembershipFormsInterval = setInterval(this.getMembershipForm, Number(fetchIntervalSec) * 1000);
    }

    stopAutoUpdate = () => {
        if (this.getMembershipFormsInterval) clearInterval(this.getMembershipFormsInterval);
    }

    getMembershipForm = () => {
        formService.getMembershipForm()
            .then((res: Array<IMembershipForm>) => {
                if (res.length > 0) {
                    this.membershipForm = res[0];
                    const formAction = [FormStatus.REJECTED.toString(), FormStatus.SUBMITTED.toString()].includes(this.membershipForm.status) ? 'edit' : 'view';
                    this.setState({formAction: formAction});
                }

            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    }

    modalHandle() {
        this.setState({isOpenModal: !this.state.isOpenModal});
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
        this.getMembershipForm();
    };

    render() {
        return (
            <>

                <div className="fiat section">
                    <div className="content__top">
                        <div className="content__title">Forms</div>
                    </div>

                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            <div className="row">
                                <div className="col w-100">
                                    <div className="fiat__item">
                                        <div className="fiat__item-left">
                                            <span>Membership Form</span>
                                        </div>
                                        <div className="fiat__item-right">
                                            <div className="fiat__item-balance">
                                                {this.membershipForm?.status ? (
                                                    <div
                                                        className={`table__status table__status-${this.membershipForm.status.toLowerCase()}`}>
                                                        {`${this.membershipForm.status.charAt(0).toUpperCase()}${this.membershipForm.status.slice(1).toLowerCase()}`}
                                                    </div>
                                                ) : (
                                                    <>Not filled</>
                                                )}
                                            </div>
                                            <div className="assets__item-btns">
                                                <button
                                                    className="btn-dep assets__item-btn border-btn ripple"
                                                    onClick={() => this.modalHandle()}
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.modalHandle()}
                       title={`${this.modalTitle()} Membership Form`}
                >
                    <MembershipForm
                        data={this.membershipForm}
                        onCallback={this.onCallback}
                        action={this.state.formAction}
                        onCancel={() => this.modalHandle()}
                        isAdmin={false}
                    />
                </Modal>
            </>
        );
    }

}

export default MembershipBlock;
