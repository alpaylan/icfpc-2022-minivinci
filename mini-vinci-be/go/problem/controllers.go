package problem

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/sirupsen/logrus"
	"net/http"
)

type ProblemController struct{}

func (pc *ProblemController) GetProblems(c *gin.Context) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "GetProblems",
	})

	problemStore := NewProblemStore()

	problems, err := problemStore.Find()
	if err != nil {
		log.WithError(err).Errorf("could not get problems")
		return apiresponses.InternalServerError()
	}

	return http.StatusOK, GetProblemsSerializer{Problems: problems}.Response()
}
