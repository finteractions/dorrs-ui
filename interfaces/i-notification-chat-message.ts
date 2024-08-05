interface INotificationChatMessage {
    dialogue_id?: number,
    user_id?: number,
    messages: Array<INotificationChatMessageData>
}

interface INotificationChatMessageData {
    id: number;
    sender: string;
    sender_id?: number;
    recipient: string;
    recipient_id?: number;
    message: string;
    dialogue: number;
    is_admin?: boolean;
    is_delivered?: boolean;
    created_at: string;
    updated_at: string;
}


