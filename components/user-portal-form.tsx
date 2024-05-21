import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Image from "next/image";
import {
    CustomerType,
    getCustomerTypeDescription,
    getCustomerTypeImage,
    getCustomerTypeName
} from "@/enums/customer-type";
import Link from "next/link";
import downloadFile from "@/services/download-file/download-file";
import {SUBSCRIBER_AGREEMENT} from "@/constants/settings";
import formService from "@/services/form/form-service";
import AlertBlock from "@/components/alert-block";
import {IDataContext} from "@/interfaces/i-data-context";

const formSchema = Yup.object().shape({
    customer_type: Yup.mixed<CustomerType>().oneOf(
        Object.values(CustomerType),
        'Invalid Type of Customer'
    )
});

let initialValues = {
    customer_type: "" as string | null,
};

interface UserPortalFormState extends IState {
    isDisabled: boolean;
}

interface UserPortalFormProps extends ICallback {
    customer_type: string | null,
}

class UserPortalForm extends React.Component<UserPortalFormProps, UserPortalFormState> {
    state: UserPortalFormState;

    constructor(props: UserPortalFormProps, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            isDisabled: !!this.props.customer_type
        }

        if (this.props.customer_type) initialValues.customer_type = this.props.customer_type;
    }


    handleSubmit = async (values: Record<string, string | boolean | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        await formService.createUserPortalForm(values)
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
            <Formik<any>
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, submitForm, setFieldValue, values, isValid, dirty}) => {
                    return (
                        <>
                            <Form>
                                <div className={'input'}>
                                    <div className="sign-up__row">
                                        {Object.values(CustomerType).map((type) => (
                                            <React.Fragment key={type}>
                                                <Field
                                                    name="customer_type"
                                                    id={`customer_type_${type}`}
                                                    type="radio"
                                                    value={type}
                                                    className="hidden"
                                                    disabled={isSubmitting || this.state.isDisabled}
                                                />
                                                <label
                                                    className={`sign-up__item ${this.state.isDisabled ? 'disabled' : ''} ${values.customer_type === type ? 'selected' : 'not-selected'}`}
                                                    htmlFor={`customer_type_${type}`}>
                                                    <div className="sign-up__item-img">
                                                        <Image src={getCustomerTypeImage(type)} width={64} height={64}
                                                               alt={type}/>
                                                    </div>
                                                    <span>{getCustomerTypeName(type)}</span>
                                                </label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <ErrorMessage name="customer_type" component="div"
                                                  className="error-message"/>
                                    {values.customer_type && (
                                        <>
                                            <div className={'sign-up__text mt-4 text-justify'}>
                                                {getCustomerTypeDescription(values.customer_type as CustomerType)}
                                            </div>
                                            <div className="sign-up__text mt-4">
                                                <p className={'mb-0'}>Please complete this <Link
                                                    className="link"
                                                    href=""
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        downloadFile.PDF(SUBSCRIBER_AGREEMENT)
                                                    }}
                                                    download
                                                >
                                                    form
                                                </Link></p>
                                                <p className={'mb-0'}>Please note: The DORRS signature area should be
                                                    left
                                                    blank.</p>
                                                <p className={'mb-0'}>Return the electronic form by emailing it to <Link
                                                    href={'mailto:info@dorrs.io'}>info@dorrs.io</Link></p>
                                            </div>
                                        </>
                                    )}


                                </div>


                                {!this.props.customer_type && (
                                    <button id="add-bank-acc"
                                            className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                        Save User Portal Form
                                    </button>
                                )}

                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                )}
                            </Form>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default UserPortalForm;
