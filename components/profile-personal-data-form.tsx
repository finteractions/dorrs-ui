import React from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import PhoneInputField from "@/components/phone-input-field";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import userService from "@/services/user/user-service";
import formValidator from "@/services/form-validator/form-validator";
import {DataContext} from "@/contextes/data-context";
import {IDataContext} from "@/interfaces/i-data-context";
import {isNull} from "util";
import UserImage from "@/components/user-image";
import PhoneInput from "react-phone-input-2";
import {IUserProfile} from "@/interfaces/i-user-profile";

const allowedFileSizeMB = 1
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;
const allowedExt = ['png', 'jpg', 'jpeg']

const formSchema = Yup.object().shape({
    first_name: formValidator.firstNameField,
    last_name: formValidator.lastNameField,
    email:
        Yup.string()
            .email("Invalid email")
            .required("Required"),
    mobile_number: formValidator.phoneNumberField(),
    user_image_tmp: Yup.mixed()
        .test('user_image_tmp', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('user_image_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
    country: Yup.string().required("Required").label('Country'),
    city: Yup.string().required("Required").label('City'),
    state: Yup.string().required("Required").label('State'),
    address: Yup.string().required("Required").label('Address'),
    house_number: Yup.string().required("Required").label('Building / Apartment'),
});

let initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    user_image_tmp: "",
    otp_token: ""
};

type ProfilePersonalDataFormFields = {
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
    user_image_tmp: any;
    otp_token: string;
}

interface ProfilePersonalDataFormState extends IState {
    isLoading: boolean;
    selectedFile: File | null;
    // editImage: boolean;
    editMode: boolean;
    needOtpChecking: boolean;
    formValues: ProfilePersonalDataFormFields;
    isSubmitting: boolean;
    isEmailChanged: boolean;
}

class ProfilePersonalDataForm extends React.Component<{
    onCallback: (values: any) => void
}, ProfilePersonalDataFormState> {

    static contextType = DataContext;

    declare context: React.ContextType<typeof DataContext>;

    state: ProfilePersonalDataFormState;

    userProfile: IUserProfile | null = null;
    errors: Array<string> = new Array<string>();

    initialValues: ProfilePersonalDataFormFields;

    // formRef: RefObject<FormikProps<ProfilePersonalDataFormFields>> = createRef();

    constructor(props: ICallback, context: IDataContext<null>) {
        super(props);
        this.context = context;

        this.state = {
            success: false,
            errorMessages: null,
            isLoading: true,
            selectedFile: null,
            // editImage: false,
            editMode: false,
            needOtpChecking: false,
            formValues: initialValues,
            isSubmitting: false,
            isEmailChanged: false
        };

        this.initialValues = this.context?.userProfile || initialValues;
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        this.userProfile = this.context?.userProfile || null;
        this.errors = this.context?.errors.get('userProfile') || [];

        if (this.userProfile) Object.assign(this.initialValues, this.userProfile);

        if ((this.userProfile && !this.errors?.length) || (!this.userProfile && this.errors?.length)) {
            this.state.isLoading ? this.setState({isLoading: false}) : null;
        }
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    };

    submitForm = async (values: Record<string, any>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({success: false, errorMessages: null, needOtpChecking: false, isSubmitting: true});

        setSubmitting(true);
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
            formData.append(key, values[key]);
        });
        formData.delete('user_image_tmp');
        formData.delete('user_image');
        if (this.state.selectedFile) {
            formData.append('user_image', this.state.selectedFile);
        }

        userService.updateUserProfile(formData)
            .then((res => {
                this.setState({success: true,/* editImage: false,*/ editMode: false, selectedFile: null});

                if (values.email !== this.initialValues.email) {
                    this.setState({isEmailChanged: true})
                } else {
                    this.context.getUserProfile();
                }

            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
            this.setState({isSubmitting: false}, () => {
                setTimeout(() => {
                    this.setState({success: false, isEmailChanged: false});
                }, 5000);
            })

        });
    };

    handleSubmit = async (values: ProfilePersonalDataFormFields, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        await this.submitForm(values, {setSubmitting});
    };


    render() {
        return (
            <>
                {this.state.isLoading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className="profile__right-title">Profile</div>
                        <div className="profile__right-wrap-full">
                            {this.errors.length ? (
                                <AlertBlock type="error" messages={this.errors}/>
                            ) : (
                                <>
                                    {this.state.editMode ? (
                                        <>
                                            <Formik
                                                initialValues={this.state.formValues.email ? this.state.formValues : this.initialValues}
                                                validationSchema={formSchema}
                                                onSubmit={this.handleSubmit}
                                                enableReinitialize={true}
                                            >
                                                {({isSubmitting, isValid, dirty, setFieldValue, errors, values,}) => {
                                                    formValidator.requiredFields(formSchema, values, errors);

                                                    return (
                                                        <Form className={"profile__panel"}>
                                                            <div className='profile__image__input'>
                                                                <div className="input__box">
                                                                    <div className="input__title">Profile
                                                                        Image
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <input
                                                                            id="user_image_tmp"
                                                                            name="user_image_tmp"
                                                                            type="file"
                                                                            accept={'.' + allowedExt.join(',.')}
                                                                            className="input__file"
                                                                            disabled={this.state.isSubmitting}
                                                                            onChange={(event) => {
                                                                                setFieldValue('user_image_tmp', event.target?.files?.[0] || '');
                                                                                this.handleFileChange(event);
                                                                            }}
                                                                        />
                                                                        {errors.user_image_tmp && (
                                                                            <div
                                                                                className="error-message">{errors.user_image_tmp.toString()}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/*)}*/}
                                                            <div className="profile__info__panel">
                                                                <div className="input__box">
                                                                    <div className="input__title">First
                                                                        Name <i>*</i></div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="first_name"
                                                                            id="first_name"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="First Name"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="first_name"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div className="input__title">Last
                                                                        Name <i>*</i></div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="last_name"
                                                                            id="last_name"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="Last Name"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="last_name"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box full">
                                                                    <div className="input__title">Email <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="email"
                                                                            id="email"
                                                                            type="email"
                                                                            className={`input__text`}
                                                                            placeholder="Email"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="email"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div className="input__title">Mobile
                                                                        Number <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="mobile_number"
                                                                            id="mobile_number"
                                                                            disabled={this.state.isSubmitting}
                                                                            component={PhoneInputField}
                                                                            country="us"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div
                                                                        className="input__title">Country <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="country"
                                                                            id="country"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="Country"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="country"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div className="input__title">State <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="state"
                                                                            id="state"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="State"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="state"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div className="input__title">City <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="city"
                                                                            id="city"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="City"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="city"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div
                                                                        className="input__title">Address <i>*</i>
                                                                    </div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="address"
                                                                            id="address"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="Address"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="address"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box">
                                                                    <div className="input__title">Building /
                                                                        Apartment <i>*</i></div>
                                                                    <div className="input__wrap">
                                                                        <Field
                                                                            name="house_number"
                                                                            id="house_number"
                                                                            type="text"
                                                                            className={`input__text`}
                                                                            placeholder="House Number"
                                                                            disabled={this.state.isSubmitting}
                                                                        />
                                                                        <ErrorMessage name="house_number"
                                                                                      component="div"
                                                                                      className="error-message"/>
                                                                    </div>
                                                                </div>
                                                                <div className="input__box buttons">
                                                                    <button
                                                                        className={`b-btn ripple ${(this.state.isSubmitting || !isValid || (!dirty && isNull(this.state?.selectedFile) && !this.state.formValues)) ? 'disable' : ''}`}
                                                                        type="submit"
                                                                        disabled={this.state.isSubmitting || !isValid || (!dirty && isNull(this.state?.selectedFile) && !this.state.formValues)}
                                                                    >Save Info
                                                                    </button>
                                                                    <button type={"button"}
                                                                            className={`b-btn-border ripple ${this.state.isSubmitting ? 'disable' : ''}`}
                                                                            disabled={this.state.isSubmitting}
                                                                            onClick={() => this.setState({editMode: false})}>Cancel
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        </Form>
                                                    );
                                                }}
                                            </Formik>
                                        </>
                                    ) : (
                                        <div className={"profile__panel"}>
                                            <div className='profile__image__panel'>
                                                {this.context?.userProfileLoading ? (
                                                    <LoaderBlock/>
                                                ) : (
                                                    <>
                                                        <UserImage alt={'Profile Image'}
                                                                   src={this.context.userProfile?.user_image || ''}
                                                                   height={'100%'} width={'100%'}/>
                                                    </>
                                                )}
                                            </div>
                                            <div className='profile__info__panel view__input__box'>
                                                <div className="input__box">
                                                    <div className="input__title">First Name</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.first_name}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">Last Name</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.last_name}
                                                    </div>
                                                </div>
                                                <div className="input__box full">
                                                    <div className="input__title">Email</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.email}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">Mobile Number</div>
                                                    <div className="input__wrap">
                                                        <PhoneInput
                                                            value={this.context.userProfile?.mobile_number || ''}
                                                            inputProps={{readOnly: true}}
                                                            disableDropdown
                                                            containerClass={'plain-tel-input'}/>
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">Country</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.country}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">State</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.state}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">City</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.city}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">Address</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.address}
                                                    </div>
                                                </div>
                                                <div className="input__box">
                                                    <div className="input__title">Building / Apartment</div>
                                                    <div className="input__wrap">
                                                        {this.context.userProfile?.house_number}
                                                    </div>
                                                </div>
                                                {this.context.userProfile?.firm && (
                                                    <div className="input__box">
                                                        <div className="input__title">Firm</div>
                                                        <div className="input__wrap">
                                                            {this.context.userProfile?.firm.name}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="input__box buttons">
                                                    <button type="button"
                                                            onClick={() => this.setState({
                                                                editMode: true,
                                                                success: false
                                                            })}
                                                            className={'b-btn ripple'}>Edit
                                                    </button>
                                                </div>


                                            </div>

                                        </div>
                                    )}


                                    {this.state.errorMessages && (
                                        <AlertBlock type="error"
                                                    messages={this.state.errorMessages}/>
                                    )}
                                    {this.state.success && (
                                        <>
                                            <AlertBlock type="success"
                                                        messages={['Personal data successfully updated']}/>

                                            {this.state.isEmailChanged && (
                                                <AlertBlock type="success"
                                                            messages={[`To change the Email follow the instructions was sent to ${this.context.userProfile?.email}`]}/>
                                            )}
                                        </>
                                    )}

                                </>
                            )}
                        </div>
                    </>
                )}
            </>
        );
    }
}

export default ProfilePersonalDataForm;
