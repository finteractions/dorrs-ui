interface IResponseApi {
    code: number;
    message: string;
}

interface IResponse<T> extends IResponseApi {
    data: T;
    results: T;
    count: number;
}
