import { AxiosRequestConfig } from 'axios';
import { isArray } from 'lodash';
import { setAuthToken } from '../utilities/request';
import api from './api';
import { Submission, submissionFromResponse } from '../models/submission';

export const getSubmissionsList = async (
  authToken: string,
): Promise<Submission[]> => {
  let request: AxiosRequestConfig = {
    url: '/api/submissions',
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);

  const submissionsList = response?.data?.submissions;
  if (!isArray(submissionsList)) {
    throw new Error('Unexpected error: Response contains no submissions list');
  }

  return submissionsList.map((submission: any, index: number) =>
    submissionFromResponse(submission, index + 1),
  );
};

export const getSubmission = async (
  submissionID: string,
  authToken: string,
): Promise<Submission> => {
  let request: AxiosRequestConfig = {
    url: `/api/submissions/${submissionID}`,
    method: 'get',
    headers: {},
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  return submissionFromResponse(response.data, 0);
};

export const makeNewSubmission = async (
  problemID: string,
  code: string,
  authToken: string,
): Promise<void> => {
  const file = new File([code], 'submission.isl', { type: 'text/plain' });
  const bodyFormData = new FormData();
  bodyFormData.append('file', file);

  let request: AxiosRequestConfig = {
    url: `/api/submissions/${problemID}/create`,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: bodyFormData,
  };

  request = setAuthToken(request, authToken);

  await api(request);
};
