import { AxiosRequestConfig } from 'axios';

export const setAuthToken = (
  request: AxiosRequestConfig,
  token: string,
): AxiosRequestConfig => {
  if (request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error('Could not set authorization header of the request');
  }

  return request;
};
