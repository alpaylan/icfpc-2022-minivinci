package user

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email              string
	TeamName           string
	Password           string
	VerificationToken  string
	RenewPasswordToken string
	IsVerified         bool
}

func (u *User) CheckPassword(password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))

	return err
}
