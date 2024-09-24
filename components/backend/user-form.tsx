import React, {RefObject} from 'react';

import {IUserDetail} from "@/interfaces/i-user-detail";

import "react-phone-input-2/lib/style.css";
import adminService from "@/services/admin/admin-service";
import {IUser} from "@/interfaces/i-user";

import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {UserType} from "@/enums/user-type";
import FormValidator from "@/services/form-validator/form-validator";
import PhoneInputField from "@/components/phone-input-field";
import {AccountType, getAccountTypeDescription} from "@/enums/account-type";
import Select from "react-select";
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";
import AlertBlock from "@/components/alert-block";
import CopyClipboard from "@/components/copy-clipboard";
import formValidator from "@/services/form-validator/form-validator";


const formSchema = Yup.object().shape({
    account_type: Yup.mixed<AccountType>().oneOf(
        Object.values(AccountType),
        'Invalid Type of Account'
    )
        .required('Required').label('Account Type '),
    user_type: Yup.mixed<UserType>()
        .oneOf(
            Object.values(UserType),
            'Invalid Type'
        )
        .required('Required').label('User Type '),
    first_name: FormValidator.firstNameField,
    last_name: FormValidator.lastNameField,
    email:
        Yup.string()
            .email("Invalid email")
            .required("Required").label('Email'),
    password1: FormValidator.passwordField,
    password2: FormValidator.confirmPasswordField('password1'),
    mobile_number: FormValidator.phoneNumberField().label('Mobile Number'),
    data_feed_providers: Yup.array().of(Yup.string()).label('Data Feed Providers'),
    email_verified: Yup.boolean().label('Email Verified'),
});

interface UserFormState extends IState {
    formInitialValues: {},
    mode: string;
    data: IUserDetail | null;
    isApproving: boolean | null;
    isConfirmedApproving: boolean;
    isActivation: boolean | null;
    isConfirmedActivation: boolean;
    loading: boolean;
    approved_by_user: IUser | null,
    showPassword: boolean;
    showPasswordConfirm: boolean;
    dataFeedProviders: Array<IDataFeedProvider>;
}

interface UserFormProps extends ICallback {
    action: string;
    data: IUserDetail | null;
    onCancel?: () => void;
}

class UserForm extends React.Component<UserFormProps, UserFormState> {
    commentTextarea = React.createRef<HTMLTextAreaElement>();
    state: UserFormState;

    formRef: RefObject<any>;

    constructor(props: UserFormProps) {
        super(props);
        const initialData = this.props.data || {} as IUserDetail;

        const initialValues: {
            user_type: string,
            first_name: string,
            last_name: string,
            email: string,
            password1: string,
            password2: string,
            mobile_number: string,
            data_feed_providers: string[],
            email_verified: boolean
        } = {
            user_type: initialData?.user_id?.user_type || '',
            first_name: initialData?.user_id?.first_name || '',
            last_name: initialData?.user_id?.last_name || '',
            email: initialData?.user_id?.email || '',
            password1: '',
            password2: '',
            mobile_number: initialData?.user_id?.mobile_number || '',
            data_feed_providers: initialData?.user_id?.data_feed_providers || [],
            email_verified: initialData?.user_id?.email_verified || false
        }

        this.state = {
            success: false,
            mode: this.props.action,
            data: this.props.data,
            isApproving: false,
            isConfirmedApproving: false,
            isActivation: null,
            isConfirmedActivation: false,
            loading: true,
            approved_by_user: null,
            formInitialValues: initialValues,
            showPassword: false,
            showPasswordConfirm: false,
            dataFeedProviders: []
        };

        this.formRef = React.createRef();

        this.handleTogglePassword = this.handleTogglePassword.bind(this);
        this.handleTogglePasswordConfirm = this.handleTogglePasswordConfirm.bind(this);
    }

    componentDidMount() {
        this.getDataFeedProviders()

        this.formRef?.current.setFieldTouched('data_feed_providers')
    }

    getDataFeedProviders() {
        dataFeedProvidersService.getList()
            .then((res: Array<IDataFeedProvider>) => {
                const data = res || [];
                this.setState({dataFeedProviders: data})
            })
    }


    handleSubmit = async (values: Record<string, string | boolean | string[]>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null})

        await adminService.addUser(values)
            .then((res: any) => {
                this.setState({success: true});
                this.props.onCallback(null);
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages})
            })
            .finally(() => setSubmitting(false))

    }

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleTogglePassword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleTogglePasswordConfirm() {
        this.setState({showPasswordConfirm: !this.state.showPasswordConfirm});
    }

    navigate = (email?: string) => {
        this.props.onCallback(email)
    }

    generatePassword = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, length = 8) => {
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberChars = '0123456789';
        const allChars = lowercaseChars + uppercaseChars + numberChars;

        const getRandomChar = (chars: any) => chars[Math.floor(Math.random() * chars.length)];

        let password = '';

        password += getRandomChar(lowercaseChars);
        password += getRandomChar(uppercaseChars);
        password += getRandomChar(numberChars);


        const remainingLength = length - 3;
        for (let i = 0; i < remainingLength; i++) {
            password += getRandomChar(allChars);
        }

        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        setFieldValue('password1', password)
        setFieldValue('password2', password)
        this.formRef?.current?.setFieldTouched('password1', false)
        this.formRef?.current?.setFieldTouched('password2', false)

    }

    render() {

        switch (this.state.mode) {
            case "add":
            case "edit":
                return (
                    <Formik<any>
                        initialValues={this.state.formInitialValues}
                        validationSchema={formSchema}
                        onSubmit={this.handleSubmit}
                        innerRef={this.formRef}
                    >
                        {({isSubmitting, isValid, values, setFieldValue, errors}) => {
                            formValidator.requiredFields(formSchema, values, errors);

                            return (
                                <>
                                    {!this.state.success ? (
                                        <>
                                            <Form>
                                                <div className="input">
                                                    <div className="input__title">First Name <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="first_name"
                                                            id="first_name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type First Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="first_name"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Last Name <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="last_name"
                                                            id="last_name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Last Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="last_name"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Email <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="email"
                                                            id="email"
                                                            type="email"
                                                            className="input__text"
                                                            placeholder="Type Email"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="email"
                                                                      component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Mobile Number <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="mobile_number"
                                                            id="mobile_number"
                                                            component={PhoneInputField}
                                                            height={40}
                                                            country="us"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div
                                                        className="input__title d-flex align-items-center justify-content-between">
                                                        <div>Password<i>*</i></div>
                                                        <div>
                                                            <button type={'button'}
                                                                    onClick={() => this.generatePassword(setFieldValue)}
                                                                    className={'border-grey-btn ripple'}>Generate
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="password1"
                                                            id="password1"
                                                            type={this.state.showPassword ? "text" : "password"}
                                                            className={`input__text input-password ${this.state.showPassword ? "view" : ""}`}
                                                            placeholder="Enter password"
                                                            autoComplete="new-password"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <button
                                                            onClick={this.handleTogglePassword}
                                                            type="button"
                                                            tabIndex={-1}
                                                            className="show-password icon-eye"
                                                        ></button>
                                                        <ErrorMessage name="password1" component="div"
                                                                      className="error-message"/>

                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">
                                                        Password Confirmation
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${this.state.showPasswordConfirm ? "active" : ""}`}>
                                                        <Field
                                                            name="password2"
                                                            id="password2"
                                                            type={this.state.showPasswordConfirm ? "text" : "password"}
                                                            className={`input__text input-password ${this.state.showPasswordConfirm ? "view" : ""}`}
                                                            placeholder="Repeat password"
                                                            autoComplete="new-password"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <button
                                                            onClick={this.handleTogglePasswordConfirm}
                                                            type="button"
                                                            tabIndex={-1}
                                                            className="show-password icon-eye"
                                                        ></button>
                                                        <ErrorMessage name="password2" component="div"
                                                                      className="error-message"/>

                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">Account Type <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="account_type"
                                                            id="account_type"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option
                                                                value="">Select
                                                                an Account Type
                                                            </option>
                                                            {Object.values(AccountType).map((type) => (
                                                                <option
                                                                    key={type}
                                                                    value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>

                                                        {values.account_type && (
                                                            <p className={'mt-1'}>
                                                                                                    <span
                                                                                                        className={'fw-bold '}>
                                                                                                        Notice: {' '}
                                                                                                    </span>{
                                                                getAccountTypeDescription((values.account_type) as AccountType)}
                                                            </p>

                                                        )}
                                                        <ErrorMessage
                                                            name="account_type"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>


                                                <div className="input">
                                                    <div className="input__title">User Type <i>*</i>
                                                    </div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="user_type"
                                                            id="user_type"
                                                            as="select"
                                                            className="b-select"
                                                            disabled={isSubmitting || this.isShow()}
                                                        >
                                                            <option
                                                                value="">Select
                                                                a User Type
                                                            </option>
                                                            {Object.values(UserType).map((type) => (
                                                                <option
                                                                    key={type}
                                                                    value={type}>
                                                                    {type}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage
                                                            name="user_type"
                                                            component="div"
                                                            className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Data Feed Providers</div>
                                                    <div
                                                        className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                        <Field
                                                            name="data_feed_providers"
                                                            id="data_feed_providers"
                                                            as={Select}
                                                            className={`b-select-search`}
                                                            placeholder="Select Data Feed Providers"
                                                            classNamePrefix="select__react"
                                                            isMulti={true}
                                                            disabled={isSubmitting || this.isShow()}
                                                            options={this.state.dataFeedProviders.map((dataFeedProvider) => ({
                                                                value: dataFeedProvider.name,
                                                                label: dataFeedProvider.name
                                                            }))}
                                                            onChange={(selectedOptions: any) => {
                                                                const selectedValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                                                                setFieldValue('data_feed_providers', selectedValues);
                                                            }}
                                                            value={(values.data_feed_providers as Array<string>).map((value) => ({
                                                                value,
                                                                label: value
                                                            })) || []}
                                                        />

                                                    </div>
                                                </div>

                                                <div className={'input'}>
                                                    <div
                                                        className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="email_verified"
                                                            id="email_verified"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <label htmlFor="email_verified">
                                                            <span></span><i> Email Verified
                                                        </i>
                                                        </label>
                                                        <p className={'mt-1'}>
                                                                                                    <span
                                                                                                        className={'fw-bold '}>
                                                                                                        Notice: {' '}
                                                                                                    </span> If checked,
                                                            the User will not need to confirm the email and will not be
                                                            sent a confirmation email
                                                        </p>
                                                        <ErrorMessage name="email_verified" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                <button id="add-bank-acc"
                                                        className={`b-btn ripple ${(isSubmitting || !isValid) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid}>
                                                    Save User
                                                </button>
                                                {this.state.errorMessages && (
                                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                )}
                                            </Form>


                                        </>
                                    ) : (
                                        <>
                                            <div className='approve-form'>
                                                <div
                                                    className={`approve-form-text w-100 d-flex align-items-center`}>
                                                    <>
                                                        <div>Information about User:</div>
                                                        <div className={'ml-20px link cursor-pointer'}
                                                             onClick={() => this.navigate(values.email)}>
                                                            {values.email}
                                                        </div>
                                                        <div>
                                                            <CopyClipboard
                                                                text={`${values.email} ${values.password1}`}/>
                                                        </div>
                                                    </>
                                                </div>
                                            </div>
                                            <div className="form-panel">
                                                <div className='view-form user-view-form'>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Email</div>
                                                        <div
                                                            className="box__wrap">{values.email}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Password</div>
                                                        <div
                                                            className="box__wrap">{values.password1}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        }}
                    </Formik>
                )
            case "view":
                return (
                    ''
                )
            case "delete":
                return ''
        }
    }
}

export default UserForm;
