interface IAuthContext {
    authState: IAuthState;
    setAuthState: (userAuthInfo: IUserAuthInfo) => void;
    isAuthenticated: () => boolean;
    clearAuthInfo: () => void;
}
