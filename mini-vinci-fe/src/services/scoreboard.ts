import { AxiosRequestConfig } from 'axios';
import { Scoreboard, scoreboardFromResponse } from '../models/scoreboard';
import { setAuthToken } from '../utilities/request';
import api from './api';

export const getScoreboard = async (authToken: string): Promise<Scoreboard> => {
  let request: AxiosRequestConfig = {
    url: '/api/results/scoreboard',
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  return scoreboardFromResponse(response.data);
};
