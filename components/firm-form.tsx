import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {IFirm} from "@/interfaces/i-firm";
import adminService from "@/services/admin/admin-service";


const formSchema = Yup.object().shape({
    name: Yup.string().min(3).required('Required').label('Name'),
});

interface FirmFormState extends IState {
    formInitialValues: {},
    loading: boolean;
    isDeleting: boolean;
}

interface FirmFormProps extends ICallback {
    action: string;
    data: IFirm | null;
    onCancel?: () => void;
}

class FirmForm extends React.Component<FirmFormProps, FirmFormState> {

    state: FirmFormState;

    constructor(props: FirmFormProps) {
        super(props);
        console.log(this.props.data)
        const initialData = this.props.data || {} as IFirm;

        const initialValues: {
            name: string;
        } = {
            name: initialData?.name || this.props.data?.name || '',
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isDeleting: false,
        };

    }

    handleSubmit = async (values: IFirm, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const request: Promise<any> = this.props.action == 'edit' ?
            adminService.updateFirm(this.props.data?.id || 0, values) :
            adminService.createFirm(values);

        await request
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deleteFirm(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    }

    isShow(): boolean {
        return this.props.action === 'view';
    }

    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
            case 'view':
                return (
                    <>

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <Formik<IFirm>
                                    initialValues={this.state.formInitialValues as IFirm}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="firm-form">
                                                <div className="input">
                                                    <div className="input__title">Name <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="name"
                                                            id="name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="company_name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                {this.props.action !== 'view' && (
                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save Firm
                                                    </button>
                                                )}

                                                {this.state.errorMessages && (
                                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                )}
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </>
                        )
                        }


                    </>
                )
            case 'delete':
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.data)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }

    }
}

export default FirmForm;
