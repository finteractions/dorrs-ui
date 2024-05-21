import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {AUTH_USER_ACCESS_TOKEN, AUTH_USER_REFRESH_TOKEN} from "@/constants/settings";
import cookieService from "@/services/cookie/cookie-service";
import encryptionService from "@/services/encryption/encryption-service";

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

        try {
            const response: AxiosResponse<T> = await this.http.get(url, {
                headers,
                params
            });

            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 404) {
                    return {} as Partial<T> as T;
                } else {
                    this.handleError(error);
                    throw error;
                }
            }

            throw error;
        }
    }


    async post<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string,): Promise<T> {
        const headers = this.getHeaders(token);
        data = this.encode(data)

        try {
            const response: AxiosResponse<T> = await this.http.post(url, data, {
                headers,
                params
            })

            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 404) {
                    return {} as Partial<T> as T;
                } else {
                    this.handleError(error);
                    throw error;
                }
            }

            throw error;
        }

    }

    async put<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string,): Promise<T> {
        const headers = this.getHeaders(token);

        data = this.encode(data)

        try {
            const response: AxiosResponse<T> = await this.http.put(url, data, {
                headers,
                params
            })

            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 404) {
                    return {} as Partial<T> as T;
                } else {
                    this.handleError(error);
                    throw error;
                }
            }

            throw error;
        }
    }

    async delete<T>(url: string, data: Record<string, unknown>, params?: Record<string, unknown>, token?: string): Promise<T> {
        const headers = this.getHeaders(token);

        try {
            const response: AxiosResponse<T> = await this.http.delete(url, {
                headers,
                params
            })

            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 404) {
                    return {} as Partial<T> as T;
                } else {
                    this.handleError(error);
                    throw error; // Перебрасываем ошибку для обработки других кодов ответа
                }
            }

            throw error;
        }
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
                errorMessages.push(...(error.response?.data as {
                    messages: Array<{ message: string }>
                })?.messages.map(s => s.message));
            } else if ((error.response?.data as { message: string })?.message) {
                errorMessages.push((error.response?.data as { message: string })?.message);
            } else if (typeof error.response?.data === "string") {
                errorMessages.push(error.response?.data);
            } else if ((error.response?.data as { [key: string]: Array<string> })) {
                errorMessages.push(...(Object.entries((error.response?.data as {
                    [key: string]: Array<string>
                })).flatMap(([key, errorArray]) => {
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

    private encode(data: any) {

        if (data instanceof FormData) {
            return data;
        }

        const passwords = ['password', 'password1', 'password2', 'new_password', 'confirm_password', 'old_password'];
        const encryptedData = {...data};

        for (const key in encryptedData) {
            if (passwords.includes(key)) {
                encryptedData[key] = encryptionService.encrypt(encryptedData[key]);
            }

        }
        console.log(encryptedData)
        return encryptedData;

    }

}

export default ApiService;
