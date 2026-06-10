package user

import (
	"fmt"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

func GetUserFromGinContext(c *gin.Context) (User, error) {
	claims := jwt.ExtractClaims(c)

	identity, ok := claims[IdentityKey]
	if !ok {
		return User{}, fmt.Errorf("could not find email in claims")
	}

	email, ok := identity.(string)
	if !ok {
		return User{}, fmt.Errorf("invalid typed email value in claims")
	}

	userStore := NewUserStore()
	user, err := userStore.First(map[string]interface{}{"email": email})
	if err != nil {
		return User{}, fmt.Errorf("could not fetch user with email %s", email)
	}

	return user, nil
}
