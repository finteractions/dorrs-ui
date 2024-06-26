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

    membershipForm: IMembership;

    getMembershipFormsInterval: NodeJS.Timer | number | undefined;

    constructor(props: {}, membershipForm: IMembership) {
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
        if (this.getMembershipFormsInterval) clearInterval(this.getMembershipFormsInterval as number);
    }

    getMembershipForm = () => {
        formService.getMembershipForm()
            .then((res: Array<IMembership>) => {
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

                <div className="membership panel">
                    {/*<div className="content__top">*/}
                    {/*    <div className="content__title">Membership</div>*/}
                    {/*</div>*/}

                    {this.state.isLoading ? (
                        <LoaderBlock width={75} height={75}/>
                    ) : (
                        <>
                            <div className="content__bottom">

                                <div className="membership__item">

                                    <div className="membership__item__left">
                                        <span>Membership form</span>
                                    </div>

                                    <div className={'membership__item__right'}>
                                        {this.membershipForm?.status ? (
                                            <div
                                                className={`table__status show table__status-${this.membershipForm.status.toLowerCase()}`}>
                                                {`${this.membershipForm.status.charAt(0).toUpperCase()}${this.membershipForm.status.slice(1).toLowerCase()}`}
                                            </div>
                                        ) : (
                                            <div className={`table__status table__status-`}>Not filled</div>
                                        )}

                                        <button
                                            className=" b-btn ripple"
                                            onClick={() => this.modalHandle()}
                                        >
                                            Open
                                        </button>
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
