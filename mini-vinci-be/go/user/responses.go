package user

type CreateUserResponse struct {
	UserID uint `json:"user_id"`
}

type RetrieveUserResponse struct {
	Email    string `json:"email"`
	TeamName string `json:"team_name"`
}

type VerificateUserResponse struct {
	Email    string `json:"email"`
	Verified bool   `json:"verified"`
}
