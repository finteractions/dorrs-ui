import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";
import {IUserProfile} from "@/interfaces/i-user-profile";

class UserService extends BaseService {

    private PATH = 'user_authentication/';

    constructor() {
        super();
    }

    public async getUserProfile(): Promise<IUserProfile> {
        return (await apiWebBackendService.get<IResponse<IUserProfile>>(`${this.PATH}user_profile/`, {}, this.getUserAccessToken())).data;
    }

    public async updateUserProfile(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}user_profile/`, data, {}, this.getUserAccessToken()));
    }

    public async createChangePassword(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}change_password/`, data, {}, this.getUserAccessToken()));
    }

    public async createEmailVerification(data: any): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}email_verify_initiate/`, data, {}, this.getUserAccessToken()));
    }

    public async createEmailConfirmation(token: string): Promise<IResponseApi> {
        return (await apiWebBackendService.get<IResponseApi>(`${this.PATH}email_verify/`, {token: token}));
    }

    public async logout(): Promise<IResponseApi> {
        return (await apiWebBackendService.post<IResponseApi>(`${this.PATH}user_logout/`, {refresh_token: this.getUserRefreshToken()}, {}, this.getUserAccessToken()));
    }

}

const userService = new UserService();

export default userService;
