import Cookies from 'js-cookie';

function getItem(key: string): string | undefined {
    return Cookies.get(key);
}

function setItem(key: string, value: string, options?: object): any {
    return Cookies.set(key, value, options || {});
}

function removeItem(key: string): any {
    return Cookies.remove(key);
}

const cookieService = {
    getItem,
    setItem,
    removeItem
}

export default cookieService;
