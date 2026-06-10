import { AxiosRequestConfig } from 'axios';
import { isArray } from 'lodash';
import { Problem, problemFromResponse } from '../models/problem';
import { setAuthToken } from '../utilities/request';
import api from './api';

export const getProblems = async (authToken: string): Promise<Problem[]> => {
  let request: AxiosRequestConfig = {
    url: '/api/problems',
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);

  const problemsList = response?.data?.problems;
  if (!isArray(problemsList)) {
    throw new Error('Unexpected error: Response contains no "problems" list');
  }

  return problemsList.map((problem: any) => problemFromResponse(problem));
};
