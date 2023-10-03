import React, {createRef} from 'react';
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
import UserBalancesBlock from "@/components/backend/user-balances-block";
import UserImage from "@/components/user-image";
import Link from "next/link";
import NoDataBlock from "@/components/no-data-block";
import UserPermissionsBlock from "@/components/backend/user-permissions-block";


interface UserBlockState extends IState {
    mode: string;
    data: IUserDetail | null;
    isApproving: boolean | null;
    isConfirmedApproving: boolean;
    isActivation: boolean | null;
    isConfirmedActivation: boolean;
    loading: boolean;
    approved_by_user: IUser | null
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
            approved_by_user: null
        };
    }

    componentDidMount() {

        if (this.state.data?.approved_by) {
            this.setState({loading: true});
        } else {
            this.setState({approved_by_user: null, loading: true})
        }
        this.getUser(this.props.user_id);
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
                this.setState({data: res[0]});
                if (res[0].approved_by) {
                    this.getApprovedByUser(res[0].approved_by || 0);
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
                                                        <div className="box__title">Account Type</div>
                                                        <div
                                                            className="box__wrap">{this.state.data?.user_id.account_type || ''}</div>
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
                                                       <div>{this.state.data?.user_id?.firm?.name ? this.state.data?.user_id?.firm?.name : '-'}</div>
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
                                                <UserBalancesBlock user_id={this.state.data?.user_id.email || ''}/>
                                            </div>
                                            <div className="active-form">
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
