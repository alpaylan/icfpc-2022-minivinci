package user

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"net/http"
)

type UserRouter struct {
	controller UserController
}

func (r *UserRouter) CreateUser(c *gin.Context) {
	var params CreateUserParams
	if err := c.BindJSON(&params); err != nil {
		logging.Logger.WithField("location", "CreateUser").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.CreateUser(c, params))
}

func (r *UserRouter) RetrieveUser(c *gin.Context) {
	c.JSON(r.controller.RetrieveUser(c))
}

func (r *UserRouter) VerificateUser(c *gin.Context) {
	var params VerificateUserParams
	if err := c.BindQuery(&params); err != nil {
		logging.Logger.WithField("location", "VerificateUser").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	// todo: handle this in frontend
	code, resp := r.controller.VerificateUser(c, params)
	if code == http.StatusOK {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(
			"<h1>Your email is verified successfully!<h1/>",
		))
		return
	}

	c.JSON(code, resp)
}

func (r *UserRouter) ResendVerificationEmail(c *gin.Context) {
	var params ResendVerificationEmailParams
	if err := c.BindJSON(&params); err != nil {
		logging.Logger.WithField("location", "ResendVerificationEmail").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.ResendVerificationEmail(c, params))
}

func (r *UserRouter) SendRenewPasswordEmail(c *gin.Context) {
	var params SendRenewPasswordEmailParams
	if err := c.BindJSON(&params); err != nil {
		logging.Logger.WithField("location", "SendRenewPasswordEmail").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.SendRenewPasswordEmail(c, params))
}

func (r *UserRouter) RenewPassword(c *gin.Context) {
	var params RenewPasswordParams
	if err := c.BindJSON(&params); err != nil {
		logging.Logger.WithField("location", "RenewPassword").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.RenewPassword(c, params))
}
