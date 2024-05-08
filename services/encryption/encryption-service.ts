import * as CryptoJS from 'crypto-js';

class EncryptionService {

    private key: string;

    constructor() {
        this.key = process.env.ENCRYPTION_KEY || ''
    }

    encrypt(data: any, key = this.key) {
        if (key === '') return data;
        try {
            const _key = CryptoJS.enc.Utf8.parse(key);
            const _iv = CryptoJS.enc.Utf8.parse(key.substr(0, 16));
            return CryptoJS.AES.encrypt(data, _key, {
                iv: _iv,
                mode: CryptoJS.mode.CBC,
            }).toString();
        } catch (e) {
            console.error(e);
            return data;
        }
    }

    decrypt(str:string, key = this.key) {
        try {
            const _key = CryptoJS.enc.Utf8.parse(key);
            const _iv = CryptoJS.enc.Utf8.parse(key.substr(0, 16));
            return CryptoJS.AES.decrypt(str, _key, {
                iv: _iv,
                mode: CryptoJS.mode.CBC,
            }).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error(e);
            return str;
        }
    }
}


const encryptionService = new EncryptionService();
export default encryptionService;
