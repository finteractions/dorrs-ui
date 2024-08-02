import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";

class NotificationService extends BaseService {

    private PATH = 'notification/';

    constructor() {
        super();
    }

    public async getNotification(): Promise<Array<INotificationChatMessage>> {
        return (await apiWebBackendService.get<IResponse<Array<INotificationChatMessage>>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }


    public addNotification(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}list/`, data, {}, this.getUserAccessToken())
    }

    public markAsReadNotification(): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}mark_as_read/`, {}, {}, this.getUserAccessToken())
    }


}

const notificationService = new NotificationService();

export default notificationService;

