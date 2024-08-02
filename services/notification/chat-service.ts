import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";

class ChatService extends BaseService {

    private PATH = 'chat/';

    constructor() {
        super();
    }

    public async getChat(): Promise<Array<INotificationChatMessage>> {
        return (await apiWebBackendService.get<IResponse<Array<INotificationChatMessage>>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }


    public addChat(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}list/`, data, {}, this.getUserAccessToken())
    }

    public markAsRead(): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}mark_as_read/`, {}, {}, this.getUserAccessToken())
    }


}

const chatService = new ChatService();

export default chatService;

