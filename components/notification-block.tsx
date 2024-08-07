import React from 'react';
import {Button, Dropdown, NavItem} from "react-bootstrap";
import Modal from "@/components/modal";
import NotificationChatForm from "@/components/notification-chat-form";
import adminService from "@/services/admin/admin-service";
import LoaderBlock from "@/components/loader-block";
import notificationService from "@/services/notification/notification-service";
import {Subscription} from "rxjs";
import websocketService from "@/services/websocket/websocket-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";
import formatterService from "@/services/formatter/formatter-service";
import {IUserDetail} from "@/interfaces/i-user-detail";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";

interface NotificationBockProps {
    isAdmin: boolean
}

interface NotificationBockState extends IState, IModalState {
    formAction: string;
    messages: Array<INotificationChatMessage>,
    message: INotificationChatMessage | null
    loading: boolean;
    unreadCount: number;
}

class NotificationBlock extends React.Component<NotificationBockProps, NotificationBockState> {

    state: NotificationBockState;

    private websocketSubscription: Subscription | null = null;
    private userNotification: Subscription | null = null;
    private adminNotification: Subscription | null = null;

    constructor(props: NotificationBockProps) {
        super(props);

        this.state = {
            success: false,
            isOpenModal: false,
            formAction: '',
            messages: [],
            message: null,
            loading: false,
            unreadCount: 0
        }
    }

    modal = (action = '', message: INotificationChatMessage | null) => {
        const sidebar = document.querySelector('.sidebar')
        if (sidebar) {
            if (!this.state.isOpenModal) {
                sidebar.classList.add('z-index-0')
            } else {
                sidebar.classList.remove('z-index-0')
            }
        }
        this.setState({
            isOpenModal: !this.state.isOpenModal,
            formAction: action,
            message: action === 'add' ? message : null
        })
    }

    onCallback = async (value: any) => {
        if (value) {
            this.modal('', null)
        }

        await this.reInit();
    }

    reInit = () => {
        return new Promise(resolve => {
            if (this.state.message) {
                let message: INotificationChatMessage;
                if (this.state.message.user_id) {
                    const user_id = this.state.message.user_id

                    const messages = this.state.messages
                        .flatMap(r => r.messages)
                        .filter(s => s.recipient_id === user_id)

                    message = this.state.message;
                    message.messages = messages
                } else {
                    message = this.state.messages.filter(s => s.dialogue_id === this.state.message!.dialogue_id)[0]
                }

                if (message) this.setState({message: message})
            }
            let unread = 0;
            this.state.messages.map((item: INotificationChatMessage, idx: number) => {
                if (this.props.isAdmin) {
                    unread += item.messages.filter(s => !s.is_admin && !s.is_delivered).length
                } else {
                    unread += item.messages.filter(s => s.is_admin && !s.is_delivered).length
                }
            })

            this.setState({unreadCount: unread}, () => {
                resolve(true)
            })
        })

    }

    componentDidMount() {
        this.setState({loading: true}, async () => {
            await this.getChat()
                .then(() => this.subscriptions())
        });
        window.addEventListener('notifyUser', this.notifyUser as EventListener);
    }

    componentWillUnmount() {
        this.unsubscribe();
        window.removeEventListener('notifyUser', this.notifyUser as EventListener);
    }

    notifyUser = (event: CustomEvent) => {
        const user: IUserDetail = event.detail as IUserDetail;
        const user_id = user.user_id.id;

        const messages = this.state.messages
            .flatMap(r => r.messages)
            .filter(s => s.recipient_id === user_id)

        const message: INotificationChatMessage = {
            user_id: user_id,
            messages: messages
        }

        this.modal('add', message)
    }

    subscribe() {
        this.props.isAdmin ? websocketService.subscribeOnAdminNotification() : websocketService.subscribeOnUserNotification();
    }

    unsubscribe() {
        this.props.isAdmin ? websocketService.unSubscribeOnAdminNotification() : websocketService.unSubscribeOnUserNotification();
        this.websocketSubscription?.unsubscribe();
        this.userNotification?.unsubscribe();
        this.adminNotification?.unsubscribe();
    }

    subscriptions(): void {
        this.websocketSubscription = websocketService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) this.subscribe();
        });

        this.userNotification = websocketService.on<Array<INotificationChatMessage>>(WebsocketEvent.NOTIFICATION).subscribe((data: Array<INotificationChatMessage>) => {
            this.setState({messages: data}, this.reInit)
        });
        this.userNotification = websocketService.on<Array<INotificationChatMessage>>(WebsocketEvent.NOTIFICATION_ADMIN).subscribe((data: Array<INotificationChatMessage>) => {
            this.setState({messages: data}, this.reInit)
        });

    }

    getChat = async () => {
        this.props.isAdmin ? await this.getAdminNotification() : await this.getUserNotification();
    }

    getAdminNotification = (): Promise<boolean> => {
        return new Promise(resolve => {
            adminService.getNotification()
                .then((res: INotificationChatMessage[]) => {
                    let data = res || []
                    this.setState({messages: data}, async () => {
                        await this.reInit()
                    });
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                })
                .finally(() => {
                    this.setState({loading: false})
                    resolve(true)
                });
        })
    }

    getUserNotification = (): Promise<boolean> => {
        return new Promise(resolve => {
            notificationService.getNotification()
                .then((res: INotificationChatMessage[]) => {
                    let data = res || []
                    this.setState({messages: data}, async () => {
                        await this.reInit()
                    });
                })
                .catch((errors: IError) => {
                    this.setState({errorMessages: errors.messages});
                })
                .finally(() => {
                    this.setState({loading: false})
                    resolve(true)
                });
        })
    }

    markAsRead = async () => {
        if (this.props.isAdmin && this.state.unreadCount > 0) {
            await adminService.markAsReadNotification()
        } else if (!this.props.isAdmin && this.state.unreadCount > 0) {
            await notificationService.markAsReadNotification()
        }
    }


    render() {
        return (
            <>
                <Dropdown as={NavItem} onClick={this.markAsRead}>
                    <Dropdown.Toggle variant="link" bsPrefix="hide-caret" className="py-0 px-2 rounded-0"
                                     id="dropdown-profile"

                    >
                        <div className={`portal-navbar-widget event ${this.state.unreadCount > 0 ? 'unread' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3"
                                      d="M12 22C13.6569 22 15 20.6569 15 19C15 17.3431 13.6569 16 12 16C10.3431 16 9 17.3431 9 19C9 20.6569 10.3431 22 12 22Z"
                                      fill="#718494"/>
                                <path
                                    d="M19 15V18C19 18.6 18.6 19 18 19H6C5.4 19 5 18.6 5 18V15C6.1 15 7 14.1 7 13V10C7 7.6 8.7 5.6 11 5.1V3C11 2.4 11.4 2 12 2C12.6 2 13 2.4 13 3V5.1C15.3 5.6 17 7.6 17 10V13C17 14.1 17.9 15 19 15ZM11 10C11 9.4 11.4 9 12 9C12.6 9 13 8.6 13 8C13 7.4 12.6 7 12 7C10.3 7 9 8.3 9 10C9 10.6 9.4 11 10 11C10.6 11 11 10.6 11 10Z"
                                    fill="#718494"/>
                            </svg>
                        </div>

                    </Dropdown.Toggle>
                    <Dropdown.Menu className="pt-0 notification-block">
                        <Dropdown.Header className="bg-light fw-bold rounded-top">Notifications</Dropdown.Header>

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <div className={'notification-list chat'}>
                                    {this.state.messages.length ? (
                                        <>
                                            {this.state.messages.slice(0, 10).map((item: INotificationChatMessage, idx: number) => {
                                                const itm = item.messages.sort((a, b) => b.id - a.id)[0]
                                                const isAdmin = !this.props.isAdmin ? itm.is_admin : !itm.is_admin;
                                                const from = isAdmin && !this.props.isAdmin ? 'Admin' : itm.sender
                                                return (
                                                    <React.Fragment key={idx}>
                                                        <div className={'chat-history m-0 '} key={idx}
                                                             // onClick={() => this.modal('edit', item)}
                                                        >
                                                            {isAdmin ? (
                                                                <div className="clearfix">
                                                                    <div className="message-data align-right">
                                                                    <span className="message-data-time">
                                                                        {formatterService.dateTimeFormat(itm.created_at)}
                                                                    </span> &nbsp; &nbsp;
                                                                        <span
                                                                            className="message-data-name">
                                                                        {from}
                                                                    </span>
                                                                        <i className="fa fa-circle me"></i>
                                                                    </div>
                                                                    <div
                                                                        className="text-colour message other-message float-right mb-0">
                                                                        <span
                                                                            dangerouslySetInnerHTML={{__html: itm.message}}></span>
                                                                        {itm.is_delivered && (
                                                                            <span
                                                                                className={'seen'}>
                                                                                                        <FontAwesomeIcon
                                                                                                            size="xs"
                                                                                                            icon={faEye}/> {' '}
                                                                                {formatterService.dateTimeFormat(itm.updated_at)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <div className="message-data">
                                                                <span className="message-data-name">
                                                                    <i className="fa fa-circle online"></i>
                                                                    {from}
                                                                </span>
                                                                        <span className="message-data-time">
                                                                    {formatterService.dateTimeFormat(itm.created_at)}
                                                                </span>
                                                                    </div>
                                                                    <div
                                                                        className="text-colour message my-message mb-0">
                                                                        <span
                                                                            dangerouslySetInnerHTML={{__html: itm.message}}></span>
                                                                        {itm.is_delivered && (
                                                                            <span
                                                                                className={'seen'}>
                                                                                                        <FontAwesomeIcon
                                                                                                            size="xs"
                                                                                                            icon={faEye}/> {' '}
                                                                                {formatterService.dateTimeFormat(itm.updated_at)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {idx < this.state.messages.length - 1 && <Dropdown.Divider/>}
                                                    </React.Fragment>

                                                )
                                            })}
                                        </>
                                    ) : (
                                        <div className={'px-3 text-colour'}>No notifications</div>
                                    )}
                                </div>


                                {this.props.isAdmin && (
                                    <>
                                        <Dropdown.Divider/>
                                        <div className={'justify-content-center d-flex'}>
                                            <Button className={' b-btn ripple'}
                                                    onClick={() => this.modal('add', null)}>Create</Button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                    </Dropdown.Menu>
                </Dropdown>

                <Modal isOpen={this.state.isOpenModal}
                       onClose={() => this.modal('', null)}
                       title={'Notification'}
                       className={''}
                >

                    <NotificationChatForm isAdmin={this.props.isAdmin}
                                          action={this.state.formAction}
                                          data={this.state.message}
                                          onCallback={this.onCallback}
                    />
                </Modal>
            </>
        )
    }
}

export default NotificationBlock;
