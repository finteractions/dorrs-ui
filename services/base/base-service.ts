import cookieService from "../cookie/cookie-service";
import {AUTH_ADMIN_ACCESS_TOKEN, AUTH_USER_ACCESS_TOKEN, AUTH_USER_REFRESH_TOKEN} from "../../constants/settings";

export default class BaseService {

    protected getUserAccessToken(): string | undefined {
        return cookieService.getItem(AUTH_USER_ACCESS_TOKEN);
    }

    protected getUserRefreshToken(): string | undefined {
        return cookieService.getItem(AUTH_USER_REFRESH_TOKEN);
    }

    protected getAdminToken(): string | undefined {
        return cookieService.getItem(AUTH_ADMIN_ACCESS_TOKEN);
    }

}
