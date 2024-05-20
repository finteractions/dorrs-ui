import React from 'react';
import LoaderBlock from "@/components/loader-block";
import Modal from "@/components/modal";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";
import UserPortalForm from "@/components/user-portal-form";

interface UserBlockState extends IState, IModalState {
    isLoading: boolean;
    customerType: CustomerType | null
    formAction: string;
}

class UserBlock extends React.Component {

    static contextType = DataContext;
    declare context: React.ContextType<typeof DataContext>;

    state: UserBlockState;

    constructor(props: {}, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isLoading: true,
            isOpenModal: false,
            formAction: 'add',
            customerType: this.context.userProfile.customer_type,
        }
    }

    componentDidMount() {
        this.setState({isLoading: false});
    }

    modalHandle() {
        this.setState({isOpenModal: !this.state.isOpenModal});
    }

    onCallback = async (values: any, step: boolean) => {
        this.modalHandle();
        this.context
        this.context.getUserProfile()
            .then(() => {
                this.setState({customerType: this.context.userProfile.customer_type})
            })
    };

    render() {
        return (
            <>

                <div className="membership panel">
                    {this.state.isLoading ? (
                        <LoaderBlock width={75} height={75}/>
                    ) : (
                        <>
                            <div className="content__bottom">

                                <div className="membership__item">

                                    <div className="membership__item__left">
                                        <span>User Portal Form</span>
                                    </div>

                                    <div className={'membership__item__right'}>
                                        {this.state.customerType ? (
                                            <div
                                                className={`table__status show`}>
                                                Customer: {getCustomerTypeName(this.state.customerType)}
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
                       title={`User Portal Form`}
                >
                    <UserPortalForm
                        customer_type={this.state.customerType}
                        onCallback={this.onCallback}/>
                </Modal>
            </>
        );
    }

}

export default UserBlock;
