package support

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
)

type SupportRouter struct {
	controller SupportController
}

func (r *SupportRouter) GetMessages(c *gin.Context) {
	c.JSON(r.controller.GetMessages(c))
}

func (r *SupportRouter) SendMessage(c *gin.Context) {
	var params SendMessageParams
	if err := c.BindJSON(&params); err != nil {
		logging.Logger.WithField("location", "SendMessage").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.SendMessage(c, params))
}
