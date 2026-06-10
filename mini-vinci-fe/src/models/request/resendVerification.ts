interface ResendVerificationRequest {
  email: string;
}

export const newResendVerificationRequest = (
  email: string,
): ResendVerificationRequest => ({ email });
