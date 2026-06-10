package submission

import (
	"github.com/gin-gonic/gin"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/apiresponses"
	"github.com/icfpcontest2022/mini-vinci/mini-vinci-be/go/logging"
)

type SubmissionRouter struct {
	controller SubmissionController
}

func (r *SubmissionRouter) CreateSubmission(c *gin.Context) {
	var params CreateSubmissionParams

	if err := c.BindUri(&params); err != nil {
		logging.Logger.WithField("location", "CreateSubmission").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	if err := c.Bind(&params); err != nil {
		logging.Logger.WithField("location", "CreateSubmission").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.CreateSubmission(c, params))
}

func (r *SubmissionRouter) RetrieveSubmission(c *gin.Context) {
	var params RetrieveSubmissionParams
	if err := c.BindUri(&params); err != nil {
		logging.Logger.WithField("location", "RetrieveSubmission").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.RetrieveSubmission(c, params))
}

func (r *SubmissionRouter) RejudgeAllSubmission(c *gin.Context) {
	c.JSON(r.controller.RejudgeAllSubmissions(c))
}

func (r *SubmissionRouter) GetSubmissions(c *gin.Context) {
	c.JSON(r.controller.GetSubmissions(c))
}

func (r *SubmissionRouter) UploadSourceCode(c *gin.Context) {
	var params UploadSourceCodeParams

	if err := c.Bind(&params); err != nil {
		logging.Logger.WithField("location", "UploadSourceCode").WithError(err).Warnf("could not bind params")
		c.JSON(apiresponses.BadRequestError(err.Error()))
		return
	}

	c.JSON(r.controller.UploadSourceCode(c, params))
}
