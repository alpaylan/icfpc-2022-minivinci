package user

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/async"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/email"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

type UserController struct{}

func (uc *UserController) CreateUser(c *gin.Context, params CreateUserParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "CreateUser",
	})

	userStore := NewUserStore()

	cnt, err := userStore.Count(map[string]interface{}{"email": params.Email})
	if err != nil {
		log.WithError(err).Errorf("could not check if there is another user with same email")
		return apiresponses.InternalServerError()
	}
	if cnt > 0 {
		log.Warnf("there is already a registration with email %s", params.Email)
		return apiresponses.BadRequestError("there is already a registration with this email")
	}

	cnt, err = userStore.Count(map[string]interface{}{"team_name": params.TeamName})
	if err != nil {
		log.WithError(err).Errorf("could not check if there is another user with same team name")
		return apiresponses.InternalServerError()
	}
	if cnt > 0 {
		log.Warnf("there is already a registration with team name %s", params.TeamName)
		return apiresponses.BadRequestError("there is already a registration with this team name")
	}

	// When email is disabled there is no way to deliver a verification link, so
	// accounts are considered verified immediately.
	userToCreate := User{
		Email:      params.Email,
		TeamName:   params.TeamName,
		IsVerified: !config.Get().Email.Enabled,
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		log.WithError(err).Errorf("could not hash password")
		return apiresponses.InternalServerError()
	}
	userToCreate.Password = string(hashedPassword)

	verificationToken, err := GenerateEmailVerificationToken(params.Email)
	if err != nil {
		log.WithError(err).Errorf("could not generate email verification token")
		return apiresponses.InternalServerError()
	}
	userToCreate.VerificationToken = verificationToken

	createdUser, err := userStore.Create(userToCreate)
	if err != nil {
		log.WithError(err).Errorf("could not create user")
		return apiresponses.InternalServerError()
	}

	if config.Get().Email.Enabled {
		err = async.NewEmailDeliveryTask(email.EmailDeliveryPayload{
			Receiver: userToCreate.Email,
			Subject:  "Verificate Your Robo Vinci Account",
			HTMLBody: email.RenderVerificationEmailTemplate(email.TemplateValues{
				TeamName: createdUser.TeamName,
				Link:     config.Get().Email.VerificationURL + "?token=" + verificationToken,
			}),
		})
		if err != nil {
			log.WithError(err).Errorf("could not send verification email")
			return apiresponses.InternalServerError()
		}
	}

	return http.StatusOK, CreateUserResponse{
		UserID: createdUser.ID,
	}
}

func (uc *UserController) RetrieveUser(c *gin.Context) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "RetrieveUser",
	})

	usr, err := GetUserFromGinContext(c)
	if err != nil {
		log.WithError(err).Errorf("could not get user from context")
		return apiresponses.InternalServerError()
	}

	return http.StatusOK, RetrieveUserResponse{
		Email:    usr.Email,
		TeamName: usr.TeamName,
	}
}

func (uc *UserController) VerificateUser(c *gin.Context, params VerificateUserParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "VerificateUser",
	})

	email, err := ValidateEmailVerificationToken(params.Token)
	if err != nil {
		log.Println("could not validate verification token:", err)
		return apiresponses.InternalServerError()
	}

	userStore := NewUserStore()

	user, err := userStore.First(map[string]interface{}{"email": email})
	if err != nil {
		log.Println("could not get user", err)
		return http.StatusInternalServerError, gin.H{"error": "internal server error"}
	}

	if user.VerificationToken != params.Token {
		log.Println("invalid verification token", err)
		return http.StatusBadRequest, gin.H{"error": "invalid token"}
	}

	if user.IsVerified {
		log.Println("already verified", err)
		return http.StatusBadRequest, gin.H{"error": "already verified"}
	}

	err = userStore.Update(user.ID, map[string]interface{}{
		"is_verified":        true,
		"verification_token": "",
	})
	if err != nil {
		log.Println("could not update user", err)
		return http.StatusBadRequest, gin.H{"error": "internal server error"}
	}

	return http.StatusOK, VerificateUserResponse{
		Email:    email,
		Verified: true,
	}
}

func (uc *UserController) ResendVerificationEmail(c *gin.Context, params ResendVerificationEmailParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "ResendVerificationEmail",
	})

	userStore := NewUserStore()

	user, err := userStore.First(map[string]interface{}{"email": params.Email})
	if err != nil {
		log.Println("could not get user", err)
		return apiresponses.InternalServerError()
	}

	if user.IsVerified {
		log.Println("already verified", err)
		return http.StatusBadRequest, gin.H{"error": "already verified"}
	}

	verificationToken, err := GenerateEmailVerificationToken(params.Email)
	if err != nil {
		log.WithError(err).Errorf("could not generate email verification token")
		return apiresponses.InternalServerError()
	}

	err = userStore.Update(user.ID, map[string]interface{}{
		"verification_token": verificationToken,
	})
	if err != nil {
		log.WithError(err).Errorf("could not update user")
		return apiresponses.InternalServerError()
	}

	err = async.NewEmailDeliveryTask(email.EmailDeliveryPayload{
		Receiver: user.Email,
		Subject:  "Verificate Your Robo Vinci Account",
		HTMLBody: email.RenderVerificationEmailTemplate(email.TemplateValues{
			TeamName: user.TeamName,
			Link:     config.Get().Email.VerificationURL + "?token=" + verificationToken,
		}),
	})

	return apiresponses.SuccessMessage("verification email sent successfully")
}

func (uc *UserController) SendRenewPasswordEmail(c *gin.Context, params SendRenewPasswordEmailParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "SendRenewPasswordEmail",
	})

	userStore := NewUserStore()

	user, err := userStore.First(map[string]interface{}{"email": params.Email})
	if err != nil {
		log.Println("could not get user", err)
		return apiresponses.InternalServerError()
	}

	renewPasswordToken, err := GenerateRenewPasswordToken(params.Email)
	if err != nil {
		log.WithError(err).Errorf("could not generate renew password token")
		return apiresponses.InternalServerError()
	}

	err = userStore.Update(user.ID, map[string]interface{}{
		"renew_password_token": renewPasswordToken,
	})
	if err != nil {
		log.WithError(err).Errorf("could not update user user")
		return apiresponses.InternalServerError()
	}

	err = async.NewEmailDeliveryTask(email.EmailDeliveryPayload{
		Receiver: user.Email,
		Subject:  "Renew Password of Your Robo Vinci Account",
		HTMLBody: email.RenderRenewPasswordEmailTemplate(email.TemplateValues{
			TeamName: user.TeamName,
			Link:     config.Get().Email.RenewPasswordURL + "?token=" + renewPasswordToken,
		}),
	})
	if err != nil {
		log.WithError(err).Errorf("could not send verification email")
		return apiresponses.InternalServerError()
	}

	return apiresponses.SuccessMessage("renew password email sent successfully")
}

func (uc *UserController) RenewPassword(c *gin.Context, params RenewPasswordParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "RenewPassword",
	})

	email, err := ValidateRenewPasswordToken(params.Token)
	if err != nil {
		log.WithError(err).Errorf("could not validate renew password token")
		return apiresponses.InternalServerError()
	}

	userStore := NewUserStore()

	user, err := userStore.First(map[string]interface{}{"email": email})
	if err != nil {
		log.Println("could not get user", err)
		return apiresponses.InternalServerError()
	}

	if user.RenewPasswordToken != params.Token {
		log.Println("invalid renew password token", err)
		return apiresponses.BadRequestError("given token is invalid")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		log.WithError(err).Errorf("could not hash password")
		return apiresponses.InternalServerError()
	}

	err = userStore.Update(user.ID, map[string]interface{}{
		"password":             hashedPassword,
		"renew_password_token": "",
	})
	if err != nil {
		log.WithError(err).Errorf("could not update user")
		return apiresponses.InternalServerError()
	}

	return apiresponses.SuccessMessage("password renewed successfully")
}
