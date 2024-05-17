import BaseService from "@/services/base/base-service";
import apiWebBackendService from "@/services/web-backend/web-backend-api-service";
import * as querystring from "querystring";

class DataFeedProvidersService extends BaseService {

    private PATH = 'data_feed_providers/';

    constructor() {
        super();
    }

    public async getLinks(): Promise<Array<ISettings>> {
        return (await apiWebBackendService.get<IResponse<Array<ISettings>>>(`${this.PATH}links/`, {}, this.getUserAccessToken())).data;
    }

    public async getList(): Promise<Array<IDataFeedProvider>> {
        return (await apiWebBackendService.get<IResponse<Array<IDataFeedProvider>>>(`${this.PATH}list/`, {}, this.getUserAccessToken())).data;
    }

    public async getStatistics(name?: string | null,): Promise<Array<IDataFeedProviderStatistics>> {
        let queryString = "";
        if (name) {
            queryString += `?name=${name}`;
        }
        return (await apiWebBackendService.get<IResponse<Array<IDataFeedProviderStatistics>>>(`${this.PATH}reporting/${queryString}`, {}, this.getUserAccessToken())).data;
    }

    public async getInfo(name:string): Promise<Array<IDataFeedProvider>> {
        return (await apiWebBackendService.get<IResponse<Array<IDataFeedProvider>>>(`${this.PATH}info/?name=${name}`, {}, this.getUserAccessToken())).data;
    }

    public async getHistory(name:string): Promise<Array<IDataFeedProviderHistory>> {
        return (await apiWebBackendService.get<IResponse<Array<IDataFeedProviderHistory>>>(`${this.PATH}history/?name=${name}`, {}, this.getUserAccessToken())).data;
    }
}

const dataFeedProvidersService = new DataFeedProvidersService();

export default dataFeedProvidersService;

