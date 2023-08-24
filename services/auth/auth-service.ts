import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import BaseService from "@/services/base/base-service";

class AuthService extends BaseService {

    private PATH = 'user_authentication/';

    constructor() {
        super();
    }

    public registration(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}register_user/`, data)
    }

    public setup2fa(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}scan_totp/`, data);
    }

    public verifyOtp(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}verify_totp/`, data);
    }

    public login(data: any): Promise<any> {
        return apiWebBackendService.post(`${this.PATH}user_login/`, data);
    }

    public createPasswordForgot(data: any): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}initiate_password_reset/`, data, {}, this.getUserAccessToken());
    }

    public createPasswordReset(data: any, token: string): Promise<IResponseApi> {
        return apiWebBackendService.post<IResponseApi>(`${this.PATH}reset_password/`, data, {token: token}, this.getUserAccessToken());
    }

    public async createWithdrawVerifyTotp(data: any): Promise<any> {
        return (await apiWebBackendService.post<IResponse<any>>(`${this.PATH}withdraw_verify_totp/`, data, {}, this.getUserAccessToken()));
    }

    public async createEmailStatus(): Promise<IEmailVerified> {
        return (await apiWebBackendService.post<IResponse<IEmailVerified>>(`${this.PATH}email_status/`, {}, {}, this.getUserAccessToken())).data;
    }

}

const authService = new AuthService();

export default authService;

