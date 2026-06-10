interface RenewPasswordRequest {
  password: string;
  token: string;
}

export const newRenewPasswordRequest = (
  password: string,
  token: string,
): RenewPasswordRequest => ({
  password,
  token,
});
