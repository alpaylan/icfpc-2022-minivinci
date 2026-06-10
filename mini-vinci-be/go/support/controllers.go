package support

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/user"
	"github.com/sirupsen/logrus"
	"net/http"
)

type SupportController struct{}

func (sc *SupportController) GetMessages(c *gin.Context) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "GetMessages",
	})

	usr, err := user.GetUserFromGinContext(c)
	if err != nil {
		log.WithError(err).Errorf("could not get user from context")
		return apiresponses.InternalServerError()
	}

	supportMessageStore := NewSupportMessageStore()

	supportMessages, err := supportMessageStore.Find(map[string]interface{}{
		"user_id": usr.ID,
	})
	if err != nil {
		log.WithError(err).Errorf("could not get support messages")
		return apiresponses.InternalServerError()
	}

	return http.StatusOK, GetSupportMessagesSerializer{SupportMessages: supportMessages}.Response()
}

func (sc *SupportController) SendMessage(c *gin.Context, params SendMessageParams) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "SendMessage",
	})

	usr, err := user.GetUserFromGinContext(c)
	if err != nil {
		log.WithError(err).Errorf("could not get user from context")
		return apiresponses.InternalServerError()
	}

	supportMessageStore := NewSupportMessageStore()

	_, err = supportMessageStore.Create(SupportMessage{
		UserID:   usr.ID,
		Content:  params.Message,
		IsAnswer: false,
	})
	if err != nil {
		log.WithError(err).Errorf("could not create support message")
		return apiresponses.InternalServerError()
	}

	return apiresponses.SuccessMessage("support message sent successfully")
}
