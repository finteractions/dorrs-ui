import React from "react";
import jwtService from "@/services/jwt/jwt-service";
import cookieService from "@/services/cookie/cookie-service";
import {AUTH_USER_ACCESS_TOKEN, AUTH_USER_REFRESH_TOKEN} from "@/constants/settings";

const AuthUserContext = React.createContext<any>(null);
const {Provider} = AuthUserContext;

const AuthUserProvider = ({children}: { children: React.ReactNode }) => {
    const [authState, setAuthState] = React.useState<IAuthState>({
        token: null,
        exp: null,
        iat: null,
        jti: null,
        token_type: null,
        user_id: null,
    });

    const setAuthInfo = (authInfo: IUserAuthInfo) => {
        const accessToken = authInfo.access_token;
        const refresh_token = authInfo?.refresh_token || '';
        const decoded = jwtService.decode(accessToken) as IAuthState;

        const user: IAuthState = {
            token: accessToken,
            exp: decoded.exp,
            iat: decoded.iat,
            jti: decoded.jti,
            token_type: decoded.token_type,
            user_id: decoded.user_id,
        };

        cookieService.setItem(AUTH_USER_ACCESS_TOKEN, accessToken, {
            expires: user.exp ? new Date(user.exp * 1000) : undefined
        });
        cookieService.setItem(AUTH_USER_REFRESH_TOKEN, refresh_token, {
            expires: user.exp ? new Date(user.exp * 1000) : undefined
        });
        setAuthState(user);
    };

    const clearAuthInfo = () => {
        cookieService.removeItem(AUTH_USER_ACCESS_TOKEN);
        cookieService.removeItem(AUTH_USER_REFRESH_TOKEN);
        setAuthState({
            token: null,
            exp: null,
            iat: null,
            jti: null,
            token_type: null,
            user_id: null,
        });
    };

    const isAuthenticated = (): boolean => {
        const accessToken = cookieService.getItem(AUTH_USER_ACCESS_TOKEN);
        if (accessToken) {
            const decoded = jwtService.decode(accessToken) as IAuthState;
            if (decoded.exp && new Date(decoded.exp * 1000) > new Date()) {
                return true;
            } else {
                clearAuthInfo();
            }
        }
        return false;
    };

    const accessTokenFromCookie = cookieService.getItem(AUTH_USER_ACCESS_TOKEN);
    const refreshTokenFromCookie = cookieService.getItem(AUTH_USER_REFRESH_TOKEN);

    React.useEffect(() => {
        if (accessTokenFromCookie && refreshTokenFromCookie) {
            setAuthInfo({access_token: accessTokenFromCookie, refresh_token: refreshTokenFromCookie});
        }
    }, [accessTokenFromCookie, refreshTokenFromCookie]);

    return (
        <Provider
            value={{
                authState,
                setAuthState: (authInfo: IUserAuthInfo) => setAuthInfo(authInfo),
                clearAuthInfo,
                isAuthenticated: isAuthenticated,
            }}
        >
            {children}
        </Provider>
    );
};

export {AuthUserContext, AuthUserProvider};
