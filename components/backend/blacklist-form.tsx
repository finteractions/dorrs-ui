import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import adminService from "@/services/admin/admin-service";
import AlertBlock from "@/components/alert-block";
import {IBlacklist} from "@/interfaces/i-blacklist";
import {comment} from "postcss";

const formSchema = Yup.object().shape({
    ip_address: Yup.string().required('Required').label('IP').matches(
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
        'Invalid IP address'
    ),
    user_email: Yup.string().required('Required').label('User')
});

let initialValues = {
    ip_address: "",
    comment: "",
    user_email: "",
};

interface BlacklistFormState extends IState {
    isDeleting: boolean;
    mode: string;
}

interface BlacklistFormProps extends ICallback {
    action: string;
    data: IBlacklist | null;
    onCancel?: () => void;
}

class BlacklistForm extends React.Component<BlacklistFormProps, BlacklistFormState> {

    state: BlacklistFormState;

    constructor(props: BlacklistFormProps) {
        super(props);

        this.state = {
            success: false,
            isDeleting: false,
            mode: this.props.action
        };
    }

    handleSubmit = async (values: Record<string, any>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const request: Promise<any> = adminService.updateBlacklistStatus(values.ip_address, true, values.user_email, values.comment);

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
        await adminService.updateBlacklistStatus(values.ip_address, false, values.user_id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    };

    render() {

        switch (this.state.mode) {
            case "add":
                return (
                    <>
                        <Formik
                            initialValues={this.props?.data || initialValues}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, isValid, dirty}) => {
                                return (
                                    <Form id="blacklist-form">
                                        <div className="input">
                                            <div className="input__title">User <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="user_email"
                                                    id="user_email"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type User"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="user_email" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">IP Address <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="ip_address"
                                                    id="ip_address"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type IP Address"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="ip_address" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Comment</div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="comment"
                                                    id="comment"
                                                    as="textarea"
                                                    rows="5"
                                                    className="input__textarea"
                                                    placeholder="Type Comment"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="comment" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <button className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                            {`${this.state.mode === 'edit' ? 'Save' : 'Add'}`}
                                        </button>

                                        {this.state.errorMessages && (
                                            <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                        )}
                                    </Form>
                                );
                            }}
                        </Formik>
                    </>
                );
            case "delete":
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

export default BlacklistForm;
