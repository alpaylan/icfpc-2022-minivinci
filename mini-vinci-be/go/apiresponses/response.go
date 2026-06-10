package apiresponses

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func InternalServerError() (int, interface{}) {
	return http.StatusInternalServerError, gin.H{"error": "internal server error"}
}

func SuccessMessage(message string) (int, interface{}) {
	return http.StatusOK, gin.H{"message": message}
}

func BadRequestError(error string) (int, interface{}) {
	return http.StatusBadRequest, gin.H{"error": error}
}
