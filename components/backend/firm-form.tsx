import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import {IFirm} from "@/interfaces/i-firm";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import adminIconService from "@/services/admin/admin-icon-service";
import {IBankTemplate} from "@/interfaces/i-bank-template";


const formSchema = Yup.object().shape({
    name: Yup.string().min(3).required('Required').label('Name'),
    is_member: Yup.boolean().label('DORRS Member'),
});

interface FirmFormState extends IState {
    formInitialValues: {},
    loading: boolean;
    isDeleting: boolean;
    isMember: boolean;
}

interface FirmFormProps extends ICallback {
    action: string;
    firmData: IFirm | null;
    bankData: IBankTemplate | null;
    onCancel?: () => void;
}

class FirmForm extends React.Component<FirmFormProps, FirmFormState> {

    state: FirmFormState;
    columnDefinition: any;
    columnValues: any;

    constructor(props: FirmFormProps) {
        super(props);

        const initialData = this.props.firmData || {} as IFirm;
        
        const initialValues: {
            name: string;
            is_member: boolean;
            bank: any
        } = {
            name: initialData?.name || this.props.firmData?.name || '',
            is_member: initialData?.is_member || false,
            bank: initialData?.bank ? initialData?.bank[0] : this.props.bankData?.columnValues || null
        };

        this.columnDefinition = this.props?.bankData?.columnDefinition || {};
        this.columnValues = initialValues.bank || {};

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isMember: initialValues.is_member,
            isDeleting: false,
        };
    }

    handleSubmit = async (values: IFirm, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});
        const request: Promise<any> = this.props.action == 'edit' ?
            adminService.updateFirm(this.props.firmData?.id || 0, values) :
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

    handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const isMember = e.target.value === 'false';
        setFieldValue("is_member", isMember);
        this.setState({isMember: isMember});
    };

    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
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

                                                <div className="input">
                                                    <div
                                                        className={`b-checkbox b-checkbox${(isSubmitting || this.isShow()) ? ' disable' : ''}`}>
                                                        <Field
                                                            type="checkbox"
                                                            name="is_member"
                                                            id="is_member"
                                                            disabled={isSubmitting || this.isShow()}
                                                            onClick={(e: any) => this.handleMemberChange(e, setFieldValue)}
                                                        />
                                                        <label htmlFor="is_member">
                                                            <span></span><i> DORRS Member
                                                        </i>
                                                        </label>
                                                        <ErrorMessage name="is_member" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                {this.state.isMember && (
                                                    <>
                                                        {Object.keys(this.columnDefinition).map((columnName) => (
                                                            <div key={columnName}>
                                                                {typeof this.columnValues[columnName] === "object" ? (
                                                                    <>
                                                                        <h5 className={'mb-24'}>{this.columnDefinition[columnName].title}</h5>
                                                                        {Object.keys(this.columnDefinition[columnName].properties).map((nestedPropertyName) => (

                                                                            <div key={nestedPropertyName}
                                                                                 className="input">
                                                                                <div
                                                                                    className="input__title">{this.columnDefinition[columnName].properties[nestedPropertyName]}</div>
                                                                                <div
                                                                                    className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                                                                    <Field
                                                                                        name={`bank.${columnName}.${nestedPropertyName}`}
                                                                                        id={`${columnName}.${nestedPropertyName}`}
                                                                                        type="text"
                                                                                        className="input__text input-class-3"
                                                                                        disabled={isSubmitting}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="input">
                                                                            <div
                                                                                className="input__title">{this.columnDefinition[columnName].title}</div>
                                                                            <div
                                                                                className={`input__wrap ${(isSubmitting) ? 'disable' : ''}`}>
                                                                                <Field
                                                                                    name={`bank.${columnName}`}
                                                                                    id={`${columnName}`}
                                                                                    type="text"
                                                                                    className="input__text input-class-3"
                                                                                    disabled={isSubmitting}

                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

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
            case 'view':
                return (
                    <div className="form-panel">
                        <div className='view-form user-view-form'>
                            <div className="view-form-box">
                                <div className="box__title">Approved</div>
                                <div className="box__wrap"><FontAwesomeIcon className="nav-icon"
                                                                            icon={adminIconService.iconBoolean(this.props.firmData?.is_approved || false)}/> {this.props.firmData?.is_approved ? 'Yes' : 'No'}
                                </div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Approved By</div>
                                <div
                                    className="box__wrap">{this.props.firmData?.approved_by || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Approved Date</div>
                                <div
                                    className="box__wrap">{formatterService.dateTimeFormat(this.props.firmData?.approved_date_time || '')}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Created Date</div>
                                <div
                                    className="box__wrap">{formatterService.dateTimeFormat(this.props.firmData?.created_at || '')}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">DORRS Member</div>
                                <div className="box__wrap"><FontAwesomeIcon className="nav-icon"
                                                                            icon={adminIconService.iconBoolean(this.props.firmData?.is_member || false)}/> {this.props.firmData?.is_member ? 'Yes' : 'No'}
                                </div>
                            </div>

                            {this.props.firmData?.is_member && (
                                <>
                                    {Object.keys(this.columnDefinition).map((columnName) => (
                                        <React.Fragment key={columnName}>
                                            {typeof this.columnValues[columnName] === "object" ? (
                                                <>
                                                    <h5 className={'w-100 my-0'}>{this.columnDefinition[columnName].title}</h5>

                                                    {Object.keys(this.columnDefinition[columnName].properties).map((nestedPropertyName) => (
                                                        <div key={nestedPropertyName}
                                                             className={'view-form-box'}>
                                                            <div
                                                                className={'box__title'}>{this.columnDefinition[columnName].properties[nestedPropertyName]}</div>
                                                            <div
                                                                className={'box__wrap'}>{this.columnValues[columnName][nestedPropertyName] || '-'}</div>
                                                        </div>
                                                    ))}</>

                                            ) : (
                                                <div className={'view-form-box'}>
                                                    <div
                                                        className={'box__title'}>{this.columnDefinition[columnName].title}</div>
                                                    <div
                                                        className={'box__wrap'}>{this.columnValues[columnName] || '-'}</div>
                                                </div>
                                            )}
                                        </React.Fragment>

                                    ))}</>
                            )}
                        </div>
                    </div>
                )
            case'delete'    :
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.firmData)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }

    }
}

export default FirmForm;
