interface IAuthState {
    token: string | null;
    token_type: string | null;
    exp: number | null;
    iat: number | null;
    jti: string | null;
    user_id: string | null;
}
