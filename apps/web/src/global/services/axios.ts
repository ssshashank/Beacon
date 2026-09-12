import axios from 'axios';
import { HTTPStatusCode } from '../constants/network';

declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
        contentType?: string;
    }
}

const AxiosAPI = axios.create({});

AxiosAPI.interceptors.request.use((config) => {
    if (config.contentType && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = config.contentType;
    } else if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // @ts-ignore:
    if (!config?.skipAuth) {
        // const token: string = useGlobalStore.getState().userDetails?.token as string;
        // if (token) config.headers['Authorization'] = token;
    }

    return config;
}, (error) => Promise.reject(error));

AxiosAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === HTTPStatusCode.UNAUTHORIZED || error.response?.status === HTTPStatusCode.FORBIDDEN) {
            // useGlobalStore.getState().clearAuth();
        }

        return Promise.reject(error);
    }
);

export default AxiosAPI;
