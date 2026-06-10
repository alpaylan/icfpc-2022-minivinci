package support

import "gorm.io/gorm"

type SupportMessage struct {
	gorm.Model
	UserID   uint
	Content  string
	IsAnswer bool
}
