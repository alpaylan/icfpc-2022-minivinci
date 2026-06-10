package result

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/common"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/problem"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/user"
	"github.com/sirupsen/logrus"
	"net/http"
)

type ResultController struct{}

func (rc *ResultController) GetUserResults(c *gin.Context) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "GetUserResults",
	})

	usr, err := user.GetUserFromGinContext(c)
	if err != nil {
		log.WithError(err).Errorf("could not get user from context")
		return apiresponses.InternalServerError()
	}

	problemStore := problem.NewProblemStore()
	problems, err := problemStore.Find()
	if err != nil {
		log.WithError(err).Errorf("could not get problems")
		return apiresponses.InternalServerError()
	}

	resultStore := common.NewResultStore()
	results, err := resultStore.Find(map[string]interface{}{
		"user_id": usr.ID,
	})
	if err != nil {
		log.WithError(err).Errorf("could not get results of the user")
		return apiresponses.InternalServerError()
	}

	problemBestCosts, err := resultStore.GetProblemBestCosts()
	if err != nil {
		log.WithError(err).Errorf("could not get best costs of problems")
		return apiresponses.InternalServerError()
	}

	return http.StatusOK, GetUserResultsSerializer{
		Problems:         problems,
		Results:          results,
		ProblemBestCosts: problemBestCosts,
	}.Response()
}

func (rc *ResultController) GetScoreboard(c *gin.Context) (int, interface{}) {
	log := logging.Logger.WithFields(logrus.Fields{
		"location": "GetScoreboard",
	})

	userStore := user.NewUserStore()
	users, err := userStore.Find()
	if err != nil {
		log.WithError(err).Errorf("could not get users")
		return apiresponses.InternalServerError()
	}

	problemStore := problem.NewProblemStore()
	problems, err := problemStore.Find()
	if err != nil {
		log.WithError(err).Errorf("could not get problems")
		return apiresponses.InternalServerError()
	}

	resultStore := common.NewResultStore()
	results, err := resultStore.Find(map[string]interface{}{})
	if err != nil {
		log.WithError(err).Errorf("could not get results")
		return apiresponses.InternalServerError()
	}

	return http.StatusOK, GetScoreboardSerializer{
		Users:    users,
		Problems: problems,
		Results:  results,
	}.Response()
}
