import { AxiosRequestConfig } from 'axios';
import { UserResult, userResultFromResponse } from '../models/results';
import { setAuthToken } from '../utilities/request';
import api from './api';

export const getResults = async (authToken: string): Promise<UserResult> => {
  let request: AxiosRequestConfig = {
    url: '/api/results/user',
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  return userResultFromResponse(response.data);
};
