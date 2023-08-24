import jwt from 'jsonwebtoken';

function decode(token: string): any {
    return jwt.decode(token);
}

function verify(expiredTime:number): any {
    return (expiredTime && new Date(expiredTime * 1000) > new Date())
}

const jwtService = {
    decode,
    verify
}

export default jwtService;
