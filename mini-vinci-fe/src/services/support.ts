import { AxiosRequestConfig } from 'axios';
import { isArray } from 'lodash';
import { setAuthToken } from '../utilities/request';
import { SupportMessage, supportMessageFromResponse } from '../models/support';
import api from './api';

const supportEndpoint = '/api/support';

export const getSupportHistory = async (
  authToken: string,
): Promise<SupportMessage[]> => {
  let request: AxiosRequestConfig = {
    url: supportEndpoint,
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  if (!isArray(response?.data?.history)) {
    throw new Error('Unexpected error: response contains no "history" list');
  }

  return response.data.history.map((history: any) =>
    supportMessageFromResponse(history),
  );
};

export const sendMessage = async (
  message: string,
  authToken: string,
): Promise<void> => {
  let request: AxiosRequestConfig = {
    url: supportEndpoint,
    method: 'post',
    headers: {},
    data: { message },
  };

  request = setAuthToken(request, authToken);

  await api(request);
};
