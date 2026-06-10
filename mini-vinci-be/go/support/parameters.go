package support

type SendMessageParams struct {
	Message string `json:"message" binding:"required"`
}
