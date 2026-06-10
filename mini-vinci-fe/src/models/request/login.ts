interface LoginRequest {
  email: string;
  password: string;
}

export const newLoginRequest = (
  email: string,
  password: string,
): LoginRequest => ({
  email,
  password,
});
