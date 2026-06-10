package user

type CreateUserParams struct {
	Email    string `json:"email" binding:"required,email,max=200"`
	TeamName string `json:"team_name" binding:"required,min=3,max=60"`
	Password string `json:"password" binding:"required,min=6,max=100"`
}

type VerificateUserParams struct {
	Token string `form:"token" binding:"required"`
}

type ResendVerificationEmailParams struct {
	Email string `json:"email" binding:"required,email"`
}

type SendRenewPasswordEmailParams struct {
	Email string `json:"email" binding:"required,email"`
}

type RenewPasswordParams struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6,max=100"`
}
