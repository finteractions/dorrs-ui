import React, {SyntheticEvent, useEffect} from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import Link from "next/link";
import kycService from "@/services/kyc/kyc-service";
import AlertBlock from "@/components/alert-block";

const formSchema = Yup.object().shape({
    country:
        Yup.string()
            .required("Required"),
    state:
        Yup.string()
            .required("Required"),
    city:
        Yup.string()
            .required("Required"),
    address:
        Yup.string()
            .required("Required"),
    house_number:
        Yup.string()
            // .positive()
            .required("Required")
            // .label("Building / Apartment")
});

let initialValues = {
    country: "",
    state: "",
    city: "",
    address: "",
    house_number: ""
};

interface RegistrationResidenceAddressFormState extends IState {
}

class RegistrationResidenceAddressForm extends React.Component<{ onCallback: (values: any, nextStep: boolean) => void, initialValues?: any }, RegistrationResidenceAddressFormState> {

    state: RegistrationResidenceAddressFormState;

    constructor(props: ICallback) {
        super(props);

        this.state = {
            success: false,
        };

        if (Object.getOwnPropertyNames(this.props.initialValues).length !== 0) {
            initialValues = this.props.initialValues;
        }
    }


    handleSubmit = async (values: Record<string, string | boolean>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null})

        await kycService.addResidenceAddress(values)
            .then((res: any) => {
                this.onCallback(values, true);
            })
            .catch((error: IError) => {
                this.setState({errorMessages: error.messages})
            })
            .finally(() => setSubmitting(false))
    };

    handleBack(event: SyntheticEvent, values: Record<string, string | boolean>) {
        event.preventDefault();
        this.onCallback(values, false);
    }

    onCallback(values: Record<string, string | boolean>, nextStep: boolean) {
        this.props.onCallback(values, nextStep);
    }

    render() {
        return (
            <Formik
                initialValues={initialValues}
                validationSchema={formSchema}
                onSubmit={this.handleSubmit}
            >
                {({isSubmitting, isValid, values, setFieldValue, errors}) => {
                    useEffect(() => {
                        Object.entries(initialValues).forEach(([key, value]) => {
                            setFieldValue(key, value, true);
                        });
                    }, [setFieldValue]);

                    return (
                        <>
                            <div className="sign-up__title mb-48">Residence Address</div>
                            <Form>
                                <div className="input">
                                    <div className="input__title">Country <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            id="country"
                                            name="country"
                                            type="text"
                                            className="input__text input-class-2"
                                            placeholder="Type country"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="country" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">State <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            id="state"
                                            name="state"
                                            type="text"
                                            className="input__text input-class-2"
                                            placeholder="Type state"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="state" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">City <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="city"
                                            id="city"
                                            type="text"
                                            className="input__text input-class-1"
                                            placeholder="Type city"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="city" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Address <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="address"
                                            id="address"
                                            type="text"
                                            className="input__text input-class-3"
                                            placeholder="Type address"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="address" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Building / Apartment <i>*</i></div>
                                    <div className="input__wrap">
                                        <Field
                                            name="house_number"
                                            id="house_number"
                                            type="text"
                                            // step="1"
                                            className="input__text input-class-4"
                                            placeholder="Type building / apartment"
                                            disabled={isSubmitting}
                                        />
                                        <ErrorMessage name="house_number" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>

                                {this.state.errorMessages && (
                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                )}

                                <button
                                    className={`b-btn ripple ${(isSubmitting || !isValid) ? 'disable' : ''}`}
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                >Continue
                                </button>
                                <div className="login__bottom">
                                    <p>
                                        <i className="icon-chevron-left"></i> <Link className="login__link"
                                                                                    href=""
                                                                                    onClick={(event) => this.handleBack(event, values)}
                                    >Back
                                    </Link>
                                    </p>
                                </div>
                            </Form>
                        </>
                    );
                }}
            </Formik>
        );
    }
}

export default RegistrationResidenceAddressForm;
