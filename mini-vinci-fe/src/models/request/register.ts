interface RegisterRequest {
  email: string;
  password: string;
  team_name: string;
}

export const newRegisterRequest = (
  email: string,
  password: string,
  teamName: string,
): RegisterRequest => ({
  email,
  password,
  team_name: teamName,
});
