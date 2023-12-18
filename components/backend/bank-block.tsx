import React from 'react';
import LoaderBlock from "@/components/loader-block";
import adminService from "@/services/admin/admin-service";
import {IBank} from "@/interfaces/i-bank";
import Modal from "@/components/modal";
import BankForm from "@/components/backend/bank-form";
import {IBankTemplate} from "@/interfaces/i-bank-template";


interface BankBlockState {
    loading: boolean;
    isOpenModal: boolean;
    formData: IBankTemplate | null;
    formAction: string;
    errors: string[];
    modalTitle: string;
}

class BankBlock extends React.Component<{}> {
    state: BankBlockState;
    columnDefinition: any;
    columnValues: any;

    constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
            isOpenModal: false,
            formData: null,
            formAction: 'add',
            errors: [],
            modalTitle: '',
        }
    }

    componentDidMount() {
        this.setState({loading: true});
        this.getBank();
    }

    getBank = () => {
        adminService.getBank()
            .then((res: IBank[]) => {
                const bank = res[0];
                const columns = bank.columns;
                let values = bank.values;

                const columnsObject = JSON.parse(columns)
                values = values.replace(/'/g, '"');
                const valuesObject = JSON.parse(values)

                this.columnDefinition = columnsObject;
                this.columnValues = valuesObject;

                this.setState({
                    formData: {
                        columnDefinition: columnsObject,
                        columnValues: valuesObject
                    }
                })

            })
            .catch((errors: IError) => {
                this.setState({errors: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    openModal = (mode: string,) => {
        this.setState({isOpenModal: true, formAction: mode, modalTitle: this.modalTitle(mode)})
    }

    modalTitle = (mode: string) => {
        if (mode === 'delete') {
            return 'Do you want to remove Bank?';
        } else if (mode === 'view') {
            return 'View Bank'
        } else {
            return `${mode === 'edit' ? 'Edit' : 'Add'} Bank Information`;
        }
    }


    closeModal(): void {
        this.setState({isOpenModal: false});
    }

    submitForm(): void {
        this.setState({isOpenModal: false});
        this.getBank();
    }

    onCallback = async (values: any, step: boolean) => {
        this.getBank();
        this.closeModal();
    };


    render() {
        return (

            <>
                <div className="assets section page__section">
                    <div className="content__top justify-content-end">
                        <button className="border-btn ripple modal-link"
                                onClick={() => this.openModal('edit')}>Edit
                        </button>
                    </div>

                    {this.state.loading ? (
                        <LoaderBlock/>
                    ) : (
                        <>
                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (

                                <>
                                    <div className={'form-panel w-100 mb-24'}>
                                        <div
                                            className={'view-form user-view-form'}>
                                            {Object.keys(this.columnDefinition).map((columnName) => (
                                                <React.Fragment key={columnName}>
                                                    {typeof this.columnValues[columnName] === "object" ? (
                                                        <>
                                                            <h5 className={'w-100 my-0'}>{this.columnDefinition[columnName].title}</h5>

                                                            {Object.keys(this.columnDefinition[columnName].properties).map((nestedPropertyName) => (


                                                                <div key={nestedPropertyName}
                                                                     className={'view-form-box'}>
                                                                    <div
                                                                        className={'box__title'}>{this.columnDefinition[columnName].properties[nestedPropertyName]}</div>
                                                                    <div
                                                                        className={'box__wrap'}>{this.columnValues[columnName][nestedPropertyName] || '-'}</div>
                                                                </div>

                                                            ))}</>

                                                    ) : (

                                                        <div className={'view-form-box'}>
                                                            <div
                                                                className={'box__title'}>{this.columnDefinition[columnName].title}</div>
                                                            <div
                                                                className={'box__wrap'}>{this.columnValues[columnName] || '-'}</div>
                                                        </div>
                                                    )}
                                                </React.Fragment>

                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>


                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.closeModal()}
                       title={this.modalTitle(this.state.formAction)}
                       className={''}
                >

                    <BankForm
                        action={this.state.formAction}
                        data={this.state.formData}
                        onCallback={this.onCallback}
                    />
                </Modal>
            </>
        )
    }
}

export default BankBlock;
