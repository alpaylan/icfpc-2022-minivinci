package result

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/config"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/featureflags"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/user"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/utils"
	"net/http"
)

type ResultRouter struct {
	controller ResultController
}

func (r *ResultRouter) GetUserResults(c *gin.Context) {
	c.JSON(r.controller.GetUserResults(c))
}

func (r *ResultRouter) GetScoreboard(c *gin.Context) {
	usr, _ := user.GetUserFromGinContext(c)

	if featureflags.ShouldUpdateScoreboard() || utils.IsAdminUser(usr.Email) {
		c.JSON(r.controller.GetScoreboard(c))
		return
	}

	log := logging.Logger.WithField("location", "GetScoreboard")

	resp, err := http.Get(config.Get().S3.AssetsBaseURL + "/frozen_scoreboard.json")
	if err != nil {
		log.WithError(err).Errorf("could not download json")
		c.JSON(apiresponses.InternalServerError())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Errorf("unexpected http GET status: %d", resp.StatusCode)
		c.JSON(apiresponses.InternalServerError())
		return
	}

	var returningResponse GetScoreboardResponse
	err = json.NewDecoder(resp.Body).Decode(&returningResponse)
	if err != nil {
		log.WithError(err).Errorf("cannot decode")
		c.JSON(apiresponses.InternalServerError())
		return
	}

	c.JSON(http.StatusOK, returningResponse)
}
