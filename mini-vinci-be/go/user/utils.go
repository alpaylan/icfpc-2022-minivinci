package user

import (
	"fmt"
	"github.com/golang-jwt/jwt/v4"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"time"
)

func generateJWT(issuer string, secret string, duration time.Duration) (string, error) {
	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
		Issuer:    issuer,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(secret))
}

func validateJWT(tokenString string, secret string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return "", fmt.Errorf("error while parsing token: %v", err)
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return "", fmt.Errorf("invalid jwt")
	}

	return claims.Issuer, nil
}

func GenerateEmailVerificationToken(email string) (string, error) {
	return generateJWT(email, config.Get().JWT.VerificationSecret, time.Hour*config.Get().JWT.VerificationExpireTime)
}

func GenerateRenewPasswordToken(email string) (string, error) {
	return generateJWT(email, config.Get().JWT.RenewPasswordSecret, time.Hour*config.Get().JWT.RenewPasswordExpireTime)
}

func ValidateEmailVerificationToken(token string) (string, error) {
	return validateJWT(token, config.Get().JWT.VerificationSecret)
}

func ValidateRenewPasswordToken(token string) (string, error) {
	return validateJWT(token, config.Get().JWT.RenewPasswordSecret)
}
