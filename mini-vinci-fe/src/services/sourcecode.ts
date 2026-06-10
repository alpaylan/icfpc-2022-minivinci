import { AxiosRequestConfig } from 'axios';
import { setAuthToken } from '../utilities/request';
import api from './api';
import { UploadSourceCode, uploadSourceCodeFromResponse } from '../models/sourcecode';

export const uploadSourceCode = async (
  file: File | null,
  authToken: string,
): Promise<UploadSourceCode> => {
  const bodyFormData = new FormData();
  // @ts-ignore
  bodyFormData.append('file', file);

  let request: AxiosRequestConfig = {
    url: '/api/submissions/sourcecode',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: bodyFormData,
  };

  request = setAuthToken(request, authToken);

  const response = await api(request);
  return uploadSourceCodeFromResponse(response.data);
};