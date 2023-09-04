import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import FormValidator from "@/services/form-validator/form-validator";
import PhoneInputField from "@/components/phone-input-field";
import {countries} from "countries-list";
import {UsaStates} from 'usa-states';
import {ANNUAL_FEES} from "@/constants/annual-fees";
import clientService from "@/services/client/client-service";

const selectedCountry = 'US';

const formSchema = Yup.object().shape({
    region: Yup.string().uppercase().required('Required'),
    state: Yup.string().uppercase().required('Required'),
    is_finra: Yup.boolean(),
    crd: Yup.string().min(3).max(12).required('Required'),
    company_name: Yup.string().min(3).max(99).required('Required').label('Legal Company Name'),
    email: Yup.string().email("Invalid email").required("Required"),
    mobile_number: FormValidator.phoneNumberField,
    address1: Yup.string().min(3).max(99).required('Required').label('Address 1'),
    address2: Yup.string().min(3).max(99).label('Address 1'),
    city: Yup.string().min(3).max(99).required('Required').label('City'),
    zip_code: Yup.string().min(3).max(99).required('Required').label('Zip code'),
    country: Yup.string().required('Required').label('City'),
    annual_fees: Yup.string().required('Required'),
});

interface MembershipFormState extends IState {
    formInitialValues: {},
    usaStates: {
        abbreviation: string;
        name: string;
    }[],
    selectedCountry: string;
    isFinra: boolean;
}

interface MembershipFormProps extends ICallback {
    action: string;
    data: IForm<IMembershipForm> | null;
    onCancel?: () => void;
}

class MembershipForm extends React.Component<MembershipFormProps, MembershipFormState> {

    state: MembershipFormState;

    constructor(props: MembershipFormProps) {
        super(props);
        console.log(props)
        const initialData = this.props.data || {} as IForm<IMembershipForm>;

        const initialValues: {
            region: string;
            state: string;
            is_finra: boolean;
            crd: string;
            company_name: string;
            email: string;
            mobile_number: string;
            address1: string;
            address2: string;
            city: string;
            zip_code: string;
            country: string;
            annual_fees: string;
        } = {
            region: initialData.data?.region || selectedCountry,
            state: initialData.data?.state || "",
            is_finra: initialData.data?.is_finra || false,
            crd: initialData.data?.crd || "",
            company_name: initialData.data?.company_name || "",
            email: initialData.data?.email || "",
            mobile_number: initialData.data?.mobile_number || "",
            address1: initialData.data?.address1 || "",
            address2: initialData.data?.address2 || "",
            city: initialData.data?.city || "",
            zip_code: initialData.data?.zip_code || "",
            country: initialData.data?.country || "",
            annual_fees: initialData.data?.annual_fees || "",
        };

        const usaStates = new UsaStates();
        const usaStatesList = usaStates.states;

        this.state = {
            success: false,
            formInitialValues: initialValues,
            usaStates: usaStatesList,
            selectedCountry: selectedCountry,
            isFinra: false
        };

    }

    handleSubmit = async (values: Record<string, string | boolean | null>, {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }) => {
        this.setState({errorMessages: null});
        values.name = 'membership';

        const request: Promise<any> = this.props.action == 'edit' ?
            clientService.updateUserForm(values, this.props.data?.data?.id || 0) :
            clientService.createUserForm(values);

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

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedRegion = e.target.value;
        setFieldValue("region", selectedRegion);
        setFieldValue("state", "");
        this.setState({selectedCountry: selectedRegion});
    };

    handleFinraChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isFinra = e.target.value === 'false';
        setFieldValue("is_finra", isFinra);
        this.setState({isFinra: isFinra});
    };

    render() {
        return (
            <>
                <Formik
                    initialValues={this.state.formInitialValues}
                    validationSchema={formSchema}
                    onSubmit={this.handleSubmit}
                >
                    {({isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                        return (
                            <Form id="bank-form">
                                <div className="input">
                                    <div className="input__title">Region Information <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="region"
                                            id="region"
                                            as="select"
                                            className="b-select"
                                            disabled={isSubmitting || this.isShow()}
                                            onChange={(e: any) => this.handleRegionChange(e, setFieldValue)}
                                        >
                                            <option value="">Select a region</option>
                                            {Object.keys(countries).map((countryCode: string) => (
                                                <option key={countryCode} value={countryCode}>
                                                    {countries[countryCode as keyof typeof countries]?.name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="region" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                {this.state.selectedCountry === selectedCountry && (
                                    <div className="input">
                                        <div className="input__title">State <i>*</i></div>
                                        <div
                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                            <Field
                                                name="state"
                                                id="state"
                                                as="select"
                                                className="b-select"
                                                disabled={isSubmitting || this.isShow()}
                                            >
                                                <option value="">Select a state</option>
                                                {this.state.usaStates.map((state) => (
                                                    <option key={state.abbreviation} value={state.abbreviation}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="state" component="div"
                                                          className="error-message"/>
                                        </div>
                                    </div>
                                )}

                                <div className="input">
                                    <div
                                        className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            type="checkbox"
                                            name="is_finra"
                                            id="is_finra"
                                            disabled={isSubmitting || this.isShow()}
                                            onClick={(e: any) => this.handleFinraChange(e, setFieldValue)}
                                        />
                                        <label htmlFor="is_finra">
                                            <span></span><i> FINRA Member
                                        </i>
                                        </label>
                                        <ErrorMessage name="agreement" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>


                                {this.state.isFinra && (
                                    <div className="input">
                                        <div className="input__title">MPID</div>
                                        <div
                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                            <Field
                                                name="mpid"
                                                id="mpid"
                                                type="text"
                                                className="input__text"
                                                placeholder="Type mpid"
                                                disabled={isSubmitting || this.isShow()}
                                            />
                                            <ErrorMessage name="mpid" component="div"
                                                          className="error-message"/>
                                        </div>
                                    </div>
                                )}
                                <div className="input">
                                    <div className="input__title">CRD#</div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="crd"
                                            id="crd"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type crd"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="crd" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Legal name of the company <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="company_name"
                                            id="company_name"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type Company Name"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="mpid" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Email Address <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="email"
                                            id="email"
                                            type="email"
                                            className="input__text input-class-3"
                                            placeholder="Type an Email Address"
                                            autoComplete="username"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="email" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Phone Number <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="mobile_number"
                                            id="mobile_number"
                                            component={PhoneInputField}
                                            disabled={isSubmitting || this.isShow()}
                                            country="us"
                                        />
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title"><span className="strong">Primary Address</span></div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Address 1 <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="address1"
                                            id="address1"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type Address 1"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="address1" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Address 2 (optional)</div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="address2"
                                            id="address2"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type Address 2"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="address2" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">City <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="city"
                                            id="city"
                                            type="text"
                                            className="input__text"
                                            placeholder="Type City"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="city" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">ZIP code <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="zip_code"
                                            id="zip_code"
                                            type="text"
                                            className="input__text input-class-4"
                                            placeholder="Type ZIP code"
                                            disabled={isSubmitting || this.isShow()}
                                        />
                                        <ErrorMessage name="house_number" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Country <i>*</i></div>
                                    <div className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                        <Field
                                            name="country"
                                            id="country"
                                            as="select"
                                            className="b-select"
                                            disabled={isSubmitting || this.isShow()}
                                        >
                                            <option value="">Select a region</option>
                                            {Object.keys(countries).map((countryCode: string) => (
                                                <option key={countryCode} value={countryCode}>
                                                    {countries[countryCode as keyof typeof countries]?.name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="country" component="div"
                                                      className="error-message"/>
                                    </div>
                                </div>
                                <div className="input">
                                    <div className="input__title">Annual fees <i>*</i></div>
                                    <div className="modal-terms mb-10px">
                                        <span
                                            className="list-head">The annual fee for {process.env.APP_TITLE} membership is based on the level of contribution to the plan. There are three levels of membership by Firm Size:<br/>A Large, B Medium, C Small:</span>
                                    </div>
                                    <div className="input">
                                        <div
                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                            <Field
                                                name="annual_fees"
                                                id="annual_fees"
                                                as="select"
                                                className="b-select"
                                                disabled={isSubmitting || this.isShow()}
                                            >
                                                <option value="">Select Annual Fees</option>
                                                {ANNUAL_FEES.map(fees => (
                                                    <option value={fees.level}
                                                            key={fees.level}>{fees.level}: {fees.budget}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="annual_fees" component="div"
                                                          className="error-message"/>
                                        </div>
                                    </div>
                                </div>

                                {this.props.action !== 'view' && (
                                    <button id="add-bank-acc"
                                            className={`b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                            type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                        Save Membership Form
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
            ;
    }
}

export default MembershipForm;
