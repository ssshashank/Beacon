import { ContentType, HttpResponse } from "../constants/network";
import { errorDebug } from "../utils/error";
import AxiosAPI from "./axios";

interface HTTPServiceConfig {
    URL?: string;
    dataToSend?: object;
    skipAuth?: boolean;
    contentType?: string;
};

class HttpService {
    private _URL?: string;
    private _dataToSend?: object;
    private _skipAuth?: boolean;
    private _contentType?: string;

    constructor({
        URL,
        dataToSend,
        skipAuth = false,
        contentType = ContentType.JSON
    }: HTTPServiceConfig = {}) {
        this._URL = URL;
        this._dataToSend = dataToSend;
        this._skipAuth = skipAuth;
        this._contentType = contentType
    }

    /**
     * @Function SEND_POST_REQUEST()
     * @Methods axios.POST()
     * @Returns An Object
     */
    async sendPostRequest(): Promise<HttpResponse> {
        try {
            const response = await AxiosAPI.post(
                this._URL || '',
                this._dataToSend,
                {
                    skipAuth: this._skipAuth,
                    contentType: this._contentType
                }
            );

            return {
                statusCode: response?.status,
                responseBody: response?.data,
            };
        } catch (error: any) {
            throw errorDebug(
                error?.response,
                'httpCall.sendPostRequest()',
            );
        }
    }

    /**
   * @Function SEND_GET_REQUEST()
   * @Methods axios.GET()
   * @Returns An Object
   */
    async sendGetRequest(): Promise<HttpResponse> {
        try {
            const response = await AxiosAPI.get(
                this._URL || '',
                {
                    skipAuth: this._skipAuth,
                    contentType: this._contentType
                }
            );
            return {
                statusCode: response?.status,
                responseBody: response?.data,
            };
        } catch (error: any) {
            throw errorDebug(
                error?.response,
                'httpCall.sendGetRequest()',
            );
        }
    }

    /**
     * @Function SEND_PUT_REQUEST()
     * @Methods axios.PUT()
     * @Returns An Object
     */
    async sendPutRequest(): Promise<HttpResponse> {
        try {
            const response = await AxiosAPI.put(
                this._URL || '',
                this._dataToSend,
                {
                    skipAuth: this._skipAuth,
                    contentType: this._contentType
                }
            );
            return {
                statusCode: response.status,
                responseBody: response.data,
            };
        } catch (error: any) {
            throw errorDebug(
                error.response,
                'httpCall.sendPutRequest()',
            );
        }
    }

    /**
         * @Function SEND_PATCH_REQUEST()
         * @Methods axios.PATCH()
         * @Returns An Object
         */
    async sendPatchRequest(): Promise<HttpResponse> {
        try {
            const response = await AxiosAPI.patch(
                this._URL || '',
                this._dataToSend,
                {
                    skipAuth: this._skipAuth,
                    contentType: this._contentType
                }
            );
            return {
                statusCode: response.status,
                responseBody: response.data,
            };
        } catch (error: any) {
            throw errorDebug(
                error.response,
                'httpCall.sendPatchRequest()',
            );
        }
    }

    /**
    * @Function SEND_DELETE_REQUEST()
    * @Methods axios.DELETE()
    * @Returns An Object
    */
    async sendDeleteRequest(): Promise<HttpResponse> {
        try {
            const response = await AxiosAPI.delete(
                this._URL || '',
                {
                    skipAuth: this._skipAuth,
                    contentType: this._contentType
                }
            );
            return {
                statusCode: response.status,
                responseBody: response.data,
            };
        } catch (error: any) {
            throw errorDebug(
                error.response,
                'httpCall.sendDeleteRequest()',
            );
        }
    }
}

export {
    HttpService
}
