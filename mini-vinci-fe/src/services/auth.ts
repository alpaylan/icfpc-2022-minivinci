import api from './api';
import { newLoginRequest } from '../models/request/login';
import { newRegisterRequest } from '../models/request/register';
import { newRenewPasswordRequest } from '../models/request/renewPassword';
import { newSendResetLinkRequest } from '../models/request/sendResetLink';
import { newResendVerificationRequest } from '../models/request/resendVerification';

export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  const url = '/api/users/login';
  const res = await api.post(url, newLoginRequest(email, password));
  if (res.data?.token) {
    return res.data.token;
  }
  throw new Error('Unexpected error: no token received after login');
};

export const register = async (
  email: string,
  password: string,
  teamName: string,
): Promise<void> => {
  const url = '/api/users/register';
  await api.post(url, newRegisterRequest(email, password, teamName));
};

export const renewPassword = async (
  password: string,
  token: string,
): Promise<void> => {
  const url = '/api/users/password/renew';
  await api.post(url, newRenewPasswordRequest(password, token));
};

export const sendResetLink = async (email: string): Promise<void> => {
  const url = '/api/users/password/send-renew-email';
  await api.post(url, newSendResetLinkRequest(email));
};

export const resendVerification = async (email: string): Promise<void> => {
  const url = '/api/users/verification/resend-email';
  await api.post(url, newResendVerificationRequest(email));
};
