interface ITokenState {
    pk: number;
    expired_time: number;
    otp: number;
    is_email_changing?: boolean;
    is_old_email?: boolean;
    is_new_email?: boolean;
    email?: string;

}
