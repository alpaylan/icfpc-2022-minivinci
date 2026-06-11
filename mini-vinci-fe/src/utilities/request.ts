import { AxiosRequestConfig } from 'axios';

export const setAuthToken = (
  request: AxiosRequestConfig,
  token: string | null,
): AxiosRequestConfig => {
  // Guests have no token; public endpoints work without an Authorization header.
  if (!token) {
    return request;
  }

  if (request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error('Could not set authorization header of the request');
  }

  return request;
};
