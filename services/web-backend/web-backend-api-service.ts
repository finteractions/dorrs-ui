import ApiService from "@/services/api/api-service";

const apiWebBackendService = new ApiService({ baseURL: 'backend/api/v1/' || '' });

export default apiWebBackendService;
