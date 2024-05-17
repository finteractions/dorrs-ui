import React from 'react';
import UserActivityLogsBlock from "@/components/backend/user-activity-logs-block";
import adminFileService from "@/services/admin/admin-file-service";
import {IUserDetail} from "@/interfaces/i-user-detail";
import formatterService from "@/services/formatter/formatter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import adminService from "@/services/admin/admin-service";
import {IUser} from "@/interfaces/i-user";
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import adminIconService from "@/services/admin/admin-icon-service";
import UserImage from "@/components/user-image";
import Link from "next/link";
import NoDataBlock from "@/components/no-data-block";
import UserPermissionsBlock from "@/components/backend/user-permissions-block";
import {IFirm} from "@/interfaces/i-firm";
import {faClose, faEdit, faEye, faCheck} from "@fortawesome/free-solid-svg-icons";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {AccountType, getAccountTypeDescription} from "@/enums/account-type";
import {CustomerType, getCustomerTypeName} from "@/enums/customer-type";
import {UserType} from "@/enums/user-type";
import Select from "react-select";
import dataFeedProvidersService from "@/services/data-feed-providers/data-feed-providers";

const formFirmSchema = Yup.object().shape({
    firm_id: Yup.number().required('Required').label('Firm'),
});


const formAccountTypeSchema = Yup.object().shape({
    account_type: Yup.string().required('Required').label('Account Type'),
});

const formUserTypeSchema = Yup.object().shape({
    user_type: Yup.string().required('Required').label('User Type'),
});

const formCustomerTypeSchema = Yup.object().shape({
    customer_type: Yup.string().required('Required').label('Customer'),
});

const formDataFeedProvidersSchema = Yup.object().shape({
    customer_type: Yup.string().required('Required').label('Customer'),
});

interface UserBlockState extends IState {
    mode: string;
    data: IUserDetail | null;
    isApproving: boolean | null;
    isConfirmedApproving: boolean;
    isActivation: boolean | null;
    isConfirmedActivation: boolean;
    loading: boolean;
    approved_by_user: IUser | null
    firms: Array<IFirm> | null
    isUserFirmEdit: boolean;
    isUserAccountTypeEdit: boolean;
    isUserTypeEdit: boolean;
    isUserCustomerTypeEdit: boolean;
    isUserDataFeedProvidersEdit: boolean;
    formFirmInitialValues: { firm_id: number | null },
    formAccountTypeInitialValues: { account_type: string | null },
    formCustomerTypeInitialValues: { customer_type: string | null },
    formDataFeedProvidersInitialValues: { data_feed_providers: Array<string> | [] },
    formUserTypeInitialValues: { user_type: string | null },
    selectedAccountType: string
    selectedUserType: string
    selectedCustomerType: string
    dataFeedProviders: Array<IDataFeedProvider>;
}

interface UserBlockProps {
    user_id: string;
}

class UserBlock extends React.Component<UserBlockProps, UserBlockState> {
    commentTextarea = React.createRef<HTMLTextAreaElement>();
    state: UserBlockState;

    constructor(props: UserBlockProps) {
        super(props);

        this.state = {
            success: false,
            mode: 'view',
            data: null,
            isApproving: false,
            isConfirmedApproving: false,
            isActivation: null,
            isConfirmedActivation: false,
            loading: true,
            approved_by_user: null,
            firms: null,
            isUserFirmEdit: false,
            isUserAccountTypeEdit: false,
            isUserCustomerTypeEdit: false,
            isUserTypeEdit: false,
            isUserDataFeedProvidersEdit: false,
            formFirmInitialValues: {firm_id: null},
            formAccountTypeInitialValues: {account_type: null},
            formUserTypeInitialValues: {user_type: null},
            formCustomerTypeInitialValues: {customer_type: null},
            formDataFeedProvidersInitialValues: {data_feed_providers: []},
            selectedAccountType: '',
            selectedUserType: '',
            selectedCustomerType: '',
            dataFeedProviders: []
        };
    }

    componentDidMount() {

        if (this.state.data?.approved_by) {
            this.setState({loading: true});
        } else {
            this.setState({approved_by_user: null, loading: true})
        }
        this.getUser(this.props.user_id);
        this.getFirms();
        this.getDataFeedProviders()
    }

    getDataFeedProviders() {
        dataFeedProvidersService.getList()
            .then((res: Array<IDataFeedProvider>) => {
                const data = res || [];
                this.setState({dataFeedProviders: data})
            })
    }

    getFirms = () => {
        adminService.getFirms()
            .then((res: IFirm[]) => {
                const data = res?.sort((a, b) => a.id - b.id) || [];
                this.setState({firms: data});
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
    }

    handleApprove = async (values: any, comment: string) => {
        this.setState({loading: true});
        await adminService.approveUser(values.user_id.email, this.state.isApproving || false, comment)
            .then(((res: any) => {
                // this.props.onCallback(values);
                this.getUser(this.state.data?.user_id.email || '');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
    };

    handleActivate = async (values: any) => {
        this.setState({loading: true});
        await adminService.activateUser(values.user_id.email, this.state.isActivation || false)
            .then(((res: any) => {
                // this.props.onCallback(values);
                this.getUser(this.state.data?.user_id.email || '');
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
    };

    getApprovedByUser = (id: number) => {
        adminService.getUserById(id)
            .then((res: IUser) => {
                this.setState({approved_by_user: res})
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.setState({
                    loading: false,
                    isApproving: null,
                    isConfirmedApproving: false,
                    isActivation: null,
                    isConfirmedActivation: false
                })
            });
    }

    getUser = (user_id: string) => {
        adminService.getUser(user_id || '')
            .then((res: IUserDetail[]) => {
                const user = res[0] as IUserDetail;
                const firm_id = user.user_id?.firm?.id || null;
                const account_type = user.user_id?.account_type || null;
                const customer_type = user.user_id?.customer_type || null;
                const user_type = user.user_id?.user_type || null;
                const data_feed_providers = user.user_id?.data_feed_providers || [];

                this.setState({
                    data: user,
                    formFirmInitialValues: {firm_id: firm_id},
                    formAccountTypeInitialValues: {account_type: account_type},
                    formCustomerTypeInitialValues: {customer_type: customer_type},
                    formUserTypeInitialValues: {user_type: user_type},
                    formDataFeedProvidersInitialValues: {data_feed_providers: data_feed_providers}
                });

                if (res[0].approved_by) {
                    this.getApprovedByUser(user.approved_by || 0);
                } else {
                    this.setState({
                        loading: false,
                        isApproving: null,
                        isConfirmedApproving: false,
                        isActivation: null,
                        isConfirmedActivation: false
                    })
                }
            })
            .catch((errors: IError) => {
                this.setState({
                    errorMessages: errors.messages,
                    loading: false,
                    data: null,
                    isConfirmedApproving: false,
                    isActivation: null,
                    isConfirmedActivation: false
                });
            })
    }

    editFirm = () => {
        this.setState({isUserFirmEdit: !this.state.isUserFirmEdit})
    }

    editAccountType = () => {
        this.setState({isUserAccountTypeEdit: !this.state.isUserAccountTypeEdit})
    }

    editUserType = () => {
        this.setState({isUserTypeEdit: !this.state.isUserTypeEdit})
    }

    editCustomerType = () => {
        this.setState({isUserCustomerTypeEdit: !this.state.isUserCustomerTypeEdit})
    }

    editDataFeedProviders = () => {
        this.setState({isUserDataFeedProvidersEdit: !this.state.isUserDataFeedProvidersEdit})
    }

    handleFirmSubmit = async (values: Record<string, number | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const data = {
            user_id: this.state.data?.user_id.email,
            firm_id: values.firm_id
        }

        await adminService.assignCompany(data)
            .then(((res: any) => {
                this.getUser(this.props.user_id);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.setState({isUserFirmEdit: false})
            });
    };

    handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedAccountType = e.target.value;
        setFieldValue("account_type", selectedAccountType);
        this.setState({selectedAccountType: selectedAccountType});
    };

    handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedUserType = e.target.value;
        setFieldValue("user_type", selectedUserType);
        this.setState({selectedUserType: selectedUserType});
    };

    handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const selectedCustomerType = e.target.value;
        setFieldValue("customer_type", selectedCustomerType);
        this.setState({selectedCustomerType: selectedCustomerType});
    };

    handleAccountTypeSubmit = async (values: Record<string, string | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const data = {
            user_id: this.state.data?.user_id.email,
            account_type: values.account_type
        }

        await adminService.assignAccountType(data)
            .then(((res: any) => {
                this.getUser(this.props.user_id);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.setState({isUserAccountTypeEdit: false})
            });
    };

    handleUserTypeSubmit = async (values: Record<string, string | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const data = {
            user_id: this.state.data?.user_id.email,
            user_type: values.user_type
        }

        await adminService.assignUserType(data)
            .then(((res: any) => {
                this.getUser(this.props.user_id);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.setState({isUserTypeEdit: false})
            });
    };

    handleCustomerTypeSubmit = async (values: Record<string, string | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const data = {
            user_id: this.state.data?.user_id.email,
            customer_type: values.customer_type
        }

        await adminService.assignCustomerType(data)
            .then(((res: any) => {
                this.getUser(this.props.user_id);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.setState({isUserCustomerTypeEdit: false})
            });
    };

    handleDataFeedProvidersSubmit = async (values: Record<string, string | null>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});
        const data = {
            user_id: this.state.data?.user_id.email,
            data_feed_providers: values.data_feed_providers
        }

        await adminService.assignDataFeedProvider(data)
            .then(((res: any) => {
                this.getUser(this.props.user_id);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.setState({isUserDataFeedProvidersEdit: false})
            });
    };

    render() {

        switch (this.state.mode) {
            case "add":
            case "edit":
                return ''
            case "view":
                return (
                    <>
                        <div className="user section">

                            {this.state.loading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.state.data ? (
                                        <>
                                            <div className="content__top">
                                                <div className="content__title">
                                                    <UserImage
                                                        src={this.state.data?.user_image || ''}
                                                        alt="Image"
                                                        width="70px"
                                                        height="70px"
                                                    />
                                                    {this.state.data?.user_id.first_name || ''} {this.state.data?.user_id.last_name || ''}
                                                </div>
                                                <Link href="/backend/user-management" className="border-btn">Back</Link>
                                            </div>
                                            <div className='approve-form'>
                                                {this.state.data?.approved_by ? (
                                                    <>
                                                        <div
                                                            className='approve-form-text'>Status: {this.state.data.is_approved ? 'Approved' : 'Rejected'} by {this.state.approved_by_user?.first_name || ''} {this.state.approved_by_user?.last_name || ''} at {formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}</div>
                                                        {this.state.data.comment && (
                                                            <div className="approve-form-comment">
                                                                <div className="approve-form-comment-text-panel">
                                                                    <div
                                                                        className="approve-form-comment-text-title">Comment:
                                                                    </div>
                                                                    <div className="approve-form-comment-text-message"
                                                                         title={this.state.data.comment}>{this.state.data.comment}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className='approve-form-text'>Status: Pending</div>
                                                        <div className='approve-form-confirm'>
                                                            {this.state.isConfirmedApproving ? (
                                                                <>
                                                                    <div className='approve-form-confirm-title mb-2'>Are
                                                                        you
                                                                        sure you want
                                                                        to {this.state.isApproving ? 'approve' : 'reject'}?
                                                                    </div>
                                                                    <button className={`b-btn ripple`} type="button"
                                                                            onClick={() => this.handleApprove(this.state.data, this.commentTextarea?.current?.value ?? '')}>Confirm
                                                                    </button>
                                                                    <button className={`border-btn ripple`}
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: false,
                                                                                isApproving: null
                                                                            })}>Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button className={`b-btn ripple`} type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: true,
                                                                                isApproving: true
                                                                            })}>Approve
                                                                    </button>
                                                                    <button className={`border-btn ripple`}
                                                                            type="button"
                                                                            onClick={() => this.setState({
                                                                                isConfirmedApproving: true,
                                                                                isApproving: false
                                                                            })}>Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                        {this.state.isConfirmedApproving && (
                                                            <div className="approve-form-comment">
                                                                <textarea ref={this.commentTextarea}
                                                                          placeholder={`Comment about "${this.state.isApproving ? 'Approve' : 'Reject'}" status set reason`}
                                                                          rows={5}/>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="form-panel">
                                                <div className='view-form user-view-form'>
                                                    {/*<div className="user-profile-image">*/}
                                                    {/*    <UserImage*/}
                                                    {/*        src={this.state.data?.user_image || ''}*/}
                                                    {/*        alt="Image"*/}
                                                    {/*        width="100px"*/}
                                                    {/*        height="100px"*/}
                                                    {/*    />*/}
                                                    {/*</div>*/}
                                                    <div className="view-form-box">
                                                        <div className="box__title">Name</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.user_id.first_name || ''} {this.state.data?.user_id.last_name || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Email</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.user_id.email || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Phone</div>
                                                        <div className="box__wrap">
                                                            <PhoneInput
                                                                value={this.state.data?.user_id.mobile_number || ''}
                                                                inputProps={{readOnly: true}}
                                                                disableDropdown
                                                                containerClass={'plain-tel-input'}/>
                                                        </div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Email Verified</div>
                                                        <div
                                                            className="box__wrap"><FontAwesomeIcon className="nav-icon"
                                                                                                   icon={adminIconService.iconBoolean(this.state.data?.user_id.email_verified || false)}/> {this.state.data?.user_id.email_verified ? 'Yes' : 'No'}
                                                        </div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">State</div>
                                                        <div className="box__wrap">{this.state.data?.state || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Country</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.country || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">City</div>
                                                        <div className="box__wrap">{this.state.data?.city || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Address</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.address || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">House Number</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.house_number || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Identity Verification</div>
                                                        <div className="box__wrap">
                                                            {this.state.data?.identity_verification && (
                                                                <a className="link" target='_blank'
                                                                   href={this.state.data?.identity_verification || ''}>{
                                                                    <FontAwesomeIcon
                                                                        className="nav-icon"
                                                                        icon={adminFileService.getIcon(this.state.data?.identity_verification || '')}/>} Download</a>
                                                            )}

                                                        </div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Sign DMCC Agreement</div>
                                                        <div className="box__wrap">
                                                            {this.state.data?.sign_dmcc_agreement && (
                                                                <a className="link" target='_blank'
                                                                   href={this.state.data?.sign_dmcc_agreement || ''}>{
                                                                    <FontAwesomeIcon
                                                                        className="nav-icon"
                                                                        icon={adminFileService.getIcon(this.state.data?.sign_dmcc_agreement || '')}/>} Download</a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Approved</div>
                                                        <div className="box__wrap"><FontAwesomeIcon className="nav-icon"
                                                                                                    icon={adminIconService.iconBoolean(this.state.data?.is_approved || false)}/> {this.state.data?.is_approved ? 'Yes' : 'No'}
                                                        </div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Approved By</div>
                                                        <div
                                                            className="box__wrap">{this.state.approved_by_user?.first_name || ''} {this.state.approved_by_user?.last_name || ''}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Approved Date</div>
                                                        <div
                                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.data?.approved_date_time || '')}</div>
                                                    </div>
                                                    <div className="view-form-box">
                                                        <div className="box__title">Created Date</div>
                                                        <div
                                                            className="box__wrap">{formatterService.dateTimeFormat(this.state.data?.created_at || '')}</div>
                                                    </div>

                                                </div>
                                                <div className="info-panel-section balances">
                                                    <UserPermissionsBlock
                                                        user_id={this.state.data?.user_id.email || ''}/>

                                                    <div className="mb-3">
                                                        <div className="info-panel-section-title mb-2">
                                                            <div className='info-panel-title-text'>Firm</div>
                                                        </div>

                                                        <div className={'d-flex align-items-center'}>
                                                            <div>
                                                                {!this.state.isUserFirmEdit ? (
                                                                    <>
                                                                        {this.state.data?.user_id?.firm?.name ? this.state.data?.user_id?.firm?.name : '-'}</>
                                                                ) : (
                                                                    <>
                                                                        <Formik
                                                                            initialValues={this.state.formFirmInitialValues}
                                                                            validationSchema={formFirmSchema}
                                                                            onSubmit={this.handleFirmSubmit}
                                                                        >
                                                                            {({
                                                                                  isSubmitting, errors
                                                                              }) => {
                                                                                return (
                                                                                    <Form id={'firm-user'}
                                                                                          className={'edit-form-small'}>
                                                                                        <div className="input">
                                                                                            <div
                                                                                                className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                                                                <Field
                                                                                                    name="firm_id"
                                                                                                    id="firm_id"
                                                                                                    as="select"
                                                                                                    className="b-select"
                                                                                                    disabled={isSubmitting}
                                                                                                >
                                                                                                    <option
                                                                                                        value="">Select
                                                                                                        a Firm
                                                                                                    </option>
                                                                                                    {this.state.firms?.map((firm: IFirm) => (
                                                                                                        <option
                                                                                                            key={firm.id}
                                                                                                            value={firm.id}>
                                                                                                            {firm.name}
                                                                                                        </option>
                                                                                                    ))}
                                                                                                </Field>

                                                                                                <ErrorMessage
                                                                                                    name="firm_id"
                                                                                                    component="div"
                                                                                                    className="error-message"/>
                                                                                            </div>
                                                                                        </div>
                                                                                        <>
                                                                                            <div
                                                                                                className='admin-table-actions ml-20px'>
                                                                                                <button
                                                                                                    type="submit"
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faCheck}/>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={this.editFirm}
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faClose}/>
                                                                                                </button>
                                                                                            </div>
                                                                                        </>
                                                                                    </Form>
                                                                                );
                                                                            }}
                                                                        </Formik>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {this.state.data.is_approved && (
                                                                <div className='admin-table-actions ml-20px'>
                                                                    {!this.state.isUserFirmEdit && (
                                                                        <>
                                                                            <button
                                                                                onClick={this.editFirm}
                                                                                className='admin-table-btn ripple'>
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon" icon={faEdit}/>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="info-panel-section-title mb-2">
                                                            <div className='info-panel-title-text'>Account Type</div>
                                                        </div>

                                                        <div className={'d-flex align-items-center'}>
                                                            <div>
                                                                {!this.state.isUserAccountTypeEdit ? (
                                                                    <>
                                                                        {this.state.data?.user_id?.account_type ? this.state.data?.user_id?.account_type : '-'}</>
                                                                ) : (
                                                                    <>
                                                                        <Formik
                                                                            initialValues={this.state.formAccountTypeInitialValues}
                                                                            validationSchema={formAccountTypeSchema}
                                                                            onSubmit={this.handleAccountTypeSubmit}
                                                                        >
                                                                            {({
                                                                                  isSubmitting, setFieldValue, errors
                                                                              }) => {
                                                                                return (
                                                                                    <Form id={'firm-user'}
                                                                                          className={'edit-form-small align-items-start'}>
                                                                                        <div className="input">
                                                                                            <div
                                                                                                className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                                                                <Field
                                                                                                    name="account_type"
                                                                                                    id="account_type"
                                                                                                    as="select"
                                                                                                    className="b-select"
                                                                                                    disabled={isSubmitting}
                                                                                                    onChange={(e: any) => this.handleAccountTypeChange(e, setFieldValue)}
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
                                                                                                <p className={'mt-1'}>
                                                                                                    <span
                                                                                                        className={'fw-bold '}>
                                                                                                        Notice: {' '}
                                                                                                    </span>{
                                                                                                    getAccountTypeDescription((this.state.selectedAccountType || this.state.formAccountTypeInitialValues.account_type) as AccountType)}
                                                                                                </p>
                                                                                                <ErrorMessage
                                                                                                    name="account_type"
                                                                                                    component="div"
                                                                                                    className="error-message"/>
                                                                                            </div>
                                                                                        </div>
                                                                                        <>
                                                                                            <div
                                                                                                className='admin-table-actions ml-20px'>
                                                                                                <button
                                                                                                    type="submit"
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faCheck}/>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={this.editAccountType}
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faClose}/>
                                                                                                </button>
                                                                                            </div>
                                                                                        </>
                                                                                    </Form>
                                                                                );
                                                                            }}
                                                                        </Formik>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className='admin-table-actions ml-20px'>
                                                                {!this.state.isUserAccountTypeEdit && (
                                                                    <>
                                                                        <button
                                                                            onClick={this.editAccountType}
                                                                            className='admin-table-btn ripple'>
                                                                            <FontAwesomeIcon
                                                                                className="nav-icon" icon={faEdit}/>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="info-panel-section-title mb-2">
                                                            <div className='info-panel-title-text'>User Type</div>
                                                        </div>

                                                        <div className={'d-flex align-items-center'}>
                                                            <div>
                                                                {!this.state.isUserTypeEdit ? (
                                                                    <>
                                                                        {this.state.data?.user_id?.user_type ? this.state.data?.user_id?.user_type : '-'}</>
                                                                ) : (
                                                                    <>
                                                                        <Formik
                                                                            initialValues={this.state.formUserTypeInitialValues}
                                                                            validationSchema={formUserTypeSchema}
                                                                            onSubmit={this.handleUserTypeSubmit}
                                                                        >
                                                                            {({
                                                                                  isSubmitting, setFieldValue, errors
                                                                              }) => {
                                                                                return (
                                                                                    <Form id={'firm-user'}
                                                                                          className={'edit-form-small align-items-start'}>
                                                                                        <div className="input">
                                                                                            <div
                                                                                                className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                                                                <Field
                                                                                                    name="user_type"
                                                                                                    id="user_type"
                                                                                                    as="select"
                                                                                                    className="b-select"
                                                                                                    disabled={isSubmitting}
                                                                                                    onChange={(e: any) => this.handleUserTypeChange(e, setFieldValue)}
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
                                                                                        <>
                                                                                            <div
                                                                                                className='admin-table-actions ml-20px'>
                                                                                                <button
                                                                                                    type="submit"
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faCheck}/>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={this.editUserType}
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faClose}/>
                                                                                                </button>
                                                                                            </div>
                                                                                        </>
                                                                                    </Form>
                                                                                );
                                                                            }}
                                                                        </Formik>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className='admin-table-actions ml-20px'>
                                                                {!this.state.isUserTypeEdit && (
                                                                    <>
                                                                        <button
                                                                            onClick={this.editUserType}
                                                                            className='admin-table-btn ripple'>
                                                                            <FontAwesomeIcon
                                                                                className="nav-icon" icon={faEdit}/>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>

                                                    {this.state.data?.user_id?.customer_type && (
                                                        <div className="mb-3">
                                                            <div className="info-panel-section-title mb-2">
                                                                <div className='info-panel-title-text'>Customer</div>
                                                            </div>
                                                            <div className={'d-flex align-items-center'}>
                                                                <div>
                                                                    {!this.state.isUserCustomerTypeEdit ? (
                                                                        <>
                                                                            {this.state.data?.user_id?.customer_type ? getCustomerTypeName(this.state.data?.user_id?.customer_type as CustomerType) : '-'}</>
                                                                    ) : (
                                                                        <>
                                                                            <Formik
                                                                                initialValues={this.state.formCustomerTypeInitialValues}
                                                                                validationSchema={formCustomerTypeSchema}
                                                                                onSubmit={this.handleCustomerTypeSubmit}
                                                                            >
                                                                                {({
                                                                                      isSubmitting,
                                                                                      setFieldValue,
                                                                                      errors
                                                                                  }) => {
                                                                                    return (
                                                                                        <Form id={'firm-user'}
                                                                                              className={'edit-form-small align-items-start'}>
                                                                                            <div className="input">
                                                                                                <div
                                                                                                    className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                                                                    <Field
                                                                                                        name="customer_type"
                                                                                                        id="customer_type"
                                                                                                        as="select"
                                                                                                        className="b-select"
                                                                                                        disabled={isSubmitting}
                                                                                                        onChange={(e: any) => this.handleCustomerTypeChange(e, setFieldValue)}
                                                                                                    >
                                                                                                        <option
                                                                                                            value="">Select
                                                                                                            a Customer
                                                                                                        </option>
                                                                                                        {Object.values(CustomerType).map((type) => (
                                                                                                            <option
                                                                                                                key={type}
                                                                                                                value={type}>
                                                                                                                {getCustomerTypeName(type as CustomerType)}
                                                                                                            </option>
                                                                                                        ))}
                                                                                                    </Field>
                                                                                                    <ErrorMessage
                                                                                                        name="customer_type"
                                                                                                        component="div"
                                                                                                        className="error-message"/>
                                                                                                </div>
                                                                                            </div>
                                                                                            <>
                                                                                                <div
                                                                                                    className='admin-table-actions ml-20px'>
                                                                                                    <button
                                                                                                        type="submit"
                                                                                                        className='admin-table-btn ripple'>
                                                                                                        <FontAwesomeIcon
                                                                                                            className="nav-icon"
                                                                                                            icon={faCheck}/>
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={this.editCustomerType}
                                                                                                        className='admin-table-btn ripple'>
                                                                                                        <FontAwesomeIcon
                                                                                                            className="nav-icon"
                                                                                                            icon={faClose}/>
                                                                                                    </button>
                                                                                                </div>
                                                                                            </>
                                                                                        </Form>
                                                                                    );
                                                                                }}
                                                                            </Formik>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <div className='admin-table-actions ml-20px'>
                                                                    {!this.state.isUserCustomerTypeEdit ? (
                                                                        <>
                                                                            <button
                                                                                onClick={this.editCustomerType}
                                                                                className='admin-table-btn ripple'>
                                                                                <FontAwesomeIcon
                                                                                    className="nav-icon" icon={faEdit}/>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    )}


                                                    <div className="mb-3">
                                                        <div className="info-panel-section-title mb-2">
                                                            <div className='info-panel-title-text'>Data Feed Providers
                                                            </div>
                                                        </div>

                                                        <div className={'d-flex align-items-center'}>
                                                            <div>
                                                                {!this.state.isUserDataFeedProvidersEdit ? (
                                                                    <>{this.state.data?.user_id?.data_feed_providers.length ? this.state.data?.user_id?.data_feed_providers.join(', ') : '-'}</>
                                                                ) : (
                                                                    <>
                                                                        <Formik<any>
                                                                            initialValues={this.state.formDataFeedProvidersInitialValues}
                                                                            validationSchema={null}
                                                                            onSubmit={this.handleDataFeedProvidersSubmit}
                                                                        >
                                                                            {({
                                                                                  isSubmitting,
                                                                                  setFieldValue,
                                                                                  values,
                                                                                  errors
                                                                              }) => {
                                                                                return (
                                                                                    <Form id={'firm-user'}
                                                                                          className={'edit-form-small align-items-start'}>
                                                                                        <div className="input">
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
                                                                                                    isDisabled={isSubmitting}
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
                                                                                        <>
                                                                                            <div
                                                                                                className='admin-table-actions ml-20px'>
                                                                                                <button
                                                                                                    type="submit"
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faCheck}/>
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={this.editDataFeedProviders}
                                                                                                    className='admin-table-btn ripple'>
                                                                                                    <FontAwesomeIcon
                                                                                                        className="nav-icon"
                                                                                                        icon={faClose}/>
                                                                                                </button>
                                                                                            </div>
                                                                                        </>
                                                                                    </Form>
                                                                                );
                                                                            }}
                                                                        </Formik>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className='admin-table-actions ml-20px'>
                                                                {!this.state.isUserDataFeedProvidersEdit ? (
                                                                    <>
                                                                        <button
                                                                            onClick={this.editDataFeedProviders}
                                                                            className='admin-table-btn ripple'>
                                                                            <FontAwesomeIcon
                                                                                className="nav-icon" icon={faEdit}/>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>


                                                    <div className="mb-3">
                                                        <div className="info-panel-section-title mb-2">
                                                            <div className='info-panel-title-text'>Membership Form</div>
                                                        </div>
                                                        <div>
                                                            {this.state.data?.membership_form?.status ? (
                                                                <div
                                                                    className={`table__status table__status-${this.state.data?.membership_form?.status.toLowerCase()}`}>
                                                                    {this.state.data?.membership_form?.status.charAt(0).toUpperCase()}{this.state.data?.membership_form?.status.slice(1).toLowerCase()}
                                                                </div>
                                                            ) : (
                                                                <div>-</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*<UserBalancesBlock user_id={this.state.data?.user_id.email || ''}/>*/}
                                            </div>
                                            <div className="active-form d-none">
                                                <div className="active-form-text">Block all activity of the
                                                    user: {this.state.data?.user_id.is_blocked ? 'YES' : 'OFF'}</div>
                                                <div className="active-form-confirm">
                                                    {this.state.isConfirmedActivation ? (
                                                        <>
                                                            <div className='active-form-confirm-title mb-2'>Are you sure
                                                                you
                                                                want
                                                                to {this.state.isActivation ? 'unblock' : 'block'} the
                                                                user?
                                                            </div>
                                                            <button className={`b-btn ripple`} type="button"
                                                                    onClick={() => this.handleActivate(this.state.data)}>Confirm
                                                            </button>
                                                            <button className={`border-btn ripple`} type="button"
                                                                    onClick={() => this.setState({
                                                                        isConfirmedActivation: false,
                                                                        isActivation: null
                                                                    })}>Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {this.state.data?.user_id.is_blocked ? (
                                                                <button className="b-btn ripple" type="button"
                                                                        onClick={() => this.setState({
                                                                            isConfirmedActivation: true,
                                                                            isActivation: true
                                                                        })}>Unblock</button>
                                                            ) : (
                                                                <button className="border-btn ripple" type="button"
                                                                        onClick={() => this.setState({
                                                                            isConfirmedActivation: true,
                                                                            isActivation: false
                                                                        })}>Block the user</button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {this.state.errorMessages && (
                                                <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                            )}
                                            <div className="info-panel-block mt-5">
                                                <UserActivityLogsBlock user_id={this.state.data?.user_id.email || ''}/>
                                            </div>
                                        </>
                                    ) : (
                                        <NoDataBlock primaryText="No User available yet"/>
                                    )}


                                </>
                            )}
                        </div>
                    </>
                )
            case "delete":
                return ''
        }
    }
}

export default UserBlock;
