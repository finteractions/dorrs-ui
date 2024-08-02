interface INotificationChatMessage {
    dialogue_id:number,
    messages: Array<INotificationChatMessageData>
}

interface INotificationChatMessageData {
    id: number;
    sender: string;
    recipient: string;
    message: string;
    dialogue: number;
    is_admin?: boolean;
    is_delivered?: boolean;
    created_at: string;
    updated_at: string;
}


