interface IWebsocketMessage<T> {
    type: string;
    data: T;
}
