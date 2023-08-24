import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {AUTH_USER_ACCESS_TOKEN, AUTH_USER_REFRESH_TOKEN} from "@/constants/settings";
import cookieService from "@/services/cookie/cookie-service";

interface ApiOptions {
    baseURL: string;
}

class ApiService {
    private http: AxiosInstance;

    constructor(options: ApiOptions) {
        this.http = axios.create({
            baseURL: options.baseURL,
        });
    }

    async get<T>(url: string, params?: Record<string, unknown>, token?: string): Promise<T> {
        const headers = this.getHeaders(token);
        const response: AxiosResponse<T> = await this.http.get(url, {
            headers,
            params
        }).catch((error: AxiosError) => this.handleError(error));

        return response.data;
    }

    async post<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string,): Promise<T> {
        const headers = this.getHeaders(token);
        const response: AxiosResponse<T> = await this.http.post(url, data, {
            headers,
            params
        }).catch((error: AxiosError) => this.handleError(error));

        return response.data;
    }

    async put<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string,): Promise<T> {
        const headers = this.getHeaders(token);
        const response: AxiosResponse<T> = await this.http.put(url, data, {
            headers,
            params
        }).catch((error: AxiosError) => this.handleError(error));

        return response.data;
    }

    async delete<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string): Promise<T> {
        const headers = this.getHeaders(token);
        const response: AxiosResponse<T> = await this.http.delete(url, {
            headers,
            params
        }).catch((error: AxiosError) => this.handleError(error));

        return response.data;
    }

    private getHeaders(token?: string): {} {
        return token ? {Authorization: `Bearer ${token}`} : {};
    }

    private handleError(error: AxiosError): never {
        const errorMessages: string[] = [];

        if (error.response?.data && error.response?.status !== 500) {
            if (error.response?.status === 413) {
                errorMessages.push(error.response?.statusText);
            } else if (error.response?.status === 401) {
                errorMessages.push((error.response?.data as { detail: string })?.detail || 'Unauthorized');
                cookieService.removeItem(AUTH_USER_ACCESS_TOKEN);
                cookieService.removeItem(AUTH_USER_REFRESH_TOKEN);
                localStorage.clear();
            } else if ((error.response?.data as { messages: Array<{ message: string }> })?.messages) {
                errorMessages.push(...(error.response?.data as { messages: Array<{ message: string }> })?.messages.map(s => s.message));
            } else if ((error.response?.data as { message: string })?.message) {
                errorMessages.push((error.response?.data as { message: string })?.message);
            } else if (typeof error.response?.data === "string") {
                 errorMessages.push(error.response?.data);
            } else if ((error.response?.data as { [key: string]: Array<string> })) {
                errorMessages.push(...(Object.entries((error.response?.data as { [key: string]: Array<string> })).flatMap(([key, errorArray]) => {
                    return errorArray.map(errorMessage => `${key}: ${errorMessage.replace(/"/g, '')}`);
                })));
            } else if ((error.response?.data as { detail: string })?.detail) {
                errorMessages.push((error.response?.data as { detail: string })?.detail);
            }
        }

        if (!errorMessages.length) errorMessages.push(error.message);
        const err = new class implements IError {
            messages = errorMessages;
            values = error?.response?.data
        }
        throw err;
    }

}

export default ApiService;
