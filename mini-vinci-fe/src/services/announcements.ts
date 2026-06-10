import { AxiosRequestConfig } from 'axios';
import { isArray } from 'lodash';
import { Announcement, announcementFromResponse } from '../models/announcement';
import { setAuthToken } from '../utilities/request';
import api from './api';

export const getAnnouncements = async (
  authToken: string,
): Promise<Announcement[]> => {
  let request: AxiosRequestConfig = {
    url: '/api/announcements',
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  if (!isArray(response?.data?.announcements)) {
    throw new Error(
      'Unexpected error: response contains no "announcements" list',
    );
  }

  return response.data.announcements.map((announcement: any) =>
    announcementFromResponse(announcement),
  );
};
