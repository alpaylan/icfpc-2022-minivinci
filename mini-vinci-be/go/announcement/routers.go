package announcement

import (
	"github.com/gin-gonic/gin"
)

type AnnouncementRouter struct {
	controller AnnouncementController
}

func (r *AnnouncementRouter) GetAnnouncements(c *gin.Context) {
	c.JSON(r.controller.GetAnnouncements(c))
}
