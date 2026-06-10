package problem

import (
	"github.com/gin-gonic/gin"
)

type ProblemRouter struct {
	controller ProblemController
}

func (r *ProblemRouter) GetProblems(c *gin.Context) {
	c.JSON(r.controller.GetProblems(c))
}
