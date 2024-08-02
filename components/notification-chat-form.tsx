import React, {RefObject} from 'react';
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import formatterService from "@/services/formatter/formatter-service";
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {IUserDetail} from "@/interfaces/i-user-detail";
import Select from "react-select";
import notificationService from "@/services/notification/notification-service";

interface NotificationChatFormState extends IState {
    formInitialValues: {},
    loading: boolean;
    users: Array<IUserDetail>;
    messages: Array<INotificationChatMessageData>,
    dialogue_id: number | null
}

interface NotificationChatFormProps extends ICallback {
    isAdmin: boolean;
    action: string;
    data: INotificationChatMessage | null;
    onCancel?: () => void;
}

class NotificationChatForm extends React.Component<NotificationChatFormProps, NotificationChatFormState> {

    formSchema: Yup.ObjectSchema<any>;

    state: NotificationChatFormState;
    formRef: RefObject<any>;
    chatHistoryRef: RefObject<HTMLDivElement>;


    constructor(props: NotificationChatFormProps) {
        super(props);


        let messages = this.props.data?.messages || [];
        messages = messages.sort((a, b) => a.id - b.id)
        const dialogue_id = this.props.data?.dialogue_id || null;
        const formInitialValues = {
            message: '',
            dialogue_id: dialogue_id
        }
        this.state = {
            success: false,
            formInitialValues: formInitialValues,
            loading: false,
            users: [],
            messages: messages,
            dialogue_id: dialogue_id
        };

        this.formRef = React.createRef();
        this.chatHistoryRef = React.createRef()

        this.formSchema = Yup.object().shape({
            message: Yup.string().required('Required').label('Message'),
            dialogue_id: Yup.number().nullable(),
            users: dialogue_id ? Yup.array().of(Yup.number()) : Yup.array().of(Yup.number()).min(1, 'Required').required('Required')
        });

    }

    componentDidMount() {
        if (this.props.isAdmin && this.props.action === 'add') {
            this.setState({loading: true}, () => {
                this.getUsers();
            })
        } else {
            this.scroll();
        }
    }

    componentDidUpdate(prevProps: NotificationChatFormProps) {
        if (this.props.data !== prevProps.data) {
            const messages = this.props.data?.messages || [];
            const dialogue_id = this.props.data?.dialogue_id || null;

            this.setState({
                messages: messages.sort((a, b) => a.id - b.id),
                dialogue_id: dialogue_id
            }, () => {
                this.scroll();
            });
        }
    }

    scroll = () => {
        if (this.chatHistoryRef.current) {
            this.chatHistoryRef.current.scrollTop = this.chatHistoryRef.current.scrollHeight;
        }
    }
    getUsers = () => {
        adminService.getUsers()
            .then((res: IUserDetail[]) => {
                let data = res?.sort((a, b) => a.id - b.id) || [];
                data = data.filter(s => s.is_approved)

                data.forEach(s => {
                    s.name = `${s.user_id.first_name} ${s.user_id.last_name}`
                })
                this.setState({users: data});
            })
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            })
            .finally(() => {
                this.setState({loading: false})
            });
    }

    handleSubmit = async (values: any, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        setSubmitting(true)

        this.setState({errorMessages: null})

        const request: Promise<any> = this.props.isAdmin ?
            adminService.addNotification(values) :
            notificationService.addNotification(values)

        await request
            .then((async (res: any) => {
                await this.formRef.current.setFieldValue('message', '')
                await this.formRef.current.setFieldValue('users', [])

            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
                this.props.onCallback(this.props.data?.dialogue_id ? null : true)
            });
    };


    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
            case 'view':
                return (
                    <>

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <Formik<any>
                                    initialValues={this.state.formInitialValues}
                                    validationSchema={this.formSchema}
                                    onSubmit={this.handleSubmit}
                                    innerRef={this.formRef}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="company-profile-form" className={'chat'}>
                                                <div
                                                    className={`chat-history ${!this.props.isAdmin && this.props.action === 'add' ? 'p-0' : ''}`}>
                                                    {this.props.action === 'edit' && (
                                                        <>
                                                            {this.state.messages.length ? (
                                                                <div ref={this.chatHistoryRef}
                                                                     className={'chat-history-block conversation'}>
                                                                    <ul>
                                                                        {this.state.messages.map((item: INotificationChatMessageData, idx: number) => {
                                                                            const isAdmin = !this.props.isAdmin ? item.is_admin : !item.is_admin
                                                                            return (
                                                                                <React.Fragment key={idx}>
                                                                                    {isAdmin ? (
                                                                                        <li className="clearfix">
                                                                                            <div
                                                                                                className="message-data align-right">
                                                                                                <span
                                                                                                    className="message-data-time">{formatterService.dateTimeFormat(item.updated_at)}</span> &nbsp; &nbsp;
                                                                                                <span
                                                                                                    className="message-data-name">{item.sender}</span>
                                                                                                <i className="fa fa-circle me"></i>
                                                                                            </div>
                                                                                            <div
                                                                                                className="message other-message float-right"
                                                                                                dangerouslySetInnerHTML={{__html: item.message}}/>
                                                                                        </li>
                                                                                    ) : (
                                                                                        <li>
                                                                                            <div
                                                                                                className="message-data">
                                                                                                <span
                                                                                                    className="message-data-name"><i
                                                                                                    className="fa fa-circle online"></i>{item.sender}</span>
                                                                                                <span
                                                                                                    className="message-data-time">{formatterService.dateTimeFormat(item.updated_at)}</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="message my-message"
                                                                                                dangerouslySetInnerHTML={{__html: item.message}}/>
                                                                                        </li>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            )
                                                                        })}
                                                                    </ul>


                                                                </div>
                                                            ) : (
                                                                <>No messages</>
                                                            )}
                                                        </>

                                                    )}

                                                    {this.props.isAdmin && this.props.action === 'add' && (
                                                        <div className="input mb-0">
                                                            <div
                                                                className={`input__wrap ${isSubmitting ? 'disable' : ''}`}>
                                                                <Field
                                                                    name="users"
                                                                    id="users"
                                                                    as={Select}
                                                                    className={`b-select-search`}
                                                                    placeholder="Select Users"
                                                                    classNamePrefix="select__react"
                                                                    isMulti={true}
                                                                    isDisabled={isSubmitting}
                                                                    options={this.state.users.map((user) => ({
                                                                        value: user.user_id.id,
                                                                        label: `${user.name}`
                                                                    }))}
                                                                    onChange={(selectedOptions: any) => {
                                                                        const selectedValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                                                                        setFieldValue('users', selectedValues);
                                                                    }}
                                                                    value={(values.users || []).map((value: any) => ({
                                                                        value,
                                                                        label: this.state.users.find(user => user.user_id.id === value)?.name || value
                                                                    }))}
                                                                />
                                                                <ErrorMessage name="users"
                                                                              component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>


                                                <div className={'chat-message clearfix'}>
                                                    <div className="input">
                                                        <div className="input__title"></div>
                                                        <div className="input__wrap">
                                                            <Field
                                                                name="message"
                                                                id="message"
                                                                as="textarea"
                                                                rows="3"
                                                                className="input__textarea"
                                                                placeholder="Type a message"
                                                                disabled={isSubmitting}
                                                            />
                                                            <ErrorMessage name="message"
                                                                          component="div"
                                                                          className="error-message"/>
                                                        </div>
                                                    </div>

                                                    <Field
                                                        name="dialogue_id"
                                                        id="message"
                                                        type={'hidden'}
                                                    />


                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Send
                                                    </button>

                                                    {this.state.errorMessages && (
                                                        <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                    )}
                                                </div>

                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </>
                        )}
                    </>
                )
        }


    }
}

export default NotificationChatForm;
