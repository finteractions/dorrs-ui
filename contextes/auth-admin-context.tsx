import React from "react";
import jwtService from "@/services/jwt/jwt-service";
import cookieService from "@/services/cookie/cookie-service";
import {AUTH_ADMIN_ACCESS_TOKEN} from "@/constants/settings";

const AuthAdminContext = React.createContext<any>(null);
const {Provider} = AuthAdminContext;

const AuthAdminProvider = ({children}: { children: React.ReactNode }) => {
    const [authState, setAuthState] = React.useState<IAuthState>({
        token: null,
        exp: null,
        iat: null,
        jti: null,
        token_type: null,
        user_id: null,
    });

    const setAuthInfo = (authInfo: IAdminAuthInfo) => {
        const accessToken = authInfo.access_token;
        const decoded = jwtService.decode(accessToken) as IAuthState;

        const user: IAuthState = {
            token: accessToken,
            exp: decoded.exp,
            iat: decoded.iat,
            jti: decoded.jti,
            token_type: decoded.token_type,
            user_id: decoded.user_id,
        };

        cookieService.setItem(AUTH_ADMIN_ACCESS_TOKEN, accessToken, {
            expires: user.exp ? new Date(user.exp * 1000) : undefined
        });
        setAuthState(user);
    };

    const clearAuthInfo = () => {
        cookieService.removeItem(AUTH_ADMIN_ACCESS_TOKEN);
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
        const accessToken = cookieService.getItem(AUTH_ADMIN_ACCESS_TOKEN);
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

    const accessTokenFromCookie = cookieService.getItem(AUTH_ADMIN_ACCESS_TOKEN);

    React.useEffect(() => {
        if (accessTokenFromCookie) {
            setAuthInfo({access_token: accessTokenFromCookie});
        }
    }, [accessTokenFromCookie]);

    return (
        <Provider
            value={{
                authState,
                setAuthState: (authInfo: IAdminAuthInfo) => setAuthInfo(authInfo),
                clearAuthInfo,
                isAuthenticated: isAuthenticated,
            }}
        >
            {children}
        </Provider>
    );
};

export {AuthAdminContext, AuthAdminProvider};
