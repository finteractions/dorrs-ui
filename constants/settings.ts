export const AUTH_USER_ACCESS_TOKEN = `${process.env.TOKEN_NAME}AccessToken`;
export const AUTH_USER_REFRESH_TOKEN = `${process.env.TOKEN_NAME}RefreshToken`;
export const AUTH_ADMIN_ACCESS_TOKEN = `${process.env.TOKEN_NAME}AdminAccessToken`;
export const G_AUTH_ISSUER = (process.env.TOKEN_NAME || 'issuer').toUpperCase();
export const AGREEMENT = 'Client-Agreement.pdf';
export const TERMS_OF_SERVICE = 'Terms-of-Service.pdf';
export const PRIVACY_POLICY = 'Privacy-Policy.pdf';
