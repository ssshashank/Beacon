import { HTTPMethod, HTTPMethodType } from "../constants/network";
import { HttpService } from "./base";

interface ApiFactoryOptions {
    method: HTTPMethodType;
    url: string;
    data?: any;
};

interface ApiFactoryConfig {
    skipAuth?: boolean;
    contentType?: string;
}

class ApiFactory {
    static async request<T = any>({ method, url, data }: ApiFactoryOptions, config: ApiFactoryConfig): Promise<T> {
        const httpService = new HttpService({
            URL: url,
            ...(data && { dataToSend: data }),
            skipAuth: config?.skipAuth,
            contentType: config?.contentType
        });

        try {
            if (method === HTTPMethod.POST) {
                return await httpService.sendPostRequest() as T;
            } else if (method === HTTPMethod.GET) {
                return await httpService.sendGetRequest() as T;
            } else if (method === HTTPMethod.PUT) {
                return await httpService.sendPutRequest() as T;
            } else if (method === HTTPMethod.PATCH) {
                return await httpService.sendPatchRequest() as T;
            } else if (method === HTTPMethod.DELETE) {
                return await httpService.sendDeleteRequest() as T;
            } else return null as T;
        } catch (error: any) {
            throw {
                responseBody: error?.['responseBody'],
                statusCode: error?.['statusCode'],
            };
        }
    }

    static post<T = any>(url: string, data: any, configParams?: ApiFactoryConfig) {
        return ApiFactory.request<T>({ method: 'POST', url, data }, configParams!);
    }

    static get<T = any>(url: string, configParams?: ApiFactoryConfig) {
        return ApiFactory.request<T>({ method: 'GET', url }, configParams!);
    }

    static put<T = any>(url: string, configParams?: ApiFactoryConfig) {
        return ApiFactory.request<T>({ method: 'PUT', url }, configParams!);
    }

    static patch<T = any>(url: string, data: any, configParams?: ApiFactoryConfig) {
        return ApiFactory.request<T>({ method: 'PATCH', url, data }, configParams!);
    }

    static delete<T = any>(url: string, configParams?: ApiFactoryConfig) {
        return ApiFactory.request<T>({ method: 'DELETE', url }, configParams!);
    }
}

export {
    ApiFactory
}
