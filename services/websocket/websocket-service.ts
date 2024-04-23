import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import BaseService from "@/services/base/base-service";
import {WebsocketEvent} from "@/interfaces/websocket/websocket-event";

class WebSocketService extends BaseService {
    public socket: WebSocket | null = null;
    private readonly url: string = process.env.WEBSOCKET_API_URL || '';
    private isOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public isOpen: Observable<boolean> = this.isOpenSubject.asObservable();
    private messagesSubject = new Subject();
    private reconnect = true;

    constructor() {
        super();
    }

    public initWebSocket(): void {
        if (!this.socket && !this.isOpenSubject.value) {
            this.reconnect = true;
            this.connect();
        }
    }

    private connect(): void {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 5000;

        const connect = () => {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.isOpenSubject.next(true);
                attempts = 0;
            };
            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.messagesSubject.next(message);
            };
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.socket = null;
                this.isOpenSubject.next(false);

                if (this.reconnect && attempts < maxAttempts) {
                    attempts++;
                    setTimeout(connect, interval);
                }
            };
            this.socket.onerror = (event) => {
                console.error('WebSocket error:', event);
            }
        };

        connect();
    }

    public closeWebSocket(reconnect: boolean = true): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isOpenSubject.next(false);
            this.reconnect = reconnect;
        }
    }

    public subscribeOnDepthOfBook(symbol: string): void {
        const message = {
            type: WebsocketEvent.SUBSRIBE_DEPTH,
            symbol: symbol
        }
        this.sendMessage(message)
    }

    public unSubscribeOnDepthOfBook(symbol: string): void {
        const message = {
            type: WebsocketEvent.UNSUBSCRIBE_DEPTH,
            symbol: symbol
        }

        this.sendMessage(message)
    }

    public on<T>(event: string): Observable<T> {
        if (event) {
            return this.messagesSubject.asObservable().pipe(
                filter((message: any): message is IWebsocketMessage<T> => message.type === event),
                map((message: IWebsocketMessage<T>): T => message.data)
            );
        }
        return new Observable<T>();
    }

    public sendMessage(message: any): void {
        if (this.socket && this.isOpen) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }


}

const websocketService = new WebSocketService();
export default websocketService;
