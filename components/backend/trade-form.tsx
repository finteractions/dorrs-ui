import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import adminService from "@/services/admin/admin-service";
import AlertBlock from "@/components/alert-block";

const formSchema = Yup.object().shape({
    // active: Yup.string().required('Required').label('Active'),
});

let initialValues = {
    active: ""
};

interface TradeFormState extends IState {
    // isDeleting: boolean;
}

interface TradeFormProps extends ICallback {
    action: string;
    data: IAdminAsset | null;
    onCancel?: () => void;
}

class TradeForm extends React.Component<TradeFormProps, TradeFormState> {

    state: TradeFormState;

    constructor(props: TradeFormProps) {
        super(props);

        this.state = {
            success: false
            // isDeleting: false
        };
    }

    handleSubmit = async (values: Record<string, any>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});

        const data = {
            asset: this.props.data?.label,
            active: values.active === 'true'
        }

        const request: Promise<any> = adminService.updateAssetStatus(data);

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

    render() {
        return (
            <>
                <Formik
                    initialValues={this.props?.data || initialValues}
                    validationSchema={formSchema}
                    onSubmit={this.handleSubmit}
                >
                    {({isSubmitting, isValid, dirty}) => {
                        return (
                            <Form id="trade-form">
                                <div className="input">
                                    <div className="input__title">Active</div>
                                    <div className="input__wrap">
                                        <Field
                                            name="active"
                                            id="active"
                                            as="select"
                                            className="b-select"
                                            disabled={isSubmitting}
                                        >
                                            <option value='false'>No</option>
                                            <option value='true'>Yes</option>
                                        </Field>
                                        <ErrorMessage name="active" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                <button id="add-asset-acc"
                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                        Save
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
    }
}

export default TradeForm;
